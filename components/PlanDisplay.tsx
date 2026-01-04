
import React, { useState, useMemo, useEffect } from 'react';
import { TransformationPlan, Goal, ProgressEntry, UserProfile, Exercise } from '../types';
import { Zap, ChevronRight, ChevronLeft, Info, LineChart, AlertTriangle, CircleCheck, HeartPulse, Send, Youtube } from 'lucide-react';
import ProgressTracker from './ProgressTracker';
import M3Button from './M3Button';
import ExerciseGuideModal from './ExerciseGuideModal';
import { getAlternativeExercise } from '../services/geminiService';
import PlanOverview from './PlanOverview';
import DietPlanSection from './DietPlanSection';
import WorkoutPlanSection from './WorkoutPlanSection';
import BottomNavBar from './BottomNavBar';
import GeneratingPlanIllustration from './GeneratingPlanIllustration';

interface PlanDisplayProps {
  plan: TransformationPlan;
  goal: Goal;
  profile: UserProfile;
  progressHistory: ProgressEntry[];
  currentWeek: number;
  onAddProgress: (entry: ProgressEntry) => void;
  onRefreshPlan: () => void;
  onUpdatePlanLocally: (updatedPlan: TransformationPlan) => void;
  isRefreshing: boolean;
  onEditGoals: () => void;
  completedWorkouts: Record<string, boolean>;
  onMarkDayWorkoutComplete: (dateKey: string) => void;
  currentWeekStartDate: string;
}

// Define the daysOfWeek array, starting with Sunday (index 0) to match Date.getDay()
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper function to get a calendar date key (YYYY-MM-DD) for a given offset from today
const getWorkoutCalendarDate = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10); // Format YYYY-MM-DD
};

const PlanDisplay: React.FC<PlanDisplayProps> = ({
  plan,
  goal,
  profile,
  progressHistory,
  currentWeek,
  onAddProgress,
  onRefreshPlan,
  onUpdatePlanLocally,
  isRefreshing,
  onEditGoals,
  completedWorkouts,
  onMarkDayWorkoutComplete,
  currentWeekStartDate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'diet' | 'workout' | 'progress'>('overview');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [swappingExercise, setSwappingExercise] = useState<string | null>(null);
  const [activeWorkoutCard, setActiveWorkoutCard] = useState(0);
  const [activeDietDayIndex, setActiveDietDayIndex] = useState(0);
  const [showCompletionToast, setShowCompletionToast] = useState(false);

  // Effect to set activeDietDayIndex and activeWorkoutCard to the current actual day on initial load
  useEffect(() => {
    setActiveDietDayIndex(new Date().getDay());
    setActiveWorkoutCard(0); // Ensure activeWorkoutCard always defaults to 0 on initial mount
  }, []); // Run only once on mount

  // Re-align the workout plan based on the current week start date
  const alignedWorkoutPlan = useMemo(() => {
    if (!plan.workoutPlan || plan.workoutPlan.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(currentWeekStartDate);
    startDate.setHours(0, 0, 0, 0);

    // Calculate days passed since start of the plan week
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate the offset for "Today" in the plan array.
    // If today matches startDate, offset is 0.
    const startOffset = ((diffDays % 7) + 7) % 7; 

    // Rotate the plan so the element corresponding to "Today" is at index 0
    const rotatedPlan = [
        ...plan.workoutPlan.slice(startOffset),
        ...plan.workoutPlan.slice(0, startOffset)
    ];

    const currentActualDayIndex = today.getDay(); // 0=Sunday, 1=Monday...

    return rotatedPlan.map((dayData, index) => {
        // Calculate the actual day name (Sunday, Monday...) for this card
        const realDayIndex = (currentActualDayIndex + index) % 7;
        return {
            ...dayData,
            actualDayName: daysOfWeek[realDayIndex],
            isToday: index === 0
        };
    });
  }, [plan.workoutPlan, currentWeekStartDate]);

  // Calculate the original session number (1-7) for the active card
  const originalSessionNumber = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(currentWeekStartDate);
    startDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const startOffset = ((diffDays % 7) + 7) % 7;

    // The original index in the plan array is (startOffset + activeWorkoutCard) % 7
    // Session number is 1-based index
    const originalIndex = (startOffset + activeWorkoutCard) % 7;
    return originalIndex + 1;
  }, [currentWeekStartDate, activeWorkoutCard]);

  type ExerciseSection = 'warmUpExercises' | 'exercises' | 'rehabExercises' | 'coolDownExercises';

  const handleSwapExercise = async (dayIndex: number, exerciseIndex: number, currentEx: Exercise, sectionType: ExerciseSection) => {
    const swapKey = `${dayIndex}-${sectionType}-${exerciseIndex}`;
    setSwappingExercise(swapKey);

    try {
      const alternative = await getAlternativeExercise(currentEx, profile);

      const newPlan = { ...plan };
      const newWorkoutPlan = [...(newPlan.workoutPlan || [])];

      // Calculate the correct index in the original plan array
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(currentWeekStartDate);
      startDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const startOffset = ((diffDays % 7) + 7) % 7;
      const originalPlanIndex = (startOffset + dayIndex) % 7;

      if (newWorkoutPlan[originalPlanIndex]) {
        const newDay = { ...newWorkoutPlan[originalPlanIndex] };

        // Ensure the array exists and update it
        const targetExercises = [...(newDay[sectionType] || [])];
        if (targetExercises[exerciseIndex]) {
          targetExercises[exerciseIndex] = { ...alternative, isAlternative: true };
          newDay[sectionType] = targetExercises;
          newWorkoutPlan[originalPlanIndex] = newDay;
          newPlan.workoutPlan = newWorkoutPlan;
          onUpdatePlanLocally(newPlan);
        }
      }
    } catch (e) {
      console.error("Exercise swap failed:", e);
    } finally {
      setSwappingExercise(null);
    }
  };

  const handleSessionCompletionConfirmed = () => {
    const currentWorkoutDateKey = getWorkoutCalendarDate(activeWorkoutCard);
    onMarkDayWorkoutComplete(currentWorkoutDateKey); // Pass the date key for the currently active workout card
    setShowCompletionToast(true); // Show local toast
    setTimeout(() => setShowCompletionToast(false), 3000); // Hide after 3 seconds
  };

  // Logic for enabling the "Initiate Weekly Check-in" button
  const isWeeklyCheckInEnabled = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    const currentWeekStart = new Date(currentWeekStartDate);
    currentWeekStart.setHours(0, 0, 0, 0); // Normalize start of week to start of day

    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6); // Set to end of the 7-day period

    const isPastCurrentWeekEnd = today.getTime() >= currentWeekEnd.getTime();

    let allWorkoutsCompletedForCurrentWeek = true;
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      if (!completedWorkouts[dateKey]) {
        allWorkoutsCompletedForCurrentWeek = false;
        break;
      }
    }
    return isPastCurrentWeekEnd && allWorkoutsCompletedForCurrentWeek;
  }, [currentWeekStartDate, completedWorkouts]);


  if (!plan || !plan.dailyDietPlans || !plan.workoutPlan || plan.dailyDietPlans.length !== 7) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <GeneratingPlanIllustration />
        <h3 className="font-bold text-lg text-[var(--md-sys-color-on-surface)] mt-4">Generating your plan...</h3>
        <p className="text-sm text-gray-500 mt-2">Hang tight while we tailor your transformation.</p>
      </div>
    );
  }

  const currentDailyDietPlan = plan.dailyDietPlans[activeDietDayIndex] || plan.dailyDietPlans[0];


  return (
    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {showCompletionToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[120] bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
          <CircleCheck size={20} />
          <span className="font-semibold">Workout Session Completed! Great job!</span>
        </div>
      )}

      {activeTab === 'overview' && (
        <PlanOverview
          plan={plan}
          profile={profile}
          currentWeek={currentWeek}
          onEditGoals={onEditGoals}
        />
      )}

      {activeTab === 'diet' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Day Navigation for Diet Plan */}
          <div className="flex items-center justify-between px-4 mb-4">
            <button
              onClick={() => setActiveDietDayIndex(prev => (prev - 1 + 7) % 7)}
              className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)] disabled:opacity-20 transition-all active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-center">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">
                Daily Diet Plan
              </span>
              <h3 className="font-black text-[var(--md-sys-color-primary)] text-sm uppercase">
                {daysOfWeek[activeDietDayIndex]}'s Fuel
              </h3>
            </div>
            <button
              onClick={() => setActiveDietDayIndex(prev => (prev + 1) % 7)}
              className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)] disabled:opacity-20 transition-all active:scale-90"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <DietPlanSection
            currentDailyDietPlan={currentDailyDietPlan}
            activeDietDayName={daysOfWeek[activeDietDayIndex]}
          />
        </div>
      )}

      {activeTab === 'workout' && (
        <WorkoutPlanSection
          plan={plan}
          alignedWorkoutPlan={alignedWorkoutPlan}
          activeWorkoutCard={activeWorkoutCard}
          originalSessionNumber={originalSessionNumber}
          isRefreshing={isRefreshing}
          profile={profile}
          completedWorkouts={completedWorkouts}
          onMarkDayWorkoutComplete={handleSessionCompletionConfirmed} // Use the local handler here
          swappingExercise={swappingExercise}
          handleSwapExercise={handleSwapExercise}
          setSelectedExercise={setSelectedExercise}
          handleNextWorkout={() => setActiveWorkoutCard(prev => (prev + 1) % alignedWorkoutPlan.length)}
          handlePrevWorkout={() => setActiveWorkoutCard(prev => (prev - 1 + alignedWorkoutPlan.length) % alignedWorkoutPlan.length)}
          getWorkoutCalendarDate={getWorkoutCalendarDate}
        />
      )}

      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[var(--md-sys-color-primary)] to-blue-700 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Weekly Check-in</h3>
              {isWeeklyCheckInEnabled ? (
                <>
                  <p className="text-xs text-white/80 font-medium mb-6">
                    All workouts are complete! Time to log your progress and unlock your next phase.
                  </p>
                  <M3Button
                    onClick={() => { /* This button can optionally scroll to the ProgressTracker form */ }}
                    className="!bg-white !text-[var(--md-sys-color-primary)] shadow-xl"
                    fullWidth
                  >
                    <Youtube size={18} /> Proceed to Progress Log
                  </M3Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-white/80 font-medium mb-6">
                    Complete all sessions and reach the end of Week {currentWeek} to initiate the weekly sync.
                  </p>
                  <M3Button
                    disabled={true} // Always disabled if not ready
                    className="!bg-white !text-[var(--md-sys-color-primary)] opacity-70 shadow-xl"
                    fullWidth
                  >
                    <Youtube size={18} /> Weekly Sync Pending
                  </M3Button>
                </>
              )}
            </div>
          </div>
          <ProgressTracker
            history={progressHistory}
            onAddEntry={(entry) => {
              onAddProgress({ ...entry, weekNumber: currentWeek });
              onRefreshPlan();
            }}
            isWeeklyCheckInEnabled={isWeeklyCheckInEnabled}
            currentProfile={profile}
          />
        </div>
      )}

      {/* Sticky Bottom Navigation Bar */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {selectedExercise && (
        <ExerciseGuideModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
};

export default PlanDisplay;

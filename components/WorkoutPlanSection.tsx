
import React from 'react';
import { TransformationPlan, UserProfile, Exercise } from '../types';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import WorkoutDayCard from './WorkoutDayCard';

type AlignedWorkoutDay = TransformationPlan['workoutPlan'][number] & { actualDayName: string; isToday: boolean };
type ExerciseSection = 'warmUpExercises' | 'exercises' | 'rehabExercises' | 'coolDownExercises';

interface WorkoutPlanSectionProps {
  plan: TransformationPlan;
  alignedWorkoutPlan: AlignedWorkoutDay[];
  activeWorkoutCard: number;
  originalSessionNumber: number;
  isRefreshing: boolean;
  profile: UserProfile;
  completedWorkouts: Record<string, boolean>;
  onMarkDayWorkoutComplete: (dateKey: string) => void;
  swappingExercise: string | null;
  handleSwapExercise: (dayIndex: number, exerciseIndex: number, currentEx: Exercise, sectionType: ExerciseSection) => Promise<void>;
  setSelectedExercise: (exercise: Exercise | null) => void;
  handleNextWorkout: () => void;
  handlePrevWorkout: () => void;
  currentViewedWorkoutDateKey: string; // Updated to receive the pre-calculated date key
}

const WorkoutPlanSection: React.FC<WorkoutPlanSectionProps> = ({
  plan,
  alignedWorkoutPlan,
  activeWorkoutCard,
  originalSessionNumber,
  isRefreshing,
  profile,
  completedWorkouts,
  onMarkDayWorkoutComplete,
  swappingExercise,
  handleSwapExercise,
  setSelectedExercise,
  handleNextWorkout,
  handlePrevWorkout,
  currentViewedWorkoutDateKey, // Destructure the new prop
}) => {

  const currentWorkoutDay = alignedWorkoutPlan[activeWorkoutCard];
  const isCardForToday = currentWorkoutDay?.isToday || false;
  // Use the passed currentViewedWorkoutDateKey directly
  const isCurrentWorkoutCompletedForDate = completedWorkouts[currentViewedWorkoutDateKey];

  if (!plan.workoutPlan || !currentWorkoutDay) {
    return (
      <div className="text-center p-6 text-gray-500">
        {isRefreshing ? <Loader2 className="animate-spin inline-block mr-2" /> : null} Loading workout plan...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Workout Carousel Controls */}
      <div className="flex items-center justify-between px-4 mb-4">
        <button
          onClick={handlePrevWorkout}
          className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)] disabled:opacity-20 transition-all active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">
            Session {originalSessionNumber} of {plan.workoutPlan.length}
          </span>
          <h3 className="font-black text-[var(--md-sys-color-primary)] text-sm uppercase">
            Phase One Focus
          </h3>
        </div>
        <button
          onClick={handleNextWorkout}
          className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)] disabled:opacity-20 transition-all active:scale-90"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Individual Day Card */}
      <WorkoutDayCard
        workoutDay={currentWorkoutDay}
        originalSessionNumber={originalSessionNumber}
        isCardForToday={isCardForToday}
        isCurrentWorkoutCompletedForDate={isCurrentWorkoutCompletedForDate}
        onMarkDayWorkoutComplete={onMarkDayWorkoutComplete}
        currentViewedWorkoutDateKey={currentViewedWorkoutDateKey} // Pass the correctly derived date key
        swappingExercise={swappingExercise}
        handleSwapExercise={handleSwapExercise}
        setSelectedExercise={setSelectedExercise}
        profile={profile}
        dayIndex={activeWorkoutCard} // Pass the activeWorkoutCard as dayIndex
      />

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5">
        {alignedWorkoutPlan.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${activeWorkoutCard === i ? 'w-6 bg-[var(--md-sys-color-primary)]' : 'w-1.5 bg-[var(--md-sys-color-outline)]/20'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkoutPlanSection;
    
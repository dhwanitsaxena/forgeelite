import React, { useState, useMemo, useEffect } from 'react';
import { TransformationPlan, Goal, ProgressEntry, UserProfile, Exercise, WorkoutDay, Meal, DietPlan, ExperienceLevel } from '../types';
import { Utensils, Dumbbell, Zap, ChevronRight, ChevronLeft, Info, LineChart, AlertTriangle, Book, Loader2, Heart, Eye, Shuffle, ArrowRightLeft, Sparkles, ShieldAlert, HeartPulse, Send, Pill, Beaker, Play, Activity, Target, Calendar, Apple, Pencil, Sunrise, Sun, Moon, Footprints, Flame, Rewind } from 'lucide-react'; // Added Sunrise, Sun, Moon, Footprints, Flame, Rewind
import ProgressTracker from './ProgressTracker';
import M3Button from './M3Button';
import ExerciseGuideModal from './ExerciseGuideModal';
import { getAlternativeExercise } from '../services/geminiService';

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
  onEditGoals: () => void; // New prop for editing goals
}

// Define the daysOfWeek array, starting with Sunday (index 0) to match Date.getDay()
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
  onEditGoals // Destructure new prop
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'diet' | 'workout' | 'progress'>('overview');
  // Updated state to hold exercise data along with its indices and sectionType
  const [selectedExerciseData, setSelectedExerciseData] = useState<{ exercise: Exercise; dayIndex: number; exerciseIndex: number; sectionType: 'warmUpExercises' | 'exercises' | 'rehabExercises' | 'coolDownExercises' } | null>(null);
  const [swappingExercise, setSwappingExercise] = useState<string | null>(null);
  const [activeWorkoutCard, setActiveWorkoutCard] = useState(0); // Initialize to 0, alignedWorkoutPlan[0] is always "today"
  const [activeDietDayIndex, setActiveDietDayIndex] = useState(0); // New state for daily diet plan

  // Effect to set activeDietDayIndex to today's actual day on initial load
  useEffect(() => {
    const todayIndex = new Date().getDay(); // 0 for Sunday, 1 for Monday, etc.
    setActiveDietDayIndex(todayIndex); // Align diet plan to today's day
  }, []);

  // Re-align the workout plan so "Day 1" of the AI plan starts "Today"
  const alignedWorkoutPlan = useMemo(() => {
    if (!plan.workoutPlan) return [];
    
    const todayIndex = new Date().getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    return plan.workoutPlan.map((dayData, index) => {
      const realDayIndex = (todayIndex + index) % 7;
      return {
        ...dayData,
        actualDayName: daysOfWeek[realDayIndex],
        isToday: index === 0
      };
    });
  }, [plan.workoutPlan]);

  type ExerciseSection = 'warmUpExercises' | 'exercises' | 'rehabExercises' | 'coolDownExercises';

  const handleSwapExercise = async (dayIndex: number, exerciseIndex: number, currentEx: Exercise, sectionType: ExerciseSection) => {
    const swapKey = `${dayIndex}-${sectionType}-${exerciseIndex}`;
    setSwappingExercise(swapKey);
    
    try {
      const alternative = await getAlternativeExercise(currentEx, profile);
      
      const newPlan = { ...plan };
      const newWorkoutPlan = [...(newPlan.workoutPlan || [])];
      
      if (newWorkoutPlan[dayIndex]) {
        const newDay = { ...newWorkoutPlan[dayIndex] };
        
        // Ensure the array exists and update it
        const targetExercises = [...(newDay[sectionType] || [])];
        if (targetExercises[exerciseIndex]) {
          targetExercises[exerciseIndex] = { ...alternative, isAlternative: true };
          newDay[sectionType] = targetExercises;
          newWorkoutPlan[dayIndex] = newDay;
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

  // Function to update an exercise's form image/description (for caching)
  const handleUpdateExerciseForm = (updatedExercise: Exercise, dayIndex: number, exerciseIndex: number, sectionType: ExerciseSection) => {
    const newPlan = { ...plan };
    const newWorkoutPlan = [...(newPlan.workoutPlan || [])];
    
    if (newWorkoutPlan[dayIndex]) {
      const newDay = { ...newWorkoutPlan[dayIndex] };
      
      // Ensure the array exists and update it
      const targetExercises = [...(newDay[sectionType] || [])];
      if (targetExercises[exerciseIndex]) {
        targetExercises[exerciseIndex] = updatedExercise;
        newDay[sectionType] = targetExercises;
        newPlan.workoutPlan = newWorkoutPlan;
        onUpdatePlanLocally(newPlan);
      }
    }
  };

  // Helper function to clean exercise names (remove content in parentheses)
  const cleanExerciseName = (name: string): string => {
    return name.replace(/\s*\(.*?\)\s*/g, '').trim();
  };

  if (!plan || !plan.dailyDietPlans || !plan.workoutPlan || plan.dailyDietPlans.length !== 7) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h3 className="font-bold text-lg text-[var(--md-sys-color-on-surface)]">Forge Sync in Progress...</h3>
        <p className="text-sm text-gray-500 mt-2">Finalizing elite nutrition and training protocols.</p>
        <M3Button onClick={() => window.location.reload()} variant="tonal" className="mt-6">Restart Sync</M3Button>
      </div>
    );
  }

  const transformationProgress = Math.min(100, (currentWeek / (plan.estimatedWeeks || 12)) * 100);
  const currentDailyDietPlan = plan.dailyDietPlans[activeDietDayIndex] || plan.dailyDietPlans[0];

  return (
    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Transformation Timeline Header */}
      <div className="bg-[var(--md-sys-color-surface)] p-6 rounded-[32px] border border-[var(--md-sys-color-outline)]/10 shadow-sm mb-6 animate-in slide-in-from-top-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[var(--md-sys-color-primary)]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Timeline</h3>
          </div>
          <span className="text-xs font-black bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] px-3 py-1 rounded-full uppercase">
            Week {currentWeek} of {plan.estimatedWeeks}
          </span>
        </div>
        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--md-sys-color-primary)] to-cyan-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${transformationProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center italic font-medium">
          "Patience is the primary variable for lasting metabolic change."
        </p>
      </div>

      <div className="space-y-6 pb-32">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Composition Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--md-sys-color-primary-container)] p-6 rounded-[32px] shadow-sm">
                <span className="text-xs font-black uppercase tracking-widest block mb-1 opacity-70">Daily Fuel</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-[var(--md-sys-color-primary)] text-4xl font-black">{plan.dailyCalories}</span>
                  <span className="text-[var(--md-sys-color-on-primary-container)] text-xs font-bold">kcal</span>
                </div>
              </div>
              <div className="bg-[var(--md-sys-color-secondary-container)] p-6 rounded-[32px] shadow-sm">
                <span className="text-xs font-black uppercase tracking-widest block mb-1 opacity-70">Macro Split</span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-blue-500">Protein</span>
                    <span>{plan.macros?.protein}g</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-green-500">Carbs</span>
                    <span>{plan.macros?.carbs}g</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-orange-500">Fats</span>
                    <span>{plan.macros?.fats}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sculpting Targets Analysis */}
            <div className="bg-[var(--md-sys-color-surface)] p-6 rounded-[32px] border border-[var(--md-sys-color-outline)]/10 shadow-sm">
               <div className="flex justify-between items-center mb-6"> {/* Flex container for title and button */}
                 <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-[var(--md-sys-color-primary)]">
                   <Target size={16} /> Sculpting Benchmarks
                 </h3>
                 <M3Button onClick={onEditGoals} variant="text" className="!p-0 !min-w-0 !h-auto"> {/* Edit button */}
                   <Pencil size={18} />
                 </M3Button>
               </div>
               
               <div className="space-y-5">
                  {[
                    { label: 'Weight', cur: profile.weight, tar: profile.targets.weight, unit: 'kg' },
                    { label: 'Body Fat', cur: profile.currentComposition.bodyFatPercentage, tar: profile.targets.bodyFatPercentage, unit: '%' },
                    { label: 'Waist', cur: profile.currentComposition.waistSize, tar: profile.targets.waistSize, unit: 'cm' }
                  ].map((item, idx) => {
                    const diff = Math.abs(item.cur - item.tar);
                    const progress = Math.min(100, Math.max(5, 100 - (diff / (item.cur || 1) * 100)));
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-xs font-black uppercase mb-1.5">
                          <span className="text-[var(--md-sys-color-on-surface-variant)]">{item.label}</span>
                          <span className="text-[var(--md-sys-color-primary)]">{item.cur}{item.unit} → {item.tar}{item.unit}</span>
                        </div>
                        <div className="h-2 bg-[var(--md-sys-color-secondary-container)] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[var(--md-sys-color-primary)] rounded-full transition-all duration-1000" 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            <div className="bg-[var(--md-sys-color-surface)] p-6 rounded-[32px] border border-[var(--md-sys-color-outline)]/10 shadow-sm relative overflow-hidden">
               <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-3 text-[var(--md-sys-color-primary)]">
                 <Activity size={16} /> Biomechanical Insight
               </h3>
               <p className="text-sm font-medium leading-relaxed text-[var(--md-sys-color-on-surface)] mb-2">{plan.summary}</p>
               <p className="text-xs text-gray-500 italic mt-3">
                 "Achieve your target goals in approximately <span className="font-bold text-[var(--md-sys-color-primary)]">{plan.estimatedWeeks} weeks</span> with consistent dedication."
               </p>
            </div>
          </div>
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


             {[
               { title: 'Breakfast', meal: currentDailyDietPlan.breakfast, icon: Sunrise, iconColor: 'text-amber-500' },
               { title: 'Lunch', meal: currentDailyDietPlan.lunch, icon: Sun, iconColor: 'text-yellow-500' },
               { title: 'Dinner', meal: currentDailyDietPlan.dinner, icon: Moon, iconColor: 'text-blue-500' },
             ].map((item) => item.meal && (
               <div key={item.title} className="bg-[var(--md-sys-color-surface)] rounded-[32px] border border border-[var(--md-sys-color-outline)]/10 shadow-sm overflow-hidden transition-transform hover:scale-[1.01]">
                 {/* Removed item.meal.imageUrl rendering */}
                 <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                           <item.icon size={24} className={item.iconColor} />
                           <h4 className="text-[var(--md-sys-color-on-surface)] font-black text-xl leading-tight">
                             {item.meal.name}
                           </h4>
                        </div>
                    </div>
                    {/* Calorie chip moved below meal title */}
                    <div className="bg-[var(--md-sys-color-primary-container)] px-3 py-1 rounded-full w-fit mb-3">
                      <span className="text-xs font-black text-[var(--md-sys-color-on-primary-container)]">{item.meal.calories} kcal</span>
                    </div>
                    <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">{item.meal.description}</p>
                 </div>
               </div>
             ))}

            {/* Snacks Section */}
            {currentDailyDietPlan.snacks && currentDailyDietPlan.snacks.length > 0 && (
              <div className="bg-[var(--md-sys-color-surface)] p-6 rounded-[32px] border border-[var(--md-sys-color-outline)]/10 shadow-sm">
                <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4 text-green-600">
                  <Apple size={16} /> Inter-meal Refuel
                </h3>
                <div className="space-y-3">
                  {currentDailyDietPlan.snacks.map((snack, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-[var(--md-sys-color-secondary-container)] rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary)]/10 flex items-center justify-center shrink-0">
                        <Apple size={16} className="text-[var(--md-sys-color-primary)]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--md-sys-color-on-secondary-container)] leading-tight">{snack.name}</h4>
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mt-0.5">{snack.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplements Section */}
            {currentDailyDietPlan.supplements && currentDailyDietPlan.supplements.length > 0 && (
              <div className="bg-[var(--md-sys-color-surface)] p-6 rounded-[32px] border border-[var(--md-sys-color-outline)]/10 shadow-sm">
                 <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4 text-purple-600">
                   <Pill size={16} /> Performance Augmentors
                 </h3>
                 <div className="space-y-3">
                   {currentDailyDietPlan.supplements.map((supplement, idx) => {
                     const isPowder = supplement.toLowerCase().includes('powder') || supplement.toLowerCase().includes('creatine') || supplement.toLowerCase().includes('bcaa') || supplement.toLowerCase().includes('whey');
                     const SupplementIcon = isPowder ? Beaker : Pill;
                     return (
                       <div key={idx} className="flex items-start gap-4 p-4 bg-[var(--md-sys-color-secondary-container)] rounded-2xl">
                         <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary)]/10 flex items-center justify-center shrink-0">
                           <SupplementIcon size={16} className="text-[var(--md-sys-color-primary)]" />
                         </div>
                         <p className="text-sm font-bold text-[var(--md-sys-color-on-secondary-container)] leading-tight">{supplement}</p>
                       </div>
                     );
                   })}
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'workout' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Workout Carousel Controls */}
            <div className="flex items-center justify-between px-4">
              <button 
                onClick={() => setActiveWorkoutCard(prev => (prev - 1 + alignedWorkoutPlan.length) % alignedWorkoutPlan.length)}
                className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)] disabled:opacity-20 transition-all active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="text-center">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Session {activeWorkoutCard + 1} of {alignedWorkoutPlan.length}
                </span>
                <h3 className="font-black text-[var(--md-sys-color-primary)] text-sm uppercase">
                   Phase One Focus
                </h3>
              </div>
              <button 
                onClick={() => setActiveWorkoutCard(prev => (prev + 1) % alignedWorkoutPlan.length)}
                className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)] disabled:opacity-20 transition-all active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Individual Day Card */}
            {alignedWorkoutPlan[activeWorkoutCard] && (
              <div 
                key={activeWorkoutCard}
                className="bg-[var(--md-sys-color-surface)] rounded-[48px] shadow-2xl border-4 border-[var(--md-sys-color-outline)]/10 overflow-hidden transition-all duration-500 animate-in slide-in-from-right-10 fade-in"
              >
                <div className="p-8 bg-gradient-to-br from-[var(--md-sys-color-primary)] to-blue-600 text-white relative">
                  {alignedWorkoutPlan[activeWorkoutCard].isToday && (
                    <div className="absolute top-6 right-8 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 animate-pulse">
                      <span className="text-xs font-black uppercase tracking-widest text-white">Today</span>
                    </div>
                  )}
                  <div className="mb-6">
                    <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
                      {alignedWorkoutPlan[activeWorkoutCard].actualDayName}
                    </span>
                    <h4 className="text-3xl font-black tracking-tighter leading-tight mt-1">
                      {alignedWorkoutPlan[activeWorkoutCard].focus}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-2xl">
                        <Zap size={16} className="text-yellow-400" />
                        <span className="text-xs font-black uppercase">{alignedWorkoutPlan[activeWorkoutCard].exercises.length} Protocols</span>
                     </div>
                  </div>
                </div>
                
                <div className="p-8 space-y-8">
                  {/* Warm-Up Exercises Section */}
                  {alignedWorkoutPlan[activeWorkoutCard].warmUpExercises && alignedWorkoutPlan[activeWorkoutCard].warmUpExercises.length > 0 && (
                    <div className="pb-8 border-b border-[var(--md-sys-color-outline)]/10">
                      <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4 text-orange-600">
                        <Flame size={16} /> Warm-Up Protocols
                      </h4>
                      <div className="space-y-4">
                        {alignedWorkoutPlan[activeWorkoutCard].warmUpExercises.map((ex, exIdx) => (
                          <div key={`warmup-${exIdx}`} className="flex items-start gap-5 group">
                            <div className="shrink-0 flex items-center justify-center"> {/* Subtle icon style */}
                              <Flame size={28} className="text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-black text-base uppercase tracking-tight text-[var(--md-sys-color-on-surface)] mb-2">
                                {cleanExerciseName(ex.name)}
                              </h5>
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-black text-orange-600">{ex.sets} × {ex.reps}</span>
                                <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase">{ex.rest} rest</span>
                              </div>
                              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed italic mb-4">"{ex.tips}"</p>
                              {profile.experienceLevel === ExperienceLevel.BEGINNER && (
                                  <button 
                                    onClick={() => setSelectedExerciseData({ exercise: ex, dayIndex: activeWorkoutCard, exerciseIndex: exIdx, sectionType: 'warmUpExercises' })} 
                                    className="text-xs font-black uppercase text-orange-600 flex items-center gap-1.5 hover:opacity-60 transition-opacity"
                                  >
                                    <Play size={14} fill="currentColor" /> Guide
                                  </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {alignedWorkoutPlan[activeWorkoutCard].exercises.map((ex, exIdx) => {
                    const swapKey = `${activeWorkoutCard}-exercises-${exIdx}`;
                    const isSwapping = swappingExercise === swapKey;
                    return (
                      <div key={exIdx} className={`flex items-start gap-5 group transition-opacity duration-300 ${isSwapping ? 'opacity-50' : 'opacity-100'}`}>
                        <div className={`shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${ex.isVariation ? 'text-purple-600' : 'text-[var(--md-sys-color-primary)]'}`}>
                          {isSwapping ? <Loader2 size={28} className="animate-spin" /> : <Dumbbell size={28} />} {/* Subtle icon style */}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-base uppercase tracking-tight text-[var(--md-sys-color-on-surface)] mb-2">
                            {cleanExerciseName(ex.name)}
                          </h5>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-black text-[var(--md-sys-color-primary)]">{ex.sets} × {ex.reps}</span>
                            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase">{ex.rest} rest</span>
                          </div>
                          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed italic mb-4">"{ex.tips}"</p>
                          <div className="flex gap-4">
                            {profile.experienceLevel === ExperienceLevel.BEGINNER && (
                                <button 
                                  disabled={isSwapping}
                                  onClick={() => setSelectedExerciseData({ exercise: ex, dayIndex: activeWorkoutCard, exerciseIndex: exIdx, sectionType: 'exercises' })} 
                                  className="text-xs font-black uppercase text-[var(--md-sys-color-primary)] flex items-center gap-1.5 hover:opacity-60 transition-opacity disabled:opacity-20"
                                >
                                  <Play size={14} fill="currentColor" /> Form Guide
                                </button>
                            )}
                            <button 
                              disabled={isSwapping} 
                              onClick={() => handleSwapExercise(activeWorkoutCard, exIdx, ex, 'exercises')} 
                              className={`text-xs font-black uppercase flex items-center gap-1.5 transition-colors ${isSwapping ? 'text-blue-500' : 'text-gray-400 hover:text-[var(--md-sys-color-primary)]'}`}
                            >
                              <Shuffle size={14} className={isSwapping ? 'animate-spin' : ''} /> 
                              {isSwapping ? 'Forging...' : 'Alternative'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Rehabilitation Exercises Section */}
                  {alignedWorkoutPlan[activeWorkoutCard].rehabExercises && alignedWorkoutPlan[activeWorkoutCard].rehabExercises!.length > 0 && (
                    <div className="pt-8 border-t border-[var(--md-sys-color-outline)]/10 mt-8">
                      <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4 text-green-600">
                        <HeartPulse size={16} /> Rehabilitation Protocols
                      </h4>
                      <div className="space-y-4">
                        {alignedWorkoutPlan[activeWorkoutCard].rehabExercises!.map((rehabEx, rehabExIdx) => (
                           <div key={`rehab-${rehabExIdx}`} className="flex items-start gap-5 group">
                             <div className="shrink-0 flex items-center justify-center"> {/* Subtle icon style */}
                               <ShieldAlert size={28} className="text-green-600" />
                             </div>
                             <div className="flex-1 min-w-0">
                               <h5 className="font-black text-base uppercase tracking-tight text-[var(--md-sys-color-on-surface)] mb-2">
                                 {cleanExerciseName(rehabEx.name)}
                               </h5>
                               <div className="flex justify-between items-center mb-4">
                                 <span className="text-sm font-black text-green-600">{rehabEx.sets} × {rehabEx.reps}</span>
                                 <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase">{rehabEx.rest} rest</span>
                               </div>
                               <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed italic mb-4">"{rehabEx.tips}"</p>
                               {profile.experienceLevel === ExperienceLevel.BEGINNER && (
                                   <button 
                                     onClick={() => setSelectedExerciseData({ exercise: rehabEx, dayIndex: activeWorkoutCard, exerciseIndex: rehabExIdx, sectionType: 'rehabExercises' })} 
                                     className="text-xs font-black uppercase text-green-600 flex items-center gap-1.5 hover:opacity-60 transition-opacity"
                                   >
                                     <Play size={14} fill="currentColor" /> Guide
                                   </button>
                               )}
                             </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cool-Down Exercises Section */}
                  {alignedWorkoutPlan[activeWorkoutCard].coolDownExercises && alignedWorkoutPlan[activeWorkoutCard].coolDownExercises.length > 0 && (
                    <div className="pt-8 border-t border-[var(--md-sys-color-outline)]/10 mt-8">
                      <h4 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4 text-blue-600">
                        <Rewind size={16} /> Cool-Down Protocols
                      </h4>
                      <div className="space-y-4">
                        {alignedWorkoutPlan[activeWorkoutCard].coolDownExercises.map((ex, exIdx) => (
                          <div key={`cooldown-${exIdx}`} className="flex items-start gap-5 group">
                            <div className="shrink-0 flex items-center justify-center"> {/* Subtle icon style */}
                              <Rewind size={28} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-black text-base uppercase tracking-tight text-[var(--md-sys-color-on-surface)] mb-2">
                                {cleanExerciseName(ex.name)}
                              </h5>
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-black text-blue-600">{ex.sets} × {ex.reps}</span>
                                <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase">{ex.rest} rest</span>
                              </div>
                              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed italic mb-4">"{ex.tips}"</p>
                              {profile.experienceLevel === ExperienceLevel.BEGINNER && (
                                  <button 
                                    onClick={() => setSelectedExerciseData({ exercise: ex, dayIndex: activeWorkoutCard, exerciseIndex: exIdx, sectionType: 'coolDownExercises' })} 
                                    className="text-xs font-black uppercase text-blue-600 flex items-center gap-1.5 hover:opacity-60 transition-opacity"
                                  >
                                    <Play size={14} fill="currentColor" /> Guide
                                  </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Daily Steps Recommendation Card */}
                  <div className="bg-[var(--md-sys-color-secondary-container)] p-6 rounded-[32px] shadow-sm mt-8 border border-[var(--md-sys-color-outline)]/10 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-primary)] flex items-center justify-center shrink-0">
                      <Footprints size={24} className="text-[var(--md-sys-color-on-primary)]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-[0.1em] text-[var(--md-sys-color-primary)] mb-1">Cardiovascular Baseline</h4>
                      <p className="text-sm font-bold text-[var(--md-sys-color-on-secondary-container)] leading-relaxed">
                        Target <span className="text-[var(--md-sys-color-primary)]">10,000 steps daily</span> for optimal heart health and metabolic function.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

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
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[var(--md-sys-color-primary)] to-blue-700 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Weekly Check-in</h3>
                <p className="text-xs text-white/80 font-medium mb-6">Forge requires updated biometrics to calculate Phase {currentWeek + 1} variations.</p>
                <M3Button 
                  onClick={() => setActiveTab('progress')} 
                  className="!bg-white !text-[var(--md-sys-color-primary)] shadow-xl"
                  fullWidth
                >
                  <Calendar size={18} /> Initiate Weekly Sync
                </M3Button>
              </div>
            </div>
            <ProgressTracker 
              history={progressHistory} 
              onAddEntry={(entry) => {
                onAddProgress({ ...entry, weekNumber: currentWeek });
                onRefreshPlan();
              }} 
            />
          </div>
        )}
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
        <div className="flex bg-[var(--md-sys-color-surface)]/80 backdrop-blur-xl p-1.5 rounded-[32px] shadow-2xl border border-[var(--md-sys-color-outline)]/20 w-full max-w-sm pointer-events-auto">
          {[
            { id: 'overview', icon: Zap, label: 'Stats' },
            { id: 'diet', icon: Utensils, label: 'Diet' },
            { id: 'workout', icon: Dumbbell, label: 'Work' },
            { id: 'progress', icon: LineChart, label: 'Prog' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center py-3 rounded-[24px] transition-all duration-300 ${activeTab === tab.id ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-lg scale-[1.05]' : 'text-gray-400 hover:text-[var(--md-sys-color-primary)]'}`}
            >
              <tab.icon size={20} className="mb-1" />
              <span className="text-xs font-black uppercase tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedExerciseData && (
        <ExerciseGuideModal 
          exercise={selectedExerciseData.exercise} 
          onClose={() => setSelectedExerciseData(null)} 
          onUpdateExercise={handleUpdateExerciseForm}
          dayIndex={selectedExerciseData.dayIndex}
          exerciseIndex={selectedExerciseData.exerciseIndex}
          sectionType={selectedExerciseData.sectionType}
        />
      )}
    </div>
  );
};

export default PlanDisplay;
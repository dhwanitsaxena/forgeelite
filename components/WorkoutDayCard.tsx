import React from 'react';
import { WorkoutDay, Exercise, UserProfile } from '../types';
import { Zap, CircleCheck, Footprints, Flame, Rewind, Youtube, ShieldAlert } from 'lucide-react';
import M3Button from './M3Button';
import ExerciseList from './ExerciseList';

type ExerciseSection = 'warmUpExercises' | 'exercises' | 'rehabExercises' | 'coolDownExercises';

interface WorkoutDayCardProps {
  workoutDay: WorkoutDay & { actualDayName: string; isToday: boolean };
  originalSessionNumber: number;
  isCardForToday: boolean;
  isCurrentWorkoutCompletedForDate: boolean;
  onMarkDayWorkoutComplete: (dateKey: string) => void;
  currentViewedWorkoutDateKey: string;
  swappingExercise: string | null;
  handleSwapExercise: (dayIndex: number, exerciseIndex: number, currentEx: Exercise, sectionType: ExerciseSection) => Promise<void>;
  setSelectedExercise: (exercise: Exercise | null) => void;
  profile: UserProfile; // For getAlternativeExercise in ExerciseList
  dayIndex: number; // The index within the alignedWorkoutPlan for `handleSwapExercise`
}

const WorkoutDayCard: React.FC<WorkoutDayCardProps> = ({
  workoutDay,
  originalSessionNumber,
  isCardForToday,
  isCurrentWorkoutCompletedForDate,
  onMarkDayWorkoutComplete,
  currentViewedWorkoutDateKey,
  swappingExercise,
  handleSwapExercise,
  setSelectedExercise,
  profile,
  dayIndex,
}) => {

  return (
    <div
      className="bg-[var(--md-sys-color-surface)] rounded-[48px] shadow-2xl border-4 border-[var(--md-sys-color-outline)]/10 overflow-hidden transition-all duration-500 animate-in slide-in-from-right-10 fade-in"
    >
      <div className="p-8 bg-gradient-to-br from-[var(--md-sys-color-primary)] to-blue-600 text-white relative">
        {isCardForToday && (
          <div className="absolute top-6 right-8 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 animate-pulse">
            <span className="text-xs font-black uppercase tracking-widest text-white">Today</span>
          </div>
        )}
        <div className="mb-6">
          <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
            {workoutDay.actualDayName}
          </span>
          <h4 className="text-3xl font-black tracking-tighter leading-tight mt-1">
            {workoutDay.focus}
          </h4>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-2xl">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-xs font-black uppercase">{workoutDay.exercises.length} Protocols</span>
            </div>
        </div>
      </div>
      
      <div className="p-8 space-y-8">
        {/* Warm-Up Exercises Section */}
        <ExerciseList
          exercises={workoutDay.warmUpExercises}
          title="Warm-Up Protocols"
          Icon={Flame}
          color="text-orange-600"
          sectionType="warmUpExercises"
          dayIndex={dayIndex}
          swappingExercise={swappingExercise}
          handleSwapExercise={handleSwapExercise}
          setSelectedExercise={setSelectedExercise}
          profile={profile}
          isEditable={false} // Warm-up exercises are not swappable
        />

        {/* Main Exercises Section */}
        <ExerciseList
          exercises={workoutDay.exercises}
          title="Main Protocols"
          Icon={Zap} // A generic icon for main exercises
          color="text-[var(--md-sys-color-primary)]"
          sectionType="exercises"
          dayIndex={dayIndex}
          swappingExercise={swappingExercise}
          handleSwapExercise={handleSwapExercise}
          setSelectedExercise={setSelectedExercise}
          profile={profile}
          isEditable={true}
        />

        {/* Rehabilitation Exercises Section */}
        {workoutDay.rehabExercises && workoutDay.rehabExercises.length > 0 && (
          <div className="pt-8 border-t border-[var(--md-sys-color-outline)]/10 mt-8">
            <ExerciseList
              exercises={workoutDay.rehabExercises}
              title="Rehabilitation Protocols"
              Icon={ShieldAlert}
              color="text-green-600"
              sectionType="rehabExercises"
              dayIndex={dayIndex}
              swappingExercise={swappingExercise}
              handleSwapExercise={handleSwapExercise}
              setSelectedExercise={setSelectedExercise}
              profile={profile}
              isEditable={false} // Rehab exercises are not swappable
            />
          </div>
        )}

        {/* Cool-Down Exercises Section */}
        <div className="pt-8 border-t border-[var(--md-sys-color-outline)]/10 mt-8">
          <ExerciseList
            exercises={workoutDay.coolDownExercises}
            title="Cool-Down Protocols"
            Icon={Rewind}
            color="text-blue-600"
            sectionType="coolDownExercises"
            dayIndex={dayIndex}
            swappingExercise={swappingExercise}
            handleSwapExercise={handleSwapExercise}
            setSelectedExercise={setSelectedExercise}
            profile={profile}
            isEditable={false} // Cool-down exercises are not swappable
          />
        </div>

        {/* Mark Session Complete Button */}
        {isCurrentWorkoutCompletedForDate ? (
            <div className="text-center text-sm font-bold text-green-600 mt-8 py-3 bg-green-100 rounded-full flex items-center justify-center gap-2">
                <CircleCheck size={20} />
                {isCardForToday
                  ? 'Today\'s Workout Completed! Great job!'
                  : `Workout Completed on ${new Date(currentViewedWorkoutDateKey).toLocaleDateString()}! Great job!`}
            </div>
        ) : isCardForToday ? (
            <M3Button 
                onClick={() => onMarkDayWorkoutComplete(currentViewedWorkoutDateKey)} 
                fullWidth 
                className="mt-8 !bg-green-600 hover:!bg-green-700 shadow-xl"
            >
                <CircleCheck size={20} /> Mark Session Complete
            </M3Button>
        ) : (
            <div className="text-center text-sm text-gray-500 mt-8 py-2">
                Review today, act tomorrow &mdash; your next session is all set!
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
  );
};

export default WorkoutDayCard;
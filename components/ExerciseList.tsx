import React from 'react';
import { Exercise, UserProfile } from '../types';
import { Dumbbell, Zap, Flame, Rewind, Youtube, Shuffle, Loader2, ShieldAlert } from 'lucide-react';
import { getAlternativeExercise } from '../services/geminiService'; // Ensure this is imported for the handler

type ExerciseSection = 'warmUpExercises' | 'exercises' | 'rehabExercises' | 'coolDownExercises';

interface ExerciseListProps {
  exercises: Exercise[];
  title: string;
  Icon: React.ElementType;
  color: string;
  sectionType: ExerciseSection;
  dayIndex: number; // Index of the workout day in the alignedWorkoutPlan
  swappingExercise: string | null;
  handleSwapExercise: (dayIndex: number, exerciseIndex: number, currentEx: Exercise, sectionType: ExerciseSection) => Promise<void>;
  setSelectedExercise: (exercise: Exercise | null) => void;
  profile: UserProfile; // Needed for `getAlternativeExercise`
  isEditable?: boolean; // New prop to control if "Alternative" button is shown
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  title,
  Icon,
  color,
  sectionType,
  dayIndex,
  swappingExercise,
  handleSwapExercise,
  setSelectedExercise,
  profile,
  isEditable = true, // Default to true
}) => {
  if (!exercises || exercises.length === 0) {
    return null;
  }

  // Helper function to clean exercise names (remove content in parentheses)
  const cleanExerciseName = (name: string): string => {
    return name.replace(/\s*\(.*?\)\s*/g, '').trim();
  };

  return (
    <div className={`pb-8 ${sectionType !== 'coolDownExercises' ? 'border-b border-[var(--md-sys-color-outline)]/10' : ''}`}>
      <h4 className={`font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4 ${color}`}>
        <Icon size={16} /> {title}
      </h4>
      <div className="space-y-4">
        {exercises.map((ex, exIdx) => {
          const swapKey = `${dayIndex}-${sectionType}-${exIdx}`;
          const isSwapping = swappingExercise === swapKey;
          const CurrentIcon = sectionType === 'exercises' ? Dumbbell :
                              sectionType === 'rehabExercises' ? ShieldAlert :
                              sectionType === 'warmUpExercises' ? Flame : Rewind;

          return (
            <div key={`${sectionType}-${exIdx}`} className={`flex items-start gap-5 group transition-opacity duration-300 ${isSwapping ? 'opacity-50' : 'opacity-100'}`}>
              <div className={`shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${color}`}>
                {isSwapping ? <Loader2 size={28} className="animate-spin" /> : <CurrentIcon size={28} />}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-black text-base uppercase tracking-tight text-[var(--md-sys-color-on-surface)] mb-2">
                  {cleanExerciseName(ex.name)}
                </h5>
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-sm font-black ${color}`}>{ex.sets} × {ex.reps}</span>
                  <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase">{ex.rest} rest</span>
                </div>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed italic mb-4">"{ex.tips}"</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedExercise(ex)}
                    className={`text-xs font-black uppercase ${color} flex items-center gap-1.5 hover:opacity-60 transition-opacity`}
                  >
                    <Youtube size={14} /> Guide
                  </button>
                  {isEditable && sectionType === 'exercises' && ( // Only main exercises are swappable
                    <button
                      disabled={isSwapping}
                      onClick={() => handleSwapExercise(dayIndex, exIdx, ex, sectionType)}
                      className={`text-xs font-black uppercase flex items-center gap-1.5 transition-colors ${isSwapping ? 'text-blue-500' : 'text-gray-400 hover:text-[var(--md-sys-color-primary)]'}`}
                    >
                      <Shuffle size={14} className={isSwapping ? 'animate-spin' : ''} />
                      {isSwapping ? 'Forging...' : 'Alternative'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseList;
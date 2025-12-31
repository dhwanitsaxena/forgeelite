import React from 'react';
import { UserProfile } from '../../types';
import M3Button from '../M3Button';
import { Dumbbell, Cog, Hand, Zap, HeartPulse, Activity, ArrowLeft } from 'lucide-react';

interface WorkoutStyleStepProps {
  profile: UserProfile;
  onToggleSelection: (key: 'cuisine' | 'workoutPreferences' | 'medicalConditions', val: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const WorkoutStyleStep: React.FC<WorkoutStyleStepProps> = ({ profile, onToggleSelection, onNext, onPrev }) => {
  const workoutStyles = [
    { name: 'Free Weights', icon: Dumbbell, description: 'Barbells, dumbbells, and kettlebells.' },
    { name: 'Machines', icon: Cog, description: 'Multi-station gym equipment for targeted muscle training.' },
    { name: 'Body Weight', icon: Hand, description: 'Utilizing your own body for resistance.' },
    { name: 'HIIT', icon: Zap, description: 'High-intensity interval training for cardio & strength.' },
    { name: 'Aerobics', icon: HeartPulse, description: 'Cardiovascular exercises for endurance and stamina.' },
    { name: 'Combat & Boxing', icon: Activity, description: 'High-energy shadowboxing or kickboxing routines.' },
  ];

  return (
    <div className="px-6 py-8 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold mb-6">Workout Style</h2>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
        Select your preferred training methods to help Forge craft effective and enjoyable workout routines.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {workoutStyles.map((style) => (
          <button 
            key={style.name} 
            onClick={() => onToggleSelection('workoutPreferences', style.name)} 
            className={`p-5 rounded-[24px] text-left transition-all border-2 flex flex-col items-center justify-center gap-2 ${
              profile.workoutPreferences.includes(style.name) 
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-md border-[var(--md-sys-color-primary)]' 
                : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline)]/10'
            }`}
          >
            <style.icon size={24} className="mb-1" />
            <span className="text-sm font-black uppercase text-center">{style.name}</span>
            <span className="text-xs text-center opacity-70 mt-1">{style.description}</span>
          </button>
        ))}
      </div>
      <div className="mt-10 flex gap-3">
        <M3Button onClick={onPrev} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
        <M3Button onClick={onNext} fullWidth>Set Experience</M3Button>
      </div>
    </div>
  );
};

export default WorkoutStyleStep;
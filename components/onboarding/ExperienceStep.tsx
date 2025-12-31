import React from 'react';
import { UserProfile, ExperienceLevel } from '../../types';
import M3Button from '../M3Button';
import { Award, Activity, Rocket, ArrowLeft } from 'lucide-react';

interface ExperienceStepProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNext: () => void;
  onPrev: () => void;
}

const ExperienceStep: React.FC<ExperienceStepProps> = ({ profile, setProfile, onNext, onPrev }) => {
  const experienceLevelsData = [
    {
      level: ExperienceLevel.BEGINNER,
      icon: Award,
      description: "Just starting or returning to fitness. Focus on fundamentals."
    },
    {
      level: ExperienceLevel.INTERMEDIATE,
      icon: Activity,
      description: "Consistent training (6+ months). Ready for advanced techniques."
    },
    {
      level: ExperienceLevel.ADVANCED,
      icon: Rocket,
      description: "Years of training. Seeks specialized programming and peak performance."
    }
  ];

  return (
    <div className="px-6 py-8 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold mb-6">Experience</h2>
      <div className="space-y-4">
        {experienceLevelsData.map((data) => (
          <button 
            key={data.level} 
            onClick={() => setProfile({...profile, experienceLevel: data.level})} 
            className={`w-full p-6 rounded-[32px] text-left border-2 transition-all flex items-center gap-4 ${
              profile.experienceLevel === data.level 
                ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)]' 
                : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline)]/10'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              profile.experienceLevel === data.level 
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' 
                : 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-primary)]'
            }`}>
              <data.icon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">{data.level}</h3>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">{data.description}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-10 flex gap-3">
        <M3Button onClick={onPrev} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
        <M3Button onClick={onNext} fullWidth>Finalize Nutrition</M3Button>
      </div>
    </div>
  );
};

export default ExperienceStep;
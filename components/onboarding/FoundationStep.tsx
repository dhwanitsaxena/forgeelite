import React from 'react';
import { UserProfile, Gender } from '../../types';
import M3Button from '../M3Button';
import StepperInput from '../StepperInput';
import { User, Cake, Users, Ruler, Scale, ArrowLeft } from 'lucide-react';

interface FoundationStepProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNext: () => void;
  onPrev: () => void;
}

const FoundationStep: React.FC<FoundationStepProps> = ({ profile, setProfile, onNext, onPrev }) => {
  return (
    <div className="px-6 py-8 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><User className="text-[var(--md-sys-color-primary)]" /> Your Foundation</h2>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
        These essential metrics form the foundation of your personalized plan, enabling Forge to intelligently calibrate your macros, workouts, and progress goals.
      </p>
      <div className="space-y-3">
        <StepperInput label="Age" value={profile.age} onIncrement={() => setProfile({...profile, age: Math.min(90, profile.age + 1)})} onDecrement={() => setProfile({...profile, age: Math.max(15, profile.age - 1)})} unit="yr" icon={Cake}/>
        <div className="bg-[var(--md-sys-color-secondary-container)] p-5 rounded-[32px]">
          <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-2">
            <Users size={14} className="text-[var(--md-sys-color-primary)]" />
            Gender
          </label>
          <div className="flex gap-1.5">
            {Object.values(Gender).map((g) => (
              <button 
                key={g} 
                onClick={() => setProfile({...profile, gender: g})} 
                className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all ${
                  profile.gender === g 
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-md' 
                    : 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <StepperInput label="Height" value={profile.height} onIncrement={() => setProfile({...profile, height: profile.height + 1})} onDecrement={() => setProfile({...profile, height: Math.max(120, profile.height - 1)})} unit="cm" icon={Ruler}/>
        <StepperInput label="Weight" value={profile.weight} onIncrement={() => setProfile({...profile, weight: profile.weight + 1})} onDecrement={() => setProfile({...profile, weight: Math.max(30, profile.weight - 1)})} unit="kg" icon={Scale}/>
        <StepperInput label="Waist" value={profile.currentComposition.waistSize} onIncrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, waistSize: profile.currentComposition.waistSize + 1}})} onDecrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, waistSize: profile.currentComposition.waistSize - 1}})} unit="cm" icon={Ruler}/>
        <StepperInput label="Neck" value={profile.currentComposition.neckSize} onIncrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, neckSize: profile.currentComposition.neckSize + 1}})} onDecrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, neckSize: profile.currentComposition.neckSize - 1}})} unit="cm" icon={Ruler}/>
        {profile.gender === Gender.FEMALE && <StepperInput label="Hips" value={profile.currentComposition.hipSize || 95} onIncrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, hipSize: (profile.currentComposition.hipSize || 95) + 1}})} onDecrement={() => setProfile({...profile, currentComposition: {...profile.currentComposition, hipSize: (profile.currentComposition.hipSize || 95) - 1}})} unit="cm" icon={Ruler}/>}
      </div>
      <div className="mt-8 flex gap-3">
        <M3Button onClick={onPrev} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
        <M3Button onClick={onNext} fullWidth>Define Focus</M3Button>
      </div>
    </div>
  );
};

export default FoundationStep;
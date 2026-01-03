
import React from 'react';
import { UserProfile } from '../../types';
import M3Button from '../M3Button';
import BodyMap from '../BodyMap';
import { ArrowLeft } from 'lucide-react';

interface JointReadinessStepProps {
  profile: UserProfile;
  onToggleRegion: (region: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const JointReadinessStep: React.FC<JointReadinessStepProps> = ({ profile, onToggleRegion, onNext, onPrev }) => {
  return (
    <div className="px-6 py-8 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold mb-6 text-center">Joint Readiness</h2>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed text-center">
        Tap on any body regions where you experience discomfort, pain, or have a past injury. This helps Forge's AI intelligently adapt your workout plan to avoid aggravating these areas and prioritize safe, effective movements.
      </p>
      <BodyMap selectedRegions={profile.medicalConditions} onToggleRegion={onToggleRegion} />
      <div className="mt-10 flex gap-3">
        <M3Button onClick={onPrev} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
        <M3Button onClick={onNext} fullWidth>Choose Workouts</M3Button>
      </div>
    </div>
  );
};

export default JointReadinessStep;

import React from 'react';
import { UserProfile, SculptingTargetCategory, Gender } from '../../types';
import M3Button from '../M3Button';
import { Target, Scale, Sparkles, Activity, Scaling, CircleCheck, Ruler, Pencil, ArrowLeft } from 'lucide-react'; // Added Pencil

interface FocusStepProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNext: () => void;
  onPrev: () => void;
  // onEditGoals: () => void; // Removed as this is not part of this step's direct navigation
}

const FocusStep: React.FC<FocusStepProps> = ({ profile, setProfile, onNext, onPrev }) => {
  const categories = [
    {
      id: SculptingTargetCategory.FAT_LOSS_WEIGHT_LOSS,
      label: "Fat Loss & Weight Loss",
      description: "Reducing body fat for a leaner look, often involving a caloric deficit.",
      icon: Scale,
    },
    {
      id: SculptingTargetCategory.MUSCLE_GAIN_BULKING,
      label: "Muscle Gain (Bulking)",
      description: "Increasing muscle mass and strength, often requiring a calorie surplus and protein.",
      icon: Target,
    },
    {
      id: SculptingTargetCategory.BODY_RECOMPOSITION,
      label: "Body Recomposition",
      description: "Simultaneously losing fat and building muscle for a more defined physique.",
      icon: Sparkles, 
    },
    {
      id: SculptingTargetCategory.STRENGTH_BUILDING,
      label: "Strength Building",
      description: "Increasing lifting capacity or overall power, focusing on progressive overload in weight training.",
      icon: Scaling,
    },
    {
      id: SculptingTargetCategory.PERFORMANCE_IMPROVEMENT,
      label: "Performance Improvement",
      description: "Enhancing endurance (running longer), speed, or athletic ability.",
      icon: Activity,
    },
    {
      id: SculptingTargetCategory.IMPROVED_HEALTH_MARKERS,
      label: "Improved Health Markers",
      description: "Lowering disease risk, improving cardiovascular health, bone density, and immune function.",
      icon: CircleCheck,
    },
  ];

  return (
    <div className="px-6 py-8 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Target className="text-[var(--md-sys-color-primary)]" /> Transformation Focus</h2>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
        Choose your primary transformation focus. Forge will intelligently calculate optimal body composition targets based on your goals and current metrics.
      </p>
      <div className="space-y-3 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setProfile({ ...profile, sculptingTargetCategory: cat.id })}
            className={`w-full p-5 rounded-[32px] text-left transition-all border-2 flex items-start gap-4 ${
              profile.sculptingTargetCategory === cat.id
                ? 'bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-primary)] shadow-md'
                : 'bg-[var(--md-sys-color-secondary-container)] border-[var(--md-sys-color-outline)]/10 text-[var(--md-sys-color-on-secondary-container)]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              profile.sculptingTargetCategory === cat.id 
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' 
                : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)]'
            }`}>
              <cat.icon size={20} />
            </div>
            <div>
              <h3 className="text-base font-black leading-tight text-[var(--md-sys-color-on-surface)]">{cat.label}</h3>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-normal mt-1">{cat.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Inlined Target Projections and Navigation Buttons (non-sticky) */}
      <div className="p-4 bg-[var(--md-sys-color-surface)]/80 backdrop-blur-xl border-t border-[var(--md-sys-color-outline)]/20 shadow-2xl pt-8 rounded-t-[40px] mt-8">
        {/* Display Suggested Targets */}
        <div 
          key={profile.sculptingTargetCategory}
          className="bg-[var(--md-sys-color-surface)] p-6 rounded-[32px] border border-[var(--md-sys-color-outline)]/10 mb-8 animate-in fade-in zoom-in-95 duration-500"
        >
          <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-4 text-[var(--md-sys-color-primary)]">
            <Target size={16} /> Forge's Target Projections
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Weight</span>
                <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.weight} kg</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Body Fat %</span>
                <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.bodyFatPercentage} %</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase">Waist</span>
                <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.waistSize} cm</span>
              </div>
            </div>
            {profile.targets.chestSize && (
              <div className="flex items-center gap-2">
                <Ruler size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Chest</span>
                  <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.chestSize} cm</span>
                </div>
              </div>
            )}
            {profile.targets.armSize && (
              <div className="flex items-center gap-2">
                <Ruler size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Arm</span>
                  <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.armSize} cm</span>
                </div>
              </div>
            )}
            {profile.gender === Gender.FEMALE && profile.targets.hipSize && (
              <div className="flex items-center gap-2">
                <Ruler size={18} className="text-[var(--md-sys-color-on-surface-variant)]" />
                <div>
                  <span className="block text-xs font-bold text-gray-400 uppercase">Hips</span>
                  <span className="block text-sm font-black text-[var(--md-sys-color-on-surface)]">{profile.targets.hipSize} cm</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <M3Button onClick={onPrev} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
          <M3Button onClick={onNext} fullWidth>Assess Readiness</M3Button>
        </div>
      </div>
    </div>
  );
};

export default FocusStep;
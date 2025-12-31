import React from 'react';
import { UserProfile } from '../../types';
import M3Button from '../M3Button';
import { UtensilsCrossed, Plus, ChefHat, ArrowLeft, Loader2 } from 'lucide-react';

interface NutritionStepProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  customCuisineInput: string;
  setCustomCuisineInput: React.Dispatch<React.SetStateAction<string>>;
  onToggleSelection: (key: 'cuisine' | 'workoutPreferences' | 'medicalConditions', val: string) => void;
  onHandleAddCustomCuisine: () => void;
  onSubmit: () => Promise<void>;
  onPrev: () => void;
  loading: boolean;
  loadingMessage: string;
  error: string | null;
}

const NutritionStep: React.FC<NutritionStepProps> = ({ 
  profile, 
  setProfile, 
  customCuisineInput, 
  setCustomCuisineInput, 
  onToggleSelection, 
  onHandleAddCustomCuisine, 
  onSubmit, 
  onPrev, 
  loading, 
  loadingMessage, 
  error 
}) => {
  return (
    <div className="px-6 py-8 animate-in slide-in-from-right duration-300">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <UtensilsCrossed className="text-[var(--md-sys-color-primary)]" /> Nutrition Protocol
      </h2>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
        Tailor your meal plan with pre-selected dietary styles or add your own preferred cuisines and dishes.
      </p>

      {/* Custom Cuisine Input */}
      <div className="bg-[var(--md-sys-color-secondary-container)] p-5 rounded-[32px] flex flex-col gap-4 mb-6">
        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <ChefHat size={14} className="text-[var(--md-sys-color-primary)]" />
          Custom Cuisines / Dishes
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customCuisineInput}
            onChange={(e) => setCustomCuisineInput(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); onHandleAddCustomCuisine(); } }}
            placeholder="e.g., Idli Dosa, Chicken Curry..."
            className="flex-grow bg-[var(--md-sys-color-surface)] border-none rounded-xl p-3 text-[var(--md-sys-color-on-surface)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)] text-sm"
          />
          <M3Button 
            onClick={onHandleAddCustomCuisine} 
            disabled={!customCuisineInput.trim()} 
            className="!rounded-xl px-4 py-2 text-sm h-auto"
          >
            <Plus size={16} />
          </M3Button>
        </div>
        {profile.customCuisinePreferences && profile.customCuisinePreferences.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.customCuisinePreferences.map((c, idx) => (
              <span key={idx} className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                {c}
                <button 
                  onClick={() => setProfile(prev => ({ 
                    ...prev, 
                    customCuisinePreferences: prev.customCuisinePreferences?.filter(item => item !== c) 
                  }))} 
                  className="ml-1 text-[var(--md-sys-color-on-primary-container)]/80 hover:text-[var(--md-sys-color-on-primary-container)] text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Predefined cuisine buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {['Indian', 'Mediterranean', 'High Protein', 'Asian Fusion', 'Vegetarian', 'Vegan'].map((c) => (
          <button 
            key={c} 
            onClick={() => onToggleSelection('cuisine', c)} 
            className={`p-5 rounded-[24px] text-sm font-black uppercase border-2 transition-all ${profile.cuisine.includes(c) ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] border-[var(--md-sys-color-primary)] shadow-md' : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline)]/10'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs rounded-3xl font-bold">{error}</div>}

      <div className="mt-10 flex gap-3">
        <M3Button onClick={onPrev} variant="tonal" className="!px-4 !min-w-[48px]"><ArrowLeft size={20} /></M3Button>
        <M3Button onClick={onSubmit} fullWidth disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Finalize & Build Transformation'}
        </M3Button>
      </div>
      {loading && <p className="text-center text-xs font-black uppercase text-[var(--md-sys-color-primary)] mt-3">{loadingMessage}</p>}
    </div>
  );
};

export default NutritionStep;
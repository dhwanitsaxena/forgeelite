import React, { useMemo } from 'react';
import { TransformationPlan, UserProfile } from '../types';
import { Calendar, Target, Activity, Pencil, Scale, Ruler } from 'lucide-react';
import M3Button from './M3Button';

interface PlanOverviewProps {
  plan: TransformationPlan;
  profile: UserProfile;
  currentWeek: number;
  onEditGoals: () => void;
}

const PlanOverview: React.FC<PlanOverviewProps> = ({ plan, profile, currentWeek, onEditGoals }) => {
  const transformationProgress = useMemo(() => {
    return Math.min(100, (currentWeek / (plan.estimatedWeeks || 12)) * 100);
  }, [currentWeek, plan.estimatedWeeks]);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-[var(--md-sys-color-primary)]">
              <Target size={16} /> Sculpting Benchmarks
            </h3>
            <M3Button onClick={onEditGoals} variant="text" className="!p-0 !min-w-0 !h-auto">
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
  );
};

export default PlanOverview;
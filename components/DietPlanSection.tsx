import React from 'react';
import { DietPlan } from '../types';
// FIX: Replaced non-existent 'Muscle' icon with 'Utensils'
import { Sunrise, Sun, Moon, Leaf, Pill, Beaker, Utensils } from 'lucide-react'; // Changed Muscle to Utensils

interface DietPlanSectionProps {
  currentDailyDietPlan: DietPlan;
  activeDietDayName: string; // The actual day of the week (e.g., "Monday")
}

const DietPlanSection: React.FC<DietPlanSectionProps> = ({ currentDailyDietPlan, activeDietDayName }) => {
  if (!currentDailyDietPlan) {
    return <div className="text-center p-6 text-gray-500">No diet plan available for this day.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {[
        { title: 'Breakfast', meal: currentDailyDietPlan.breakfast, icon: Sunrise, iconColor: 'text-amber-500' },
        { title: 'Lunch', meal: currentDailyDietPlan.lunch, icon: Sun, iconColor: 'text-yellow-500' },
        { title: 'Dinner', meal: currentDailyDietPlan.dinner, icon: Moon, iconColor: 'text-blue-500' },
      ].map((item) => item.meal && (
        <div key={item.title} className="bg-[var(--md-sys-color-surface)] rounded-[32px] border border border-[var(--md-sys-color-outline)]/10 shadow-sm overflow-hidden transition-transform hover:scale-[1.01]">
          <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <item.icon size={24} className={item.iconColor} />
                    <h4 className="text-[var(--md-sys-color-on-surface)] font-black text-xl leading-tight">
                      {item.meal.name}
                    </h4>
                  </div>
              </div>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mb-3">{item.meal.description}</p>
              <div className="bg-[var(--md-sys-color-primary-container)] px-3 py-1 rounded-full w-fit">
                <span className="text-xs font-black text-[var(--md-sys-color-on-primary-container)]">{item.meal.calories} kcal</span>
              </div>
          </div>
        </div>
      ))}

      {/* Snacks Section */}
      {currentDailyDietPlan.snacks && currentDailyDietPlan.snacks.length > 0 && (
        <div className="bg-[var(--md-sys-color-surface)] p-6 rounded-[32px] border border-[var(--md-sys-color-outline)]/10 shadow-sm">
          <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4 text-green-600">
            <Leaf size={16} /> Inter-meal Refuel
          </h3>
          <div className="space-y-3">
            {currentDailyDietPlan.snacks.map((snack, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-[var(--md-sys-color-secondary-container)] rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary)]/10 flex items-center justify-center shrink-0">
                  {/* FIX: Used Utensils for snack icon */}
                  <Utensils size={16} className="text-[var(--md-sys-color-primary)]" />
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
  );
};

export default DietPlanSection;
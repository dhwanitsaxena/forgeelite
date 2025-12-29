import React from 'react';
import { X, Sparkles, Cpu, Target, UtensilsCrossed, Dumbbell, Database, Calendar, TrendingUp, User, Info, Activity, ShieldAlert } from 'lucide-react';

interface HowItWorksSlidesheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowItWorksSlidesheet: React.FC<HowItWorksSlidesheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300"
      onClick={onClose} // Close when clicking on the overlay
    >
      <div 
        className="w-full max-w-md bg-[var(--md-sys-color-surface)] rounded-t-[48px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in slide-in-from-bottom-full duration-500"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        {/* Header */}
        <div className="p-8 flex justify-between items-center border-b border-[var(--md-sys-color-outline)]/10">
          <h3 className="font-black text-2xl text-[var(--md-sys-color-primary)] flex items-center gap-3">
            <Info size={28} /> How Forge Works
          </h3>
          <button onClick={onClose} className="p-3 bg-[var(--md-sys-color-secondary-container)] hover:bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:text-[var(--md-sys-color-primary)] rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
          <p className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            Forget generic plans. Forge utilizes cutting-edge Gemini AI to deliver a truly hyper-personalized body transformation experience. Every diet and workout recommendation is uniquely tailored to *you*.
          </p>

          <div className="flex items-center gap-4 bg-[var(--md-sys-color-primary-container)] p-4 rounded-2xl">
            <Cpu size={28} className="text-[var(--md-sys-color-primary)] shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[var(--md-sys-color-primary)] mb-1">AI at its Core</h4>
              <p className="text-sm font-bold text-[var(--md-sys-color-on-primary-container)] leading-tight">
                Gemini AI critically evaluates your unique data points.
              </p>
            </div>
          </div>

          <p className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            By analyzing a comprehensive set of inputs, Forge constructs a dynamic plan that evolves with your progress, ensuring optimal results and preventing plateaus.
          </p>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
              <Database size={16} className="text-[var(--md-sys-color-primary)]" /> Your Data, Evaluated:
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-[var(--md-sys-color-on-surface)]">
                <User size={18} className="text-[var(--md-sys-color-primary)] shrink-0" /> Age, Gender, Height, Weight
              </li>
              <li className="flex items-center gap-3 text-sm text-[var(--md-sys-color-on-surface)]">
                <Target size={18} className="text-[var(--md-sys-color-primary)] shrink-0" /> Transformation Focus & Target Goals
              </li>
              <li className="flex items-center gap-3 text-sm text-[var(--md-sys-color-on-surface)]">
                <Activity size={18} className="text-[var(--md-sys-color-primary)] shrink-0" /> Experience Level & Workout Preferences
              </li>
              <li className="flex items-center gap-3 text-sm text-[var(--md-sys-color-on-surface)]">
                <UtensilsCrossed size={18} className="text-[var(--md-sys-color-primary)] shrink-0" /> Dietary Preferences & Custom Cuisines
              </li>
              <li className="flex items-center gap-3 text-sm text-[var(--md-sys-color-on-surface)]">
                <ShieldAlert size={18} className="text-red-500 shrink-0" /> Medical Conditions & Joint Readiness
              </li>
              <li className="flex items-center gap-3 text-sm text-[var(--md-sys-color-on-surface)]">
                <TrendingUp size={18} className="text-[var(--md-sys-color-primary)] shrink-0" /> Progress History (Weight, Measurements)
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-4 bg-[var(--md-sys-color-secondary-container)] p-4 rounded-2xl">
            <Sparkles size={28} className="text-[var(--md-sys-color-primary)] shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-[var(--md-sys-color-primary)] mb-1">Your Unique Blueprint</h4>
              <p className="text-sm font-bold text-[var(--md-sys-color-on-secondary-container)] leading-tight">
                Every plan is a unique blueprint, forged for your success.
              </p>
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            Forge is more than just an app; it's your personal AI-powered coach, adapting and optimizing your path to a healthier, stronger you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSlidesheet;
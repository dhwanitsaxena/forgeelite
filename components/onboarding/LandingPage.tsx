import React from 'react';
import M3Button from '../M3Button';
import { Sparkles, Target, RefreshCw, Lock } from 'lucide-react';

interface LandingPageProps {
  onStartTransformation: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartTransformation }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-6 animate-in fade-in duration-700 relative z-10">
      <div className="w-28 h-28 bg-[var(--md-sys-color-primary)] rounded-[40px] flex items-center justify-center mb-10 shadow-2xl rotate-6 transition-transform hover:rotate-0">
        <Sparkles className="text-[var(--md-sys-color-on-primary)]" size={56} />
      </div>
      <h1 className="text-5xl font-black tracking-tighter text-[var(--md-sys-color-on-surface)] mb-4 uppercase">Forge</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-xs font-medium">
        Unlock your full potential with Forge, the ultimate body transformation app. Powered by Gemini AI, Forge creates hyper-personalized diet and workout plans tailored precisely to your unique body, goals, and lifestyle.
      </p>
      
      <div className="flex flex-col gap-3 mb-10 text-left w-full max-w-xs">
        <div className="flex items-center gap-3">
          <Target size={18} className="text-[var(--md-sys-color-primary)] shrink-0" />
          <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">Personalized for YOU: Gemini AI adapts to your biometrics, preferences, and progress.</span>
        </div>
        <div className="flex items-center gap-3">
          <RefreshCw size={18} className="text-[var(--md-sys-color-primary)] shrink-0" />
          <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">Dynamic Coaching: Plans evolve with you, ensuring optimal results.</span>
        </div>
        <div className="flex items-center gap-3">
          <Lock size={18} className="text-[var(--md-sys-color-primary)] shrink-0" />
          <span className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">Privacy First: All your data is securely stored locally on your device.</span>
        </div>
      </div>

      <M3Button onClick={onStartTransformation} fullWidth className="h-16 shadow-xl !bg-[var(--md-sys-color-primary)]">
        <Sparkles size={20} /> Start Your Transformation
      </M3Button>
    </div>
  );
};

export default LandingPage;
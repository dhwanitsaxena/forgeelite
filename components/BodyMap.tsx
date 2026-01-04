
import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react';

interface BodyRegion {
  id: string;
  label: string;
  path: string;
}

interface BodyMapProps {
  selectedRegions: string[];
  onToggleRegion: (region: string) => void;
}

const BodyMap: React.FC<BodyMapProps> = ({ selectedRegions, onToggleRegion }) => {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [isAnimating, setIsAnimating] = useState(false);

  // Anatomical regions for Front View - Scaled up
  const frontRegions: BodyRegion[] = [
    { id: 'Head/Neck', label: 'Neck', path: 'M44,10 c0,-4 3,-7 6,-7 s6,3 6,7 c0,3 -2,5 -4,6 l0,3 l-4,0 l0,-3 c-2,-1 -4,-3 -4,-6' },
    { id: 'Shoulder Pain', label: 'Shoulders', path: 'M30,20 c-5,0 -12,1 -16,5 c-4,2 -5,6 -4,10 l5,18 l12,-2 l3,-31 M70,20 c5,0 12,1 16,5 c4,2 5,6 3,10 l-5,18 l-12,-2 l-3,-31' },
    { id: 'Chest/Core', label: 'Chest/Abs', path: 'M34,22 l32,0 l5,25 l-2,12 l-38,0 l-2,-12 z' },
    { id: 'Hips', label: 'Hips/Groin', path: 'M32,58 l36,0 l5,15 l-46,0 z' },
    { id: 'Elbows/Wrists', label: 'Arms', path: 'M21,38 l-8,35 l10,4 l6,-30 z M79,38 l8,35 l-10,4 l-6,-30 z' },
    { id: 'Knee Pain', label: 'Knees', path: 'M32,95 c-2,0 -4,7 0,14 l12,0 c4,-7 2,-14 0,-14 z M56,95 c-2,0 -4,7 0,14 l12,0 c4,-7 2,-14 0,-14 z' },
    { id: 'Ankles/Feet', label: 'Ankles/Feet', path: 'M33,125 l12,0 l3,8 l-18,0 z M55,125 l12,0 l3,8 l-18,0 z' }
  ];

  // Anatomical regions for Back View - Scaled up
  const backRegions: BodyRegion[] = [
    { id: 'Head/Neck', label: 'Neck', path: 'M44,10 c0,-4 3,-7 6,-7 s6,3 6,7 c0,3 -2,5 -4,6 l0,3 l-4,0 l0,-3 c-2,-1 -4,-3 -4,-6' },
    { id: 'Shoulder Pain', label: 'Shoulders', path: 'M30,20 c-5,0 -12,1 -16,5 c-4,2 -5,6 -4,10 l5,18 l12,-2 l3,-31 M70,20 c5,0 12,1 16,5 c4,2 5,6 3,10 l-5,18 l-12,-2 l-3,-31' },
    { id: 'Back Pain', label: 'Lower Back', path: 'M34,48 l32,0 l5,18 l-42,0 z' },
    { id: 'Upper Back Pain', label: 'Upper Back', path: 'M32,22 l36,0 l4,26 l-44,0 z' },
    { id: 'Glutes', label: 'Glutes', path: 'M30,66 l40,0 l7,15 l-54,0 z' },
    { id: 'Hamstrings', label: 'Hamstrings', path: 'M32,82 l16,0 l3,20 l-22,0 z M52,82 l16,0 l3,20 l-22,0 z' },
    { id: 'Calves', label: 'Calves', path: 'M34,105 l14,0 l3,20 l-20,0 z M52,105 l14,0 l3,20 l-20,0 z' }
  ];

  const handleFlip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setView(prev => prev === 'front' ? 'back' : 'front');
      setIsAnimating(false);
    }, 150);
  };

  const currentRegions = view === 'front' ? frontRegions : backRegions;
  const hasSelectedIssues = selectedRegions.length > 0 && !selectedRegions.includes('None');

  return (
    <div className="flex flex-col items-center gap-8 py-2 w-full max-w-sm mx-auto">
      {/* Subtle Accordion/Stack Container */}
      <div className="relative w-full group">
        {/* Subtle Stack Hint (Accordion layer) */}
        <div className="absolute top-2 -right-2 w-full h-full bg-[var(--md-sys-color-secondary-container)]/50 rounded-[64px] -z-10 transition-transform duration-500 group-hover:translate-x-1" />
        <div className="absolute top-4 -right-4 w-full h-full bg-[var(--md-sys-color-secondary-container)]/30 rounded-[64px] -z-20 transition-transform duration-500 group-hover:translate-x-2" />

        {/* Large Interactive Card Area */}
        <div 
          onClick={handleFlip}
          className={`relative w-full aspect-[3/4] max-h-[60vh] bg-[var(--md-sys-color-surface)] rounded-[64px] shadow-2xl border border-[var(--md-sys-color-outline)]/10 flex items-center justify-center overflow-hidden transition-all duration-500 cursor-pointer active:scale-[0.98] ${isAnimating ? 'opacity-40 scale-95 blur-sm' : 'opacity-100 scale-100'}`}
        >
          {/* Anatomical Grid background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--md-sys-color-on-surface) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--md-sys-color-on-surface) 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }} />
         
          {/* Floating Perspective Label */}
          <div className="absolute top-8 left-8 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)] animate-pulse" />
             <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--md-sys-color-primary)]">
               {view} view
             </span>
          </div>

          <svg viewBox="0 0 100 140" className={`w-[85%] h-[85%] transition-all duration-500 ${view === 'back' ? 'scale-x-[-1]' : ''}`}>
            {/* Base Humanoid Silhouette - Large */}
            <path 
              d="M50,5 c-6,0 -12,4 -12,12 c0,6 4,12 8,14 v4 c-12,0 -24,3 -30,10 c-5,5 -6,12 -4,17 l8,42 c1,5 5,7 10,7 h4 v42 c0,5 3,7 6,7 h12 c3,0 6,-1 6,-5 v-35 h2 c3,0 6,-3 6,-5 v-42 h5 c5,0 9,-2 10,-7 l8,-42 c2,-5 1,-12 -4,-17 c-6,-7 -18,-10 -30,-10 v-4 c4,-2 8,-8 8,-14 c0,-8 -6,-12 -12,-12 z" 
              fill="var(--md-sys-color-surface)" // Almost white in light mode
              opacity="0.1" // More solid background humanoid
              className="drop-shadow-xl" // Stronger shadow
            />

            {/* Interactive Regions */}
            {currentRegions.map((region) => {
              const isActive = selectedRegions.includes(region.id);
              return (
                <path
                  key={region.id}
                  d={region.path}
                  onClick={(e) => {
                    e.stopPropagation(); // Don't trigger the flip when selecting a region
                    onToggleRegion(region.id);
                  }}
                  aria-label={`Select ${region.label} region`}
                  className={`cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'fill-[var(--md-sys-color-primary)] filter drop-shadow-[0_0_16px_rgba(0,100,149,0.9)]' 
                      : 'fill-gray-200 hover:fill-gray-400 active:scale-95' 
                  }`}
                  stroke="var(--md-sys-color-outline)"
                  strokeWidth="1.2" // Thicker stroke
                  strokeLinecap="round" // Smoother corners
                  strokeLinejoin="round" // Smoother corners
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected regions display */}
      <div className="w-full space-y-4">
        <div className="flex flex-wrap justify-center gap-2">
          {hasSelectedIssues && selectedRegions.map(id => (
            <div key={id} className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] px-4 py-2 rounded-2xl text-xs font-black uppercase flex items-center gap-2 border border-[var(--md-sys-color-primary)]/20 shadow-sm animate-in zoom-in duration-300">
              <Sparkles size={12} className="text-[var(--md-sys-color-primary)]" />
              {id.replace('Pain', '')}
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleRegion(id); }} 
                className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-[var(--md-sys-color-secondary-container)]/50 hover:bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Conditionally render Full Mobility button */}
        {!hasSelectedIssues && (
          <button 
            onClick={() => onToggleRegion('None')}
            className={`w-full p-6 rounded-[36px] border-2 transition-all flex items-center justify-between group ${
              selectedRegions.includes('None') || selectedRegions.length === 0
                ? 'bg-green-600 border-green-500 text-white shadow-xl shadow-green-500/30 scale-[1.02]' // Enhanced shadow here
                : 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline)]/10 text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            <div className="flex items-center gap-5">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                 selectedRegions.includes('None') || selectedRegions.length === 0 ? 'bg-white/20' : 'bg-[var(--md-sys-color-secondary-container)]'
               }`}>
                 <CheckCircle2 size={28} />
               </div>
               <div className="text-left">
                  <span className="block text-base font-black uppercase tracking-tight">Full Mobility</span>
                  <span className="block text-xs opacity-70">No restrictions detected</span>
               </div>
            </div>
            {(selectedRegions.includes('None') || selectedRegions.length === 0) && (
              <div className="w-3 h-3 rounded-full bg-white animate-ping" />
            )}
          </button>
        )}

        {hasSelectedIssues && (
          <div className="p-6 bg-red-100 border border-red-200 rounded-[40px] flex items-start gap-5 animate-in fade-in slide-in-from-top-6 duration-700">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h5 className="text-xs font-black uppercase tracking-[0.1em] text-red-800 mb-2">Safety Protocols Active</h5>
              <p className="text-sm font-medium text-red-700 leading-relaxed italic">
                Forge algorithms will bypass high-stress movements for your reported regions, prioritizing long-term joint integrity.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyMap;

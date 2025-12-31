import React from 'react';
import { Utensils, Dumbbell, Zap, LineChart } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'overview' | 'diet' | 'workout' | 'progress';
  setActiveTab: (tab: 'overview' | 'diet' | 'workout' | 'progress') => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
      <div className="flex bg-[var(--md-sys-color-surface)]/80 backdrop-blur-xl p-1.5 rounded-[32px] shadow-2xl border border-[var(--md-sys-color-outline)]/20 w-full max-w-sm pointer-events-auto">
        {[
          { id: 'overview', icon: Zap, label: 'Stats' },
          { id: 'diet', icon: Utensils, label: 'Diet' },
          { id: 'workout', icon: Dumbbell, label: 'Work' },
          { id: 'progress', icon: LineChart, label: 'Prog' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex flex-col items-center py-3 rounded-[24px] transition-all duration-300 ${activeTab === tab.id ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-lg scale-[1.05]' : 'text-gray-400 hover:text-[var(--md-sys-color-primary)]'}`}
          >
            <tab.icon size={20} className="mb-1" />
            <span className="text-xs font-black uppercase tracking-tight">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;
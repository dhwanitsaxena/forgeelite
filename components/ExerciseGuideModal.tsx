

import React from 'react';
import { Exercise } from '../types';
import { X, Youtube, Activity, ArrowRight } from 'lucide-react'; // Added Youtube, removed unused icons

interface ExerciseGuideModalProps {
  exercise: Exercise;
  onClose: () => void;
}

const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({ exercise, onClose }) => {
  const handleYoutubeSearch = () => {
    const searchQuery = encodeURIComponent(`${exercise.name} exercise tutorial form`);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--md-sys-color-surface)] w-full max-w-md max-h-[90vh] rounded-[48px] shadow-2xl flex flex-col overflow-hidden border border-white/10">
        
        {/* Header */}
        <div className="p-8 flex justify-between items-start bg-white/50 border-b border-gray-100">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 border border-[var(--md-sys-color-primary)]/10">
                <Activity size={10} /> Exercise Guide
              </span>
            </div>
            <h3 className="font-black text-2xl text-[var(--md-sys-color-on-surface)] leading-tight">
              {exercise.name}
            </h3>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-8 pb-8 space-y-8 custom-scrollbar pt-8">
          
          {/* Coaching & Form Tips */}
          <div className="space-y-4">
            <div className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] p-6 rounded-[32px] shadow-lg shadow-blue-500/10">
              <h4 className="flex items-center gap-2 font-black mb-3 uppercase text-xs tracking-widest opacity-60">
                <Activity size={16} /> Master Instruction
              </h4>
              <p className="text-sm leading-relaxed font-bold italic">
                "{exercise.tips}"
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-[32px] border border-dashed border-gray-200 text-center">
               <div className="flex flex-col items-center justify-center gap-4">
                 <button 
                   onClick={handleYoutubeSearch} 
                   className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
                   aria-label={`Search YouTube for ${exercise.name}`}
                 >
                   <Youtube size={36} />
                 </button>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                   Watch Form Tutorial
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseGuideModal;
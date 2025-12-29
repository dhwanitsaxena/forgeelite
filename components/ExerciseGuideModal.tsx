
import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { X, ShieldCheck, Sparkles, AlertCircle, RefreshCw, Activity, ArrowRight } from 'lucide-react';
import { generateExerciseFormPreview } from '../services/geminiService';
import M3Button from './M3Button';

interface ExerciseGuideModalProps {
  exercise: Exercise;
  onClose: () => void;
  onUpdateExercise: (updatedExercise: Exercise, dayIndex: number, exerciseIndex: number, sectionType: 'warmUpExercises' | 'exercises' | 'rehabExercises' | 'coolDownExercises') => void;
  dayIndex: number;
  exerciseIndex: number;
  sectionType: 'warmUpExercises' | 'exercises' | 'rehabExercises' | 'coolDownExercises'; // Added sectionType
}

const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({ exercise, onClose, onUpdateExercise, dayIndex, exerciseIndex, sectionType }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const startGeneration = async () => {
    // Check if image and description are already cached on the exercise object
    if (exercise.formImageUrl && exercise.formDescription) {
      setImageUrl(exercise.formImageUrl);
      setDescription(exercise.formDescription);
      return; // Exit if cached data is found
    }

    try {
      setError(null);
      setLoading(true);
      setStatusMsg("Connecting to Visual Forge...");
      const result = await generateExerciseFormPreview(exercise.name, (msg) => setStatusMsg(msg));
      
      // Update the parent's plan with the new image and description (for caching)
      onUpdateExercise({ 
        ...exercise, 
        formImageUrl: result.imageUrl, 
        formDescription: result.description 
      }, dayIndex, exerciseIndex, sectionType); // Pass sectionType here

      setImageUrl(result.imageUrl);
      setDescription(result.description);
    } catch (err: any) {
      console.error("Visual Forge Failed:", err);
      setError("We encountered an issue generating your custom anatomical visual. This is often a transient network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startGeneration();
  }, [exercise.name, sectionType]); // Re-run if exercise name or sectionType changes

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--md-sys-color-surface)] w-full max-w-md max-h-[90vh] rounded-[48px] shadow-2xl flex flex-col overflow-hidden border border-white/10">
        
        {/* Header */}
        <div className="p-8 flex justify-between items-start bg-white/50 border-b border-gray-100">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)] text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 border border-[var(--md-sys-color-primary)]/10">
                <Activity size={10} /> Anatomical Form
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
          
          {/* Main Visual Display */}
          <div className="relative rounded-[40px] overflow-hidden bg-white aspect-square shadow-inner border-2 border-gray-100">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/60 backdrop-blur-sm">
                <div className="relative mb-6">
                   <div className="w-20 h-20 border-2 border-[var(--md-sys-color-primary)]/10 rounded-full" />
                   <div className="absolute inset-0 border-t-2 border-[var(--md-sys-color-primary)] rounded-full animate-spin" />
                   <Activity className="absolute inset-0 m-auto text-[var(--md-sys-color-primary)] animate-pulse" size={32} />
                </div>
                <h4 className="text-[var(--md-sys-color-primary)] font-black text-xs uppercase tracking-widest mb-2">Syncing Biometrics</h4>
                <p className="text-gray-400 text-xs font-bold max-w-[200px] leading-relaxed uppercase tracking-widest">
                  {statusMsg || "Rendering anatomical diagram..."}
                </p>
              </div>
            ) : imageUrl ? (
              <div className="relative w-full h-full group">
                <img 
                  src={imageUrl} 
                  alt={exercise.name}
                  className="w-full h-full object-contain p-4 animate-in fade-in duration-700"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-tight leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <h4 className="text-sm font-black uppercase tracking-widest text-red-900 mb-2">Connection Interrupted</h4>
                <p className="text-gray-500 text-xs font-medium px-6 mb-8 leading-relaxed">{error}</p>
                <M3Button onClick={startGeneration} className="!bg-[var(--md-sys-color-primary)] !text-white !rounded-2xl shadow-lg">
                  <RefreshCw size={16} /> Re-Sync Visual
                </M3Button>
              </div>
            ) : null}
          </div>

          {/* Coaching & Form Tips */}
          <div className="space-y-4">
            <div className="bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] p-6 rounded-[32px] shadow-lg shadow-blue-500/10">
              <h4 className="flex items-center gap-2 font-black mb-3 uppercase text-xs tracking-widest opacity-60">
                <ShieldCheck size={16} /> Master Instruction
              </h4>
              <p className="text-sm leading-relaxed font-bold italic">
                "{exercise.tips}"
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-[32px] border border-dashed border-gray-200">
               <div className="flex items-center gap-2 mb-2 text-gray-400">
                 <ArrowRight size={14} />
                 <span className="text-xs font-black uppercase tracking-widest">Motion Direction</span>
               </div>
               <p className="text-xs text-gray-500 font-medium leading-relaxed">
                 Follow the red vector arrows in the diagram to ensure optimal joint alignment and peak contraction phase.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseGuideModal;
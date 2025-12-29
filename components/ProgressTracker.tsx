
import React, { useState } from 'react';
import { ProgressEntry } from '../types';
import { TrendingUp, Plus, Activity, Ruler, Pencil } from 'lucide-react'; // Added Pencil icon
import M3Button from './M3Button';

interface ProgressTrackerProps {
  history: ProgressEntry[];
  onAddEntry: (entry: ProgressEntry) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ history, onAddEntry }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New state for editing mode
  const [editingEntryDate, setEditingEntryDate] = useState<string | null>(null); // To store the date of the entry being edited
  const [formData, setFormData] = useState({
    weight: 75,
    waist: 80,
    neck: 40,
    hips: 95,
    chest: 100,
    arms: 35,
    // Note: bodyFat is intentionally left out for manual input as it's often calculated.
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toLocaleDateString();
    
    // Determine the date for the entry (today for new, or the edited entry's date)
    const entryDate = isEditing && editingEntryDate ? editingEntryDate : today;

    const newEntry: ProgressEntry = {
      date: entryDate,
      weekNumber: 0, // Parent component (App.tsx) will override this
      weight: formData.weight,
      measurements: {
        waist: formData.waist,
        neck: formData.neck,
        hips: formData.hips,
        chest: formData.chest,
        arms: formData.arms
      }
    };

    onAddEntry(newEntry);
    setIsAdding(false);
    setIsEditing(false);
    setEditingEntryDate(null);
    // Reset form data to defaults (or current profile values if available)
    setFormData({
      weight: 75,
      waist: 80,
      neck: 40,
      hips: 95,
      chest: 100,
      arms: 35,
    });
  };

  const handleEditClick = (entry: ProgressEntry) => {
    setIsEditing(true);
    setIsAdding(false); // Ensure we're not in adding mode
    setEditingEntryDate(entry.date);
    setFormData({
      weight: entry.weight,
      waist: entry.measurements.waist || 80,
      neck: entry.measurements.neck || 40,
      hips: entry.measurements.hips || 95,
      chest: entry.measurements.chest || 100,
      arms: entry.measurements.arms || 35,
    });
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingEntryDate(null);
    // Reset form data
    setFormData({
      weight: 75,
      waist: 80,
      neck: 40,
      hips: 95,
      chest: 100,
      arms: 35,
    });
  };

  const maxWeight = Math.max(...history.map(h => h.weight), 1);
  const minWeight = Math.min(...history.map(h => h.weight), 1);
  const weightRange = maxWeight - minWeight || 10;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Chart Section */}
      <div className="bg-[var(--md-sys-color-surface)] p-6 rounded-[32px] shadow-sm border border-[var(--md-sys-color-outline)]/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
            <TrendingUp size={18} className="text-[var(--md-sys-color-primary)]" /> Weight Trend
          </h3>
          <span className="text-xs font-bold text-gray-400 uppercase">Last {history.length} weeks</span>
        </div>
        
        {history.length > 1 ? (
          <div className="h-32 flex items-end gap-2 px-2">
            {history.map((entry, i) => {
              const height = ((entry.weight - minWeight + (weightRange * 0.2)) / (weightRange * 1.4)) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div 
                    className="w-full bg-[var(--md-sys-color-primary-container)] rounded-t-lg transition-all duration-500 hover:bg-[var(--md-sys-color-primary)]" 
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] mt-1 text-[var(--md-sys-color-on-surface-variant)] truncate w-full text-center">
                    {entry.date.split('/')[0]}/{entry.date.split('/')[1]}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-[var(--md-sys-color-outline)]/20 rounded-2xl text-[var(--md-sys-color-on-surface-variant)] text-xs text-center px-6">
            Log more weight entries to visualize your progress trend.
          </div>
        )}
      </div>

      {/* Action Button or Form */}
      {!isAdding && !isEditing ? (
        <M3Button onClick={() => setIsAdding(true)} fullWidth variant="tonal">
          <Plus size={18} /> Log Weekly Measurements
        </M3Button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[var(--md-sys-color-surface)] p-6 rounded-[32px] border border-[var(--md-sys-color-primary)]/20 shadow-xl space-y-4">
          <h4 className="font-bold text-[var(--md-sys-color-primary)] mb-2 flex items-center gap-2">
            <Activity size={18} /> {isEditing ? `Edit Entry for ${editingEntryDate}` : 'New Progress Log'}
          </h4>
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="block text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">Weight (kg)</label>
                 <input 
                   type="number" step="0.1" value={formData.weight} 
                   onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                   className="w-full bg-[var(--md-sys-color-secondary-container)] border-none rounded-xl p-3 text-[var(--md-sys-color-on-surface)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">Waist (cm)</label>
                 <input 
                   type="number" value={formData.waist} 
                   onChange={e => setFormData({...formData, waist: parseInt(e.target.value)})}
                   className="w-full bg-[var(--md-sys-color-secondary-container)] border-none rounded-xl p-3 text-[var(--md-sys-color-on-surface)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                 />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="block text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">Neck (cm)</label>
                 <input 
                   type="number" value={formData.neck} 
                   onChange={e => setFormData({...formData, neck: parseInt(e.target.value)})}
                   className="w-full bg-[var(--md-sys-color-secondary-container)] border-none rounded-xl p-3 text-[var(--md-sys-color-on-surface)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">Hips (cm)</label>
                 <input 
                   type="number" value={formData.hips} 
                   onChange={e => setFormData({...formData, hips: parseInt(e.target.value)})}
                   className="w-full bg-[var(--md-sys-color-secondary-container)] border-none rounded-xl p-3 text-[var(--md-sys-color-on-surface)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                 />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">Chest</label>
                  <input 
                    type="number" value={formData.chest} 
                    onChange={e => setFormData({...formData, chest: parseInt(e.target.value)})}
                    className="w-full bg-[var(--md-sys-color-secondary-container)] border-none rounded-xl p-2 text-sm text-[var(--md-sys-color-on-surface)] focus:ring-2 focus->ring-[var(--md-sys-color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase mb-1">Arms</label>
                  <input 
                    type="number" value={formData.arms} 
                    onChange={e => setFormData({...formData, arms: parseInt(e.target.value)})}
                    className="w-full bg-[var(--md-sys-color-secondary-container)] border-none rounded-xl p-2 text-sm text-[var(--md-sys-color-on-surface)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)]"
                  />
                </div>
             </div>
          </div>
          <div className="flex gap-2 pt-2">
            <M3Button onClick={handleCancelForm} variant="text" fullWidth>Cancel</M3Button>
            <M3Button type="submit" fullWidth>
              {isEditing ? 'Update Entry' : 'Save Entry'}
            </M3Button>
          </div>
        </form>
      )}

      {/* History List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest px-2">Log History</h4>
        {history.slice().reverse().map((entry, i) => (
          <div key={i} className="bg-[var(--md-sys-color-surface)] p-4 rounded-2xl border border-[var(--md-sys-color-outline)]/10 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-[var(--md-sys-color-primary)]">{entry.date}</span>
              <div className="flex gap-3 mt-1">
                <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">{entry.weight}kg</span>
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-[60%] custom-scrollbar">
               <div className="flex flex-col items-center px-2 py-1 bg-[var(--md-sys-color-secondary-container)] rounded-lg shrink-0">
                  <span className="text-[9px] text-gray-400 uppercase">W</span>
                  <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)]">{entry.measurements.waist}</span>
               </div>
               <div className="flex flex-col items-center px-2 py-1 bg-[var(--md-sys-color-secondary-container)] rounded-lg shrink-0">
                  <span className="text-[9px] text-gray-400 uppercase">N</span>
                  <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)]">{entry.measurements.neck}</span>
               </div>
               {entry.measurements.hips && (
                 <div className="flex flex-col items-center px-2 py-1 bg-[var(--md-sys-color-secondary-container)] rounded-lg shrink-0">
                    <span className="text-[9px] text-gray-400 uppercase">H</span>
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)]">{entry.measurements.hips}</span>
                 </div>
               )}
               <div className="flex flex-col items-center px-2 py-1 bg-[var(--md-sys-color-secondary-container)] rounded-lg shrink-0">
                  <span className="text-[9px] text-gray-400 uppercase">C</span>
                  <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)]">{entry.measurements.chest}</span>
               </div>
               <div className="flex flex-col items-center px-2 py-1 bg-[var(--md-sys-color-secondary-container)] rounded-lg shrink-0">
                  <span className="text-[9px] text-gray-400 uppercase">A</span>
                  <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface)]">{entry.measurements.arms}</span>
                 </div>
            </div>
            <M3Button 
              onClick={() => handleEditClick(entry)} 
              variant="text" 
              className="!p-1 !min-w-0 !h-auto !text-[var(--md-sys-color-primary)]"
            >
              <Pencil size={16} />
            </M3Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
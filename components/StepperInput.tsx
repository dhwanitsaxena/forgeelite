import React from 'react';
import { Cake } from 'lucide-react'; // Example import, adjust as needed

interface StepperInputProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  unit?: string;
  step?: number;
  icon?: React.ElementType; // New prop for Lucide icon
}

const StepperInput: React.FC<StepperInputProps> = ({ label, value, onIncrement, onDecrement, unit, step = 1, icon: Icon }) => (
  <div className="bg-[var(--md-sys-color-secondary-container)] p-5 rounded-[32px] flex flex-col gap-3">
    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
      {Icon && <Icon size={14} className="text-[var(--md-sys-color-primary)]" />}
      {label}
    </label>
    <div className="flex items-center justify-between">
      <button 
        onClick={onDecrement}
        className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-surface)] flex items-center justify-center text-[var(--md-sys-color-primary)] shadow-sm hover:bg-[var(--md-sys-color-primary-container)] transition-colors"
      >
        <div className="w-4 h-0.5 bg-current rounded-full" />
      </button>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-[var(--md-sys-color-on-secondary-container)]">
          {step < 1 ? value.toFixed(1) : value}
        </span>
        {unit && <span className="text-sm font-bold text-gray-400">{unit}</span>}
      </div>
      <button 
        onClick={onIncrement}
        className="w-12 h-12 rounded-2xl bg-[var(--md-sys-color-surface)] flex items-center justify-center text-[var(--md-sys-color-primary)] shadow-sm hover:bg-[var(--md-sys-color-primary-container)] transition-colors"
      >
        <div className="relative w-4 h-4">
          <div className="absolute top-1/2 left-0 w-4 h-0.5 bg-current rounded-full -translate-y-1/2" />
          <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-current rounded-full -translate-x-1/2" />
        </div>
      </button>
    </div>
  </div>
); 

export default StepperInput;
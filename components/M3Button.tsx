
import React from 'react';

interface M3ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'filled' | 'outlined' | 'tonal' | 'text';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  // Added optional className property to support custom styling from parent components
  className?: string;
}

const M3Button: React.FC<M3ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'filled', 
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = ''
}) => {
  const baseStyles = "px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2";
  
  const variants = {
    filled: "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90 shadow-sm",
    tonal: "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:opacity-90",
    outlined: "border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/5",
    text: "text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      // Merging the base and variant styles with the provided className
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export default M3Button;

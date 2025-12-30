
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

interface SwipeToConfirmButtonProps {
  onConfirm: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const SwipeToConfirmButton: React.FC<SwipeToConfirmButtonProps> = ({ onConfirm, children, className, disabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const initialClientXRef = useRef(0);
  const initialTranslateXRef = useRef(0);

  const dragThreshold = 0.7; // 70% of the container width to confirm

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const resetHandle = useCallback(() => {
    setTranslateX(0);
    setIsDragging(false);
  }, []);

  const handleDragStart = useCallback((clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
    initialClientXRef.current = clientX;
    initialTranslateXRef.current = translateX; // Store current translateX when drag starts
    if (handleRef.current) {
      handleRef.current.style.transition = 'none'; // Disable transition during drag
    }
  }, [disabled, translateX]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || disabled) return;
    if (containerRef.current && handleRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const handleWidth = handleRef.current.offsetWidth;
      
      const deltaX = clientX - initialClientXRef.current;
      let newTranslateX = initialTranslateXRef.current + deltaX;
      
      // Ensure handle stays within bounds (0 to containerWidth - handleWidth)
      newTranslateX = Math.max(0, Math.min(newTranslateX, containerRect.width - handleWidth));
      setTranslateX(newTranslateX);
    }
  }, [isDragging, disabled]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || disabled) return;
    if (handleRef.current) {
      handleRef.current.style.transition = 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out'; // Re-enable transition
    }

    if (containerWidth > 0 && translateX >= containerWidth * dragThreshold) {
      onConfirm();
    }
    resetHandle();
  }, [isDragging, disabled, containerWidth, translateX, dragThreshold, onConfirm, resetHandle]);

  // Mouse event handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    handleDragStart(e.clientX);
    const onMouseMove = (moveEvent: MouseEvent) => handleDragMove(moveEvent.clientX);
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      handleDragEnd();
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [disabled, handleDragStart, handleDragMove, handleDragEnd]);

  // Touch event handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault(); // Prevent scrolling
    handleDragStart(e.touches[0].clientX);
    const onTouchMove = (moveEvent: TouchEvent) => handleDragMove(moveEvent.touches[0].clientX);
    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      handleDragEnd();
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false }); // Needs to be non-passive to prevent default
    document.addEventListener('touchend', onTouchEnd);
  }, [disabled, handleDragStart, handleDragMove, handleDragEnd]);

  // Calculate visual properties
  const isConfirmedState = containerWidth > 0 && translateX >= containerWidth * dragThreshold;
  const handleVisibleWidth = handleRef.current ? handleRef.current.offsetWidth : 0;
  // Calculate progressWidth to ensure it doesn't exceed 100% or cause division by zero
  const progressWidth = containerWidth > 0 && (containerWidth - handleVisibleWidth) > 0 
    ? (translateX / (containerWidth - handleVisibleWidth)) * 100 
    : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-14 rounded-full overflow-hidden flex items-center justify-start
                  select-none ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
      style={{ backgroundColor: isConfirmedState ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-secondary-container)' }}
      onTouchStart={onTouchStart}
      onMouseDown={onMouseDown}
    >
      {/* Background progress indicator (optional, subtle) */}
      <div 
        className="absolute top-0 left-0 h-full bg-[var(--md-sys-color-primary)] opacity-20 transition-all duration-300"
        style={{ width: `${progressWidth}%` }}
      />

      {/* Main text for the button */}
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-colors duration-300
                    ${isConfirmedState ? 'text-white' : 'text-white'}`}
      >
        <span className="font-bold text-base">{children}</span>
      </div>

      {/* Draggable Handle */}
      <div
        ref={handleRef}
        className={`absolute h-full aspect-square rounded-full flex items-center justify-center shadow-lg
                    transition-transform duration-300 ease-in-out 
                    ${isConfirmedState ? 'bg-white text-green-600' : 'bg-white text-green-600'}`}
        style={{ transform: `translateX(${translateX}px)` }}
      >
        {isConfirmedState ? <CheckCircle2 size={24} /> : <ChevronRight size={24} />}
      </div>
    </div>
  );
};

export default SwipeToConfirmButton;
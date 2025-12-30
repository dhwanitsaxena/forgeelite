
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

  // Use ResizeObserver for robust container width tracking
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setContainerWidth(width);
    });

    observer.observe(currentContainer);

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, []);

  const resetHandle = useCallback(() => {
    setTranslateX(0);
    setIsDragging(false);
  }, []);

  const handleDragStart = useCallback((clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
    initialClientXRef.current = clientX;
    initialTranslateXRef.current = translateX;
    if (handleRef.current) {
      handleRef.current.style.transition = 'none'; // Disable transition during drag
    }
  }, [disabled, translateX]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || disabled) return;
    if (containerWidth === 0 || !handleRef.current) return;

    const handleWidth = handleRef.current.offsetWidth;
    
    const deltaX = clientX - initialClientXRef.current;
    let newTranslateX = initialTranslateXRef.current + deltaX;
    
    newTranslateX = Math.max(0, Math.min(newTranslateX, containerWidth - handleWidth));
    setTranslateX(newTranslateX);
  }, [isDragging, disabled, containerWidth]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || disabled) return;
    if (handleRef.current) {
      handleRef.current.style.transition = 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out';
    }

    if (containerWidth > 0 && translateX >= containerWidth * dragThreshold) {
      onConfirm();
    }
    resetHandle();
  }, [isDragging, disabled, containerWidth, translateX, dragThreshold, onConfirm, resetHandle]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    // Mouse event handlers
    const onMouseDown = (e: MouseEvent) => {
      if (disabled) return;
      e.preventDefault(); // Prevent default text selection
      handleDragStart(e.clientX);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      handleDragEnd();
    };

    // Touch event handlers
    const onTouchStart = (e: TouchEvent) => {
      if (disabled) return;
      e.preventDefault(); // This is crucial to prevent default scrolling on touch devices
      handleDragStart(e.touches[0].clientX);
      document.addEventListener('touchmove', onTouchMove, { passive: false }); // Ensure touchmove can also preventDefault
      document.addEventListener('touchend', onTouchEnd);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling during drag
      handleDragMove(e.touches[0].clientX);
    };

    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      handleDragEnd();
    };

    // Attach native event listeners to the container
    currentContainer.addEventListener('mousedown', onMouseDown, { passive: false }); // Mouse down also set to passive: false for consistency
    currentContainer.addEventListener('touchstart', onTouchStart, { passive: false });

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('mousedown', onMouseDown);
        currentContainer.removeEventListener('touchstart', onTouchStart);
      }
      // Ensure document-level listeners are cleaned up if component unmounts mid-drag
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [disabled, handleDragStart, handleDragMove, handleDragEnd]);


  // Calculate visual properties
  const isConfirmedState = containerWidth > 0 && translateX >= containerWidth * dragThreshold;
  const handleVisibleWidth = handleRef.current ? handleRef.current.offsetWidth : 0;
  const progressWidth = containerWidth > 0 && (containerWidth - handleVisibleWidth) > 0 
    ? (translateX / (containerWidth - handleVisibleWidth)) * 100 
    : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-14 rounded-full overflow-hidden flex items-center justify-start
                  select-none ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
      style={{ backgroundColor: isConfirmedState ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-secondary-container)' }}
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
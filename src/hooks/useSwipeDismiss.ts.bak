import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SwipeDismissOptions {
  onDismiss: () => void;
  direction?: 'down' | 'left' | 'both';
  threshold?: number;
  enabled?: boolean;
}

export function useSwipeDismiss({
  onDismiss,
  direction = 'down',
  threshold = 60,
  enabled = true
}: SwipeDismissOptions) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (!enabled) return;
      const touch = e.touches[0];
      startPos.current = { x: touch.clientX, y: touch.clientY };
      setIsSwiping(true);
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (!enabled || !startPos.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - startPos.current.x;
      const deltaY = touch.clientY - startPos.current.y;

      if (direction === 'down') {
        // Only allow downward drag
        if (deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX) * 0.8) {
          setOffset({ x: 0, y: deltaY });
        }
      } else if (direction === 'left') {
        // Only allow leftward drag
        if (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY) * 0.8) {
          setOffset({ x: deltaX, y: 0 });
        }
      } else if (direction === 'both') {
        if (
          (deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX) * 0.8) ||
          (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY) * 0.8)
        ) {
          setOffset({ x: deltaX < 0 ? deltaX : 0, y: deltaY > 0 ? deltaY : 0 });
        }
      }
    },
    [direction, enabled]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !startPos.current) return;
    const { x, y } = offset;

    let shouldDismiss = false;
    if (direction === 'down' && y > threshold) {
      shouldDismiss = true;
    } else if (direction === 'left' && x < -threshold) {
      shouldDismiss = true;
    } else if (direction === 'both' && (y > threshold || x < -threshold)) {
      shouldDismiss = true;
    }

    startPos.current = null;
    setIsSwiping(false);
    setOffset({ x: 0, y: 0 });

    if (shouldDismiss) {
      onDismiss();
    }
  }, [direction, enabled, offset, onDismiss, threshold]);

  return {
    offset,
    isSwiping,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
}

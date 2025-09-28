import { useEffect, useRef } from 'react';

export const useAnimation = (animationClass, dependencies = []) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add animation class
    element.classList.add(animationClass);

    // Remove animation class after animation completes
    const handleAnimationEnd = () => {
      element.classList.remove(animationClass);
    };

    element.addEventListener('animationend', handleAnimationEnd);

    return () => {
      element.removeEventListener('animationend', handleAnimationEnd);
    };
  }, dependencies);

  return elementRef;
}; 
import { useState, useCallback } from 'react';

/**
 * Simulates an async data-fetching delay.
 * @param delay  milliseconds to wait (default 1200)
 * Returns { isLoading, triggerLoad }
 */
const useSimulatedLoading = (delay = 1200) => {
  const [isLoading, setIsLoading] = useState(false);

  const triggerLoad = useCallback(
    (onComplete?: () => void) => {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        onComplete?.();
      }, delay);
      return () => clearTimeout(timer);
    },
    [delay]
  );

  return { isLoading, triggerLoad };
};

export default useSimulatedLoading;

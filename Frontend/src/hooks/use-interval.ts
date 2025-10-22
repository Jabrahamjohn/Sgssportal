import React from 'react';

type IntervalStatus = 'play' | 'pause';

export type IntervalOptions = {
  status?: IntervalStatus;
};

/**
 * Custom hook to run a callback function at specified intervals, with support for pause/resume.
 *
 * @param callback - The function to be executed at each interval tick.
 * @param delay - The time delay between executions in milliseconds. Default is 1000ms.
 * @param options - Optional configuration object to set initial status (`play` or `pause`).
 *
 * @returns An object containing:
 * - `removeInterval`: Function to manually clear the interval.
 * - `status`: Current interval status (`play` or `pause`).
 * - `toggleInterval`: Function to switch between play and pause states.
 *
 * @example
 * const { toggleInterval, removeInterval, status } = useInterval(() => {
 *   console.log('Tick');
 * }, 1000, { status: 'pause' });
 *
 * toggleInterval('play'); // Start interval
 * toggleInterval('pause'); // Pause it
 */
function useInterval(callback: () => void, delay: number = 1000, options?: IntervalOptions) {
  const savedCallback = React.useRef<() => void>(() => {});
  const [intervalId, setIntervalId] = React.useState<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = React.useState<IntervalStatus>(options?.status || 'play');

  const toggleInterval = React.useCallback((newStatus: IntervalStatus) => {
    setStatus(newStatus);
  }, []);

  const removeInterval = React.useCallback(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  }, [intervalId]);

  // Save latest callback
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Start or stop interval depending on `status`
  React.useEffect(() => {
    if (delay !== null && status === 'play') {
      const id = setInterval(() => savedCallback.current(), delay);
      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [delay, status]);

  return {
    removeInterval,
    status,
    toggleInterval,
  };
}

export default useInterval;

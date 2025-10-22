import React from 'react';

/**
 * useDebounce - A custom React hook for debouncing fast-changing values.
 *
 * This hook delays updating the returned `debouncedValue` until after a specified `delay`
 * has passed since the last time the input `value` was changed.
 *
 * It's useful for performance optimization in scenarios such as:
 *   - API calls triggered by user input (e.g., search box)
 *   - Expensive computations based on frequently changing state
 *
 * Optionally, you can pass an `onDebounce` callback that runs when the debounced value is updated.
 *
 * @template T - The type of the value to debounce
 *
 * @param {T} value - The value you want to debounce
 * @param {number} [delay=1000] - Delay in milliseconds before updating the debounced value
 * @param {Object} [options] - Optional config object
 * @param {(value: T) => void} [options.onDebounce] - Optional callback to be triggered after debounce
 *
 * @returns {T} The debounced value
 */
export default function useDebounce<T = any>(
  value: T,
  delay = 1000,
  options?: {
    onDebounce?: (value: T) => void;
  }
) {
  const { onDebounce } = options || {};

  // Local state to hold the debounced value
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value); // Update internal state
      if (onDebounce) onDebounce(value); // Call callback if provided
    }, delay);

    // Cleanup: Clear the timeout if value/delay/onDebounce changes before timeout completes
    // This prevents premature updates and ensures debounce only happens after inactivity
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, onDebounce]);

  // Return the latest debounced value
  return debouncedValue;
}

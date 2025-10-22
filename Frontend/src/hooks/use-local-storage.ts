import React from 'react';

type StorageType = 'string' | 'number' | 'array' | 'object' | 'boolean';

export type LocalStorageOptions<T = string> = {
  initialValue?: T;
  type?: StorageType;
};

/**
 * React hook to sync a state value with `localStorage`, with built-in support for
 * type parsing and default values.
 *
 * @template T - Type of the stored value
 * @param key - The localStorage key
 * @param options - Optional configuration (type parser and initial value)
 *
 * @returns An object with:
 * - `value`: The current value from localStorage
 * - `setValue`: Function to update and persist the value
 * - `removeValue`: Function to delete the key from localStorage
 *
 * @example
 * const { value, setValue, removeValue } = useLocalStorage<number>('count', {
 *   initialValue: 0,
 *   type: 'number',
 * });
 */
function useLocalStorage<T = any>(key: string, options: LocalStorageOptions<T> = { type: 'string' }) {
  const { initialValue, type = 'string' } = options;

  const [value, setValue] = React.useState<T | null>(() => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        switch (type) {
          case 'array':
          case 'object':
          case 'boolean':
            return JSON.parse(stored);
          case 'number':
            return Number(stored) as T;
          case 'string':
          default:
            return stored as unknown as T;
        }
      } else {
        return initialValue ?? null;
      }
    } catch (err) {
      console.warn(`Error reading localStorage key "${key}":`, err);
      return initialValue ?? null;
    }
  });

  /**
   * Updates both the state and the localStorage value.
   */
  const setStoredValue = React.useCallback(
    (newValue: T | null) => {
      if (typeof window === 'undefined') return;

      try {
        setValue(newValue);
        if (newValue === null) {
          localStorage.removeItem(key);
        } else {
          const isObject = typeof newValue === 'object' || typeof newValue === 'boolean';
          const valueToStore = isObject ? JSON.stringify(newValue) : String(newValue);
          localStorage.setItem(key, valueToStore);
        }
      } catch (err) {
        console.warn(`Error setting localStorage key "${key}":`, err);
      }
    },
    [key]
  );

  /**
   * Removes the value from localStorage and resets the state.
   */
  const removeValue = React.useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
      setValue(null);
    } catch (err) {
      console.warn(`Error removing localStorage key "${key}":`, err);
    }
  }, [key]);

  return {
    value,
    setValue: setStoredValue,
    removeValue,
  };
}

export default useLocalStorage;

import React from 'react';
import { useSearchParams as useNextSearchParams } from 'react-router-dom';

export type UseSearchParamsType = {
  /** Retrieves the value of a query param directly using the raw key. */
  get: (key: string) => string | null;

  /** Retrieves the value of a query param using the optionally prefixed key. */
  retrieve: (key: string) => string | null;

  /** Sets a single query param. */
  set: (key: string, value: string, options?: NavigationOptionsType) => void;

  /** Sets or updates multiple query params at once. */
  update: (params: Record<string, string | number>, options?: NavigationOptionsType) => void;

  /** Removes a single query param by key. */
  remove: (key: string, options?: NavigationOptionsType) => void;

  /** Removes multiple query params by key. */
  delete: (keys: string[], options?: NavigationOptionsType) => void;
};

type UseSearchParamsOptionsType = {
  /**
   * Note: Please provide this optional prefix to mostly avoid re-renders and differentiate search params
   * when this hook is used multiple times in the same component or a parent component
   **/
  prefix?: string;
};

type NavigationOptionsType = {
  /** If true, replaces the current history entry instead of pushing a new one. */
  replace?: boolean;
};

/**
 * A wrapper around `useSearchParams` that provides easy methods
 * for getting, setting, and removing search parameters with optional key prefixing.
 *
 * @param options - Optional configuration (e.g., a prefix to avoid param name collisions)
 * @returns An object containing methods to interact with the URL's search parameters.
 */
export default function useSearchParams(options?: UseSearchParamsOptionsType): UseSearchParamsType {
  const [searchParams, setSearchParams] = useNextSearchParams();

  /**
   * Prepends the prefix (if any) to the key.
   */
  const getKey = React.useCallback(
    (key: string) => {
      if (options?.prefix) return options.prefix + '_' + key;
      return key;
    },
    [options?.prefix]
  );

  /**
   * Retrieves a param value using the prefixed key.
   */
  const retrieveParam = React.useCallback(
    (key: string) => {
      const itemKey = getKey(key);
      return searchParams.get(itemKey);
    },
    [getKey, searchParams]
  );

  /**
   * Converts current search params iterable to an object.
   */
  const getCurrentParams = React.useCallback((currentParams: Iterable<[string, string]>) => {
    const params: Record<string, string> = {};
    for (const [key, value] of currentParams) {
      params[key] = value;
    }
    return params;
  }, []);

  /**
   * Sets a single query param (with prefix if provided).
   *
   * @param key - The key of the param to set.
   * @param value - The value of the param.
   * @param options - Navigation options (e.g. replace).
   */
  const setParams = React.useCallback(
    (key: string, value: string, options?: NavigationOptionsType) =>
      setSearchParams(
        (currentParams) => ({
          ...getCurrentParams(currentParams.entries()),
          [getKey(key)]: value,
        }),
        options
      ),
    [setSearchParams, getCurrentParams, getKey]
  );

  /**
   * Sets or updates multiple query params at once.
   *
   * @param params - Key-value pairs of params to set.
   * @param options - Navigation options.
   */
  const setMultipleParams = React.useCallback(
    (params: Record<string, string | number>, options?: NavigationOptionsType) => {
      setSearchParams((currentParams) => {
        const newParams = Object.entries(params).reduce(
          (acc: Record<string, string>, [key, value]) => ({
            ...acc,
            [getKey(key)]: value.toString(),
          }),
          {}
        );
        return { ...getCurrentParams(currentParams.entries()), ...newParams };
      }, options);
    },
    [setSearchParams, getCurrentParams, getKey]
  );

  /**
   * Removes a single query param.
   *
   * @param name - The key of the param to remove.
   * @param options - Navigation options.
   */
  const removeParam = React.useCallback(
    (name: string, options?: NavigationOptionsType) => {
      setSearchParams((prevParams) => {
        const newParams: Record<string, string> = {};
        prevParams.forEach((value, currentKey) => {
          const keyToRemove = getKey(name);
          if (currentKey !== keyToRemove) newParams[currentKey] = value;
        });
        return newParams;
      }, options);
    },
    [setSearchParams, getKey]
  );

  /**
   * Removes multiple query params.
   *
   * @param keys - An array of keys to remove.
   * @param options - Navigation options.
   */
  const removeParams = React.useCallback(
    (keys: string[], options?: NavigationOptionsType) => {
      const keysToRemove = keys.map((item) => getKey(item));
      setSearchParams((prevParams) => {
        const newParams: Record<string, string> = {};
        prevParams.forEach((value, currentKey) => {
          if (!keysToRemove.includes(currentKey)) newParams[currentKey] = value;
        });
        return newParams;
      }, options);
    },
    [setSearchParams, getKey]
  );

  /**
   * Returns a stable reference of all operations and raw access.
   */
  const result = React.useMemo(() => {
    return {
      /** Raw get, without prefixing */
      get: (item: string) => searchParams.get(item),
      retrieve: retrieveParam,
      set: setParams,
      update: setMultipleParams,
      remove: removeParam,
      delete: removeParams,
    };
  }, [searchParams, setMultipleParams, setParams, retrieveParam, removeParam, removeParams]);

  return result;
}

import React from 'react';

import useDebounce from '../use-debounce';
import useSearchParams from '../use-search-params';

export default function useDebouncedSearchParamInput(options?: {
  /**
   * Optional prefix to namespace the query param key.
   * Helps avoid collisions and unnecessary re-renders
   * when using this hook multiple times in the same or nested components.
   */
  prefix?: string;
}): {
  /** The latest debounced search value from the URL query param. */
  debouncedValue: string | undefined;

  /** The current uncontrolled input value (may differ from debounced). */
  value: string | undefined;

  /** Event handler to update the search input value. */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
} {
  /**
   * Construct the search key used in the query params.
   * Defaults to 'search' but is prefixed if an option is provided.
   */
  const key = React.useMemo(() => {
    return options?.prefix ? `${options.prefix}_search` : 'search';
  }, [options?.prefix]);

  const searchParams = useSearchParams();

  /**
   * The debounced value fetched from the URL.
   * It is always in sync with the URL state.
   */
  const search = React.useMemo(() => searchParams.get(key), [searchParams, key]);

  /**
   * Local state for the input field. Initialized from the URL.
   */
  const [searchValue, setSearchValue] = React.useState(() => {
    return searchParams.get(key) || undefined;
  });

  /**
   * Hook to debounce the search input before syncing with URL.
   * Prevents rapid updates to the URL and improves performance.
   */
  useDebounce(searchValue, undefined, {
    onDebounce: (value) => {
      if (value === undefined && !search) return;

      // Update the URL only when the value actually changes
      if (search !== value) {
        if (value === undefined) {
          searchParams.remove(key);
        } else {
          searchParams.set(key, value);
        }
      }
    },
  });

  return {
    value: searchValue,
    onChange: (e) => setSearchValue(e.target.value),
    debouncedValue: search || undefined,
  };
}

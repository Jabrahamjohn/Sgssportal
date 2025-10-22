import type { Dayjs } from 'dayjs';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE } from '../../config/app';
import type { ReactPaginationState } from '../../types';
import { dates, getDate } from '../../utils';

import useDebouncedSearchParamInput from './use-debounced-search-param-input';
import useSearchParams, { type UseSearchParamsType } from '../use-search-params';

export type UsePageFiltersType = {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  from: Dayjs | undefined;
  to: Dayjs | undefined;
  status: string | null;
  keys: {
    status: string;
    page: string;
    limit: string;
    from: string;
    to: string;
    search: string;
  };
  search: string | undefined;
  searchInput: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value: string | undefined;
  };
  searchParams: UseSearchParamsType;
  filters: {
    limit: number;
    page: number;
    search: string | undefined;
    from: string | undefined;
    to: string | undefined;
    status: string | null;
  };
  changeFilters: (name: string, value: string | Date | Record<string, Date> | null) => void;
  changePagination: ReactPaginationState;
};

/**
 * Custom hook for handling search params and pagination filters
 * across a page-based view. Designed for React Table integration.
 *
 * @param {Object} [options] - Optional configuration.
 * @param {string} [options.prefix] - Optional prefix to namespace search keys.
 *
 * @returns {UsePageFiltersType} An object containing filter state,
 * search params interface, and pagination/filter utilities.
 */
export default function usePageFilters(options?: { prefix?: string }) {
  // Input handler with debounce and prefix-based param keying
  const debouncedSearchInput = useDebouncedSearchParamInput({
    prefix: options?.prefix,
  });

  // Custom hook to manage URLSearchParams
  const searchParams = useSearchParams({ prefix: options?.prefix });

  /**
   * Derived search param keys using optional prefix.
   * Prevents collisions in shared views/components.
   */
  const keys = React.useMemo(() => {
    const prefix = options?.prefix ? options.prefix + '_' : '';

    return {
      status: prefix + 'status',
      page: prefix + 'page',
      limit: prefix + 'limit',
      from: prefix + 'from',
      to: prefix + 'to',
      search: prefix + 'search',
    };
  }, [options?.prefix]);

  /**
   * Extracts filter values and pagination state from the search params.
   */
  const pageFilters = React.useMemo(() => {
    let page = +(searchParams.get(keys.page) || '1');
    if (!page || isNaN(+page) || page < 1) page = 1;

    let pageSize = +(searchParams.get(keys.limit) || DEFAULT_PAGINATION_SIZE);
    if (!pageSize || isNaN(+pageSize) || pageSize < 1) {
      pageSize = DEFAULT_PAGINATION_SIZE;
    }

    const fromParam = searchParams.get(keys.from);
    const toParam = searchParams.get(keys.to);
    const from = fromParam ? dates.getDate<'dayjs'>(fromParam, 'dayjs') : undefined;
    const to = toParam ? dates.getDate<'dayjs'>(toParam, 'dayjs') : undefined;

    const status = searchParams.get(keys.status);

    const pagination = {
      pageIndex: page - 1,
      pageSize,
    };

    return {
      pagination,
      from,
      to,
      status,
    };
  }, [searchParams, keys]);

  /**
   * Combines pagination, date range, search, and status into a filters object.
   */
  const filters = React.useMemo(() => {
    return {
      limit: pageFilters.pagination.pageSize,
      page: pageFilters.pagination.pageIndex + 1,
      search: debouncedSearchInput.debouncedValue,
      from: pageFilters.from ? pageFilters.from.format('YYYY-MM-DD') : undefined,
      to: pageFilters.to ? pageFilters.to.format('YYYY-MM-DD') : undefined,
      status: pageFilters.status,
    };
  }, [pageFilters, debouncedSearchInput]);

  /**
   * Updates one or more filters based on the field and new value.
   *
   * @param {string} name - Filter key (e.g. 'status', 'dateRange', etc.)
   * @param {string | Date | Record<string, Date> | null} value - New filter value
   */
  const changeFilters = React.useCallback(
    (name: string, value: string | Date | Record<string, Date> | null) => {
      if (value) {
        if (value instanceof Date) {
          searchParams.set(name, getDate<string>(value, true));
        } else if (typeof value !== 'string') {
          const params = Object.entries(value).reduce((acc: Record<string, string>, item) => {
            return {
              ...acc,
              [item[0]]: getDate<string>(item[1], true),
            };
          }, {});
          searchParams.update(params);
        } else {
          searchParams.set(name, value);
        }
      } else {
        if (name.endsWith('dateRange')) {
          searchParams.delete(['from', 'to']);
        } else {
          searchParams.remove(name);
        }
      }
    },
    [searchParams]
  );

  /**
   * Updates pagination state in the search params.
   *
   * @param {ReactPaginationState} onChange - Callback or object containing new pagination values.
   */
  const changePagination: ReactPaginationState = React.useCallback(
    (onChange) => {
      if (typeof onChange === 'function') {
        const values = onChange(pageFilters.pagination);
        searchParams.update({
          page: values.pageIndex + 1,
          limit: values.pageSize,
        });
      } else {
        searchParams.update({
          page: onChange.pageIndex + 1,
          limit: onChange.pageSize,
        });
      }
    },
    [pageFilters, searchParams]
  );

  return {
    keys,
    search: debouncedSearchInput.debouncedValue,
    searchInput: {
      onChange: debouncedSearchInput.onChange,
      value: debouncedSearchInput.value,
    },
    searchParams,
    filters,
    changeFilters,
    changePagination,
    ...pageFilters,
  };
}

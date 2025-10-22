import type { PaginatedResponseType, QueryListOptionsType } from '~/types';
import { formatDate } from '~/utils';
import type { ApiPaginatedResponseType } from '../types';

export function createSearchUrl(url: string, params?: Record<string, string | number | null | Date>) {
  if (!params) return url;

  const searchParams = new URLSearchParams('');

  Object.entries(params).forEach((param) => {
    const key = param[0];
    const value = param[1];

    if (key && value instanceof Date) {
      searchParams.set(key, formatDate(value, 'YYYY-MM-DD'));
    } else if (key && value) {
      searchParams.set(key, value.toString());
    }
  });

  const searchUrl = url + '?' + searchParams;

  return searchUrl;
}

export function getPaginationParamsFromResult(
  response: ApiPaginatedResponseType<any>,
  filters?: QueryListOptionsType
): Omit<PaginatedResponseType<any>['data'], 'result'> {
  let currentPage: number | undefined = undefined;

  // check if the current page, the client passes is valid
  if (filters?.page && filters?.page <= response.pagination.pages) {
    currentPage = filters.page;
  }

  // check the next pagination
  if (!currentPage && response.pagination.next) {
    currentPage = response.pagination.next - 1;
    if (currentPage < 1) currentPage = 1; // no page 0 obviously
  }

  // check the previous pagination
  if (!currentPage && response.pagination.prev) {
    currentPage = response.pagination.prev + 1;
    if (currentPage > response.pagination.pages) currentPage = response.pagination.pages; // no page greater the current one
  }

  const params = {
    totalPages: response.pagination.pages,
    totalRecords: response.pagination.total,
    currentPage: currentPage || 1,
    pageSize: filters?.limit || undefined,
  };

  return params;
}

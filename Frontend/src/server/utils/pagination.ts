export function getPagePagination<T = any>({ filters, items }: GetPagePaginationProps<T>): GetPagePaginationResult<T> {
  // Total Records
  const totalRecords = items.length;

  // Total Pages
  const totalPages = filters?.limit ? Math.ceil(totalRecords / filters.limit) : 1;

  // Calculate the offset
  const page = filters?.page && filters?.page < 1 ? 1 : filters?.page || 1;
  const offset = filters?.limit && page ? (page - 1) * filters.limit : undefined;

  // Get the paginated result;
  const result = offset !== undefined && filters?.limit ? items.slice(offset, offset + filters.limit) : items;

  return { currentPage: page, pageSize: filters?.limit || undefined, result, totalPages, totalRecords };
}

type GetPagePaginationProps<T> = {
  filters?: { limit?: number; page?: number };
  items: T[];
};

type GetPagePaginationResult<T> = {
  currentPage: number;
  pageSize?: number;
  result: T[];
  totalPages: number;
  totalRecords: number;
};

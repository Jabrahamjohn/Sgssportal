import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';

import { contains } from './filters';
import Pagination from './pagination';
import { DEFAULT_PAGINATION_SIZE } from '../../../config/app';
import useDebounce from '../../../hooks/use-debounce';

import type {
  ColumnDef,
  ColumnFilter,
  FilterFn,
  OnChangeFn,
  Row,
  TableOptions,
  TableState,
  VisibilityState,
} from '@tanstack/react-table';
import Skeleton from '../skeleton';

type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

type ObjectType = object;

interface TableDataType extends ObjectType {
  onRowClick?: (
    e: React.MouseEvent<
      HTMLTableRowElement | HTMLTableDataCellElement,
      MouseEvent
    >,
    data: TableDataType
  ) => void;
}

interface TableProps<T extends object> {
  containerClassName?: string;
  columnFilters?: ColumnFilter[];
  columnVisibility?: Record<keyof T, boolean>;
  columns: ColumnDef<T>[];
  data: T[];
  disabledRowClickColumns?: string[];
  enableHiding?: boolean;
  filterFn?: FilterFn<T>;
  filterValue?: string;
  footerRowCount?: number;
  loader?: {
    component?: React.ComponentType<any>;
    loading?: boolean;
    length?: number;
  };
  manualPagination?: boolean;
  onPaginationChange?: OnChangeFn<PaginationState>;
  pageCount?: number;
  pageSize?: number;
  paginate?: boolean;
  pagination?: PaginationState;
  resetCheckedItems?: () => void;
  setColumnVisibility?: OnChangeFn<VisibilityState>;
  showFooter?: boolean;
}

export type TableRef<T extends object = object> = {
  getRowsOnPage: (pageNo?: number) => Row<T>['original'][];
  getNoOfPages: () => number;
};

function Table<T extends object>(
  {
    containerClassName,
    columnFilters,
    columns = [],
    columnVisibility,
    data,
    disabledRowClickColumns = ['actions'],
    enableHiding,
    filterFn = contains,
    filterValue,
    footerRowCount = 1,
    loader,
    manualPagination,
    onPaginationChange,
    pageCount,
    pageSize = DEFAULT_PAGINATION_SIZE,
    paginate = true,
    pagination,
    resetCheckedItems,
    setColumnVisibility,
    showFooter,
  }: // showSn = false,
  TableProps<T>,
  ref: React.ForwardedRef<TableRef<T>>
) {
  const [globalFilter, setGlobalFilter] = React.useState('');

  const {
    component: LoaderComponent,
    length: loaderLength,
    loading: isLoading,
  } = loader || {};

  const colFilters = React.useMemo(() => columnFilters || [], [columnFilters]);

  const tableState = React.useMemo(() => {
    const state: Partial<TableState> = {
      columnFilters: colFilters,
      columnVisibility,
      globalFilter,
    };
    if (pagination) state.pagination = pagination;
    return state;
  }, [colFilters, columnVisibility, globalFilter, pagination]);

  const tableOptions = React.useMemo(() => {
    const params: TableOptions<T> = {
      // debugTable: true,
      // debugHeaders: true,
      // debugColumns: true,
      data,
      enableHiding,
      columns,
      initialState: {
        pagination: {
          pageSize,
          pageIndex: 0,
        },
      },
      manualPagination,
      pageCount,
      // sortDescFirst: false,
      //
      state: tableState,

      // Column Visibility
      onColumnVisibilityChange: setColumnVisibility,

      // Global Filtering
      onGlobalFilterChange: setGlobalFilter,
      globalFilterFn: filterFn,

      // Pagination
      // onPaginationChange,

      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    };

    if (onPaginationChange) params.onPaginationChange = onPaginationChange;

    return params;
  }, [
    columns,
    data,
    enableHiding,
    filterFn,
    manualPagination,
    onPaginationChange,
    pageCount,
    pageSize,
    setColumnVisibility,
    tableState,
  ]);

  const table = useReactTable(tableOptions);

  const filteredValue = useDebounce(filterValue);

  const getRowsOnPage = React.useCallback(
    (pageNo?: number) => {
      const tableState = table && table.getState();

      if (!tableState || !tableState.pagination) {
        return [];
      }

      const pageIndex = tableState.pagination.pageIndex;
      const pageSize = tableState.pagination.pageSize;

      const index = pageNo ? pageIndex + (pageNo - 1) : pageIndex;

      if (
        !table.getFilteredRowModel ||
        typeof table.getFilteredRowModel !== 'function'
      ) {
        return [];
      }

      const rowsOnPage = table
        // .getCoreRowModel()
        .getFilteredRowModel()
        .rows.slice(index * pageSize, (index + 1) * pageSize);

      return rowsOnPage.map((row) => row.original);
    },
    [table]
  );

  const getPageLength = React.useCallback(() => {
    const tableState = table && table.getPageOptions();

    if (!tableState || !tableState.length) {
      return 0;
    }
    return table.getPageOptions().length;
  }, [table]);

  React.useImperativeHandle(
    ref,
    () => ({
      getRowsOnPage,
      getNoOfPages: getPageLength,
    }),
    [getRowsOnPage, getPageLength]
  );

  React.useEffect(() => {
    if (filteredValue !== undefined) setGlobalFilter(filteredValue);
  }, [filteredValue]);

  return (
    <React.Fragment>
      {/* Table Start */}
      <div className="flex flex-col">
        <div className={`table-container ${containerClassName || ''}`.trim()}>
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        className="table-head group"
                        scope="col"
                        colSpan={header.colSpan}
                        style={{
                          width: header.getSize(),
                        }}
                      >
                        <div
                          className={`flex items-center justify-between select-none`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {loader && isLoading
                ? Array.from({ length: loaderLength || 7 }).map((_, i) => (
                    <tr key={i} className="table-row-horizontal">
                      {table.getVisibleFlatColumns().map((col) => (
                        <td key={col.id}>
                          <div className="table-data">
                            {LoaderComponent ? (
                              <LoaderComponent />
                            ) : (
                              <Skeleton.Input
                                active
                                style={{
                                  display: 'inline-block',
                                  width: 'auto',
                                }}
                                size="small"
                              />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                : table.getRowModel().rows.map((row) => {
                    const onRowClick = (row.original as TableDataType)
                      .onRowClick;

                    return (
                      <tr
                        className={`table-row-horizontal ${
                          onRowClick ? 'hover cursor-pointer' : ''
                        }`}
                        key={row.id}
                      >
                        {row.getVisibleCells().map((cell) => {
                          return (
                            <td
                              onClick={
                                !disabledRowClickColumns.includes(
                                  cell.column.columnDef.id || ''
                                ) && onRowClick
                                  ? (e) => {
                                      onRowClick(e, row.original);
                                    }
                                  : undefined
                              }
                              key={cell.id}
                              style={{ width: cell.column.getSize() }}
                            >
                              <div className="table-data">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
            </tbody>
            {showFooter ? (
              <tfoot>
                {table.getFooterGroups().map((footerGroup, index) => {
                  return (
                    <React.Fragment key={footerGroup.id + `-${index}`}>
                      <tr className="table-footer-row-horizontal">
                        {/* {showSn && <td className="table-footer-data"></td>} */}
                        {footerGroup.headers.map((header) => {
                          return (
                            <td
                              key={header.id}
                              colSpan={header.colSpan}
                              className="table-footer-data"
                              style={{
                                width: header.getSize(),
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.footer,
                                    header.getContext()
                                  )}
                            </td>
                          );
                        })}
                      </tr>

                      {footerRowCount > 1 && (
                        <>
                          {Array.from({ length: footerRowCount - 1 }).map(
                            (_, i) => {
                              const key =
                                footerGroup.id + `-${i + 1}-` + 'footer';
                              return (
                                <tr
                                  className="table-footer-row-horizontal"
                                  key={key}
                                >
                                  {footerGroup.headers.map((header, index) => {
                                    const columnDef = header.column
                                      .columnDef as any;
                                    const key =
                                      header.id +
                                      `-${index + 1}-` +
                                      'footer-item';
                                    return (
                                      <td
                                        key={key}
                                        colSpan={header.colSpan}
                                        className="table-footer-data"
                                        style={{
                                          width: header.getSize(),
                                        }}
                                      >
                                        {header.isPlaceholder
                                          ? null
                                          : flexRender(
                                              columnDef['footer' + (i + 2)],
                                              header.getContext()
                                            )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            }
                          )}
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tfoot>
            ) : null}
          </table>
        </div>
      </div>
      {/* Table Stop */}

      {/* Pagination Start */}
      {paginate && (
        <Pagination
          canNextPage={table.getCanNextPage()}
          canPreviousPage={table.getCanPreviousPage()}
          gotoPage={table.setPageIndex}
          nextPage={table.nextPage}
          pageCount={table.getPageCount()}
          pageIndex={table.getState().pagination.pageIndex}
          pageLength={table.getPageOptions().length}
          pageSize={table.getState().pagination.pageSize}
          previousPage={table.previousPage}
          setPageSize={(size) => {
            table.setPageSize(size);
            if (resetCheckedItems) resetCheckedItems();
          }}
        />
      )}
      {/* Pagination Stop */}
    </React.Fragment>
  );
}

const ForwardedTable = React.forwardRef(Table);

export default ForwardedTable;

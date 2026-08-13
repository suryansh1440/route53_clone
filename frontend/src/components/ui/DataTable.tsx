'use client';

import React from 'react';
import { Pagination } from './Pagination';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  selectedId?: string | number | null;
  selectedIds?: (string | number)[];
  onSelectRow?: (item: T) => void;
  onToggleSelectRow?: (item: T) => void;
  onToggleSelectAll?: () => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  limit?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectedId,
  selectedIds = [],
  onSelectRow,
  onToggleSelectRow,
  onToggleSelectAll,
  loading,
  emptyState,
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}: DataTableProps<T>) {
  const isMultiSelect = Boolean(onToggleSelectRow);
  const allSelected =
    data.length > 0 && data.every((item) => selectedIds.includes(keyExtractor(item)));

  const showSelectionColumn = Boolean(onSelectRow || onToggleSelectRow);

  return (
    <div className="bg-white border border-[#7d8998] rounded-xl shadow-2xs overflow-hidden select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e9ebed] text-[#5f6b7a] font-semibold">
              {showSelectionColumn && (
                <th className="w-10 px-4 py-3 text-center">
                  {isMultiSelect && (
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={onToggleSelectAll}
                      className="accent-[#0972d3] rounded cursor-pointer"
                      title="Select / Deselect all on page"
                    />
                  )}
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 font-bold uppercase text-[11px] tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e9ebed]">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (showSelectionColumn ? 1 : 0)}
                  className="py-12 text-center text-[#5f6b7a]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-3 border-[#0972d3] border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading resources...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showSelectionColumn ? 1 : 0)}
                  className="py-12 text-center"
                >
                  {emptyState || <span className="text-[#5f6b7a]">No resources found</span>}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const key = keyExtractor(item);
                const isSelected = isMultiSelect
                  ? selectedIds.includes(key)
                  : selectedId === key;

                return (
                  <tr
                    key={key}
                    onClick={() => {
                      if (onToggleSelectRow) {
                        onToggleSelectRow(item);
                      } else if (onSelectRow) {
                        onSelectRow(item);
                      }
                    }}
                    className={`hover:bg-[#f2f8fd] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#e6f2fd]' : ''
                    }`}
                  >
                    {showSelectionColumn && (
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type={isMultiSelect ? 'checkbox' : 'radio'}
                          name="table-selection"
                          checked={isSelected}
                          onChange={() => {
                            if (onToggleSelectRow) {
                              onToggleSelectRow(item);
                            } else if (onSelectRow) {
                              onSelectRow(item);
                            }
                          }}
                          className="accent-[#0972d3] rounded cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 text-[#000716]">
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                          ? String(item[col.accessorKey] ?? '')
                          : ''}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {page && totalPages && totalItems !== undefined && limit && onPageChange && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-[#e9ebed] text-xs text-[#5f6b7a] select-none">
      <div>
        Showing <span className="font-semibold text-[#000716]">{startItem}</span> -{' '}
        <span className="font-semibold text-[#000716]">{endItem}</span> of{' '}
        <span className="font-semibold text-[#000716]">{totalItems}</span> resources
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded border border-[#7d8998] hover:bg-[#f2f3f3] text-[#000716] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-2.5 py-1 rounded text-xs font-semibold ${
              p === page
                ? 'bg-[#0972d3] text-white border border-[#0972d3]'
                : 'bg-white border border-[#7d8998] text-[#000716] hover:bg-[#f2f3f3]'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded border border-[#7d8998] hover:bg-[#f2f3f3] text-[#000716] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

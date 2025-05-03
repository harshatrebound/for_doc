'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({ 
  pagination, 
  onPageChange, 
  onPageSizeChange, 
  pageSizeOptions = [10, 20, 30, 50, 100],
  className = ''
}: PaginationProps) {
  const { page, pageCount, total, pageSize } = pagination;
  
  return (
    <div className={`flex flex-col gap-2 border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 ${className}`}>
      {/* Mobile: Only Previous/Next buttons */}
      <div className="flex flex-1 items-center justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
        >
          Next
        </Button>
      </div>
      {/* Desktop: Original pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{total === 0 ? 0 : ((page - 1) * pageSize) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(page * pageSize, total)}
            </span>{' '}
            of <span className="font-medium">{total}</span> results
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            className="h-8 rounded-md border border-input bg-background px-2"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
            >
              <span className="sr-only">First page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <span className="sr-only">Previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Page number display */}
            <div className="flex items-center px-4 h-8 text-sm text-gray-700">
              {page} / {pageCount || 1}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pageCount}
            >
              <span className="sr-only">Next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(pageCount)}
              disabled={page >= pageCount}
            >
              <span className="sr-only">Last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
} 
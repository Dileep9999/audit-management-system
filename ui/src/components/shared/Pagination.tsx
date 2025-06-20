// moved from ui/src/views/admins/Pagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage?: number;
  totalItems: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}
const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_CURRENT_PAGE = 1;
const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const Pagination: React.FC<PaginationProps> = ({
  currentPage = DEFAULT_CURRENT_PAGE,
  totalItems,
  pageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  className = '',
}) => {
  const pageCount = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return (
    <div className={`px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border-t border-gray-200 dark:border-gray-700 gap-2 sm:gap-0 ${className}`}>
      <div className="flex items-center gap-2 mb-2 sm:mb-0">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} entries
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg ${
            currentPage === 1
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ChevronLeft className="size-5" />
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-lg ${
              currentPage === p
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
          className={`p-2 rounded-lg ${
            currentPage === pageCount
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ChevronRight className="size-5" />
        </button>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-2 ml-2"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination; 
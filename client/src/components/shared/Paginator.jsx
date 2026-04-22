import React from 'react';

const Paginator = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showPages = 5 
}) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const halfShow = Math.floor(showPages / 2);
    
    let startPage = Math.max(1, currentPage - halfShow);
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pages = getPages();

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-center gap-sm mt-lg">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`btn-ghost px-sm py-xs ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover-lift'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7M15 5l-7-7 7 7" />
        </svg>
        Previous
      </button>

      {/* Page Numbers */}
      {pages[0] > 1 && (
        <button
          onClick={() => handlePageChange(1)}
          className="btn-ghost px-sm py-xs hover-lift"
        >
          1
        </button>
      )}

      {pages[0] > 2 && (
        <button
          onClick={() => handlePageChange(pages[0] - 1)}
          className="btn-ghost px-sm py-xs hover-lift"
        >
          ...
        </button>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`btn-ghost px-sm py-xs ${
            page === currentPage 
              ? 'text-primary border-blue' 
              : 'text-muted hover:text-primary'
          }`}
        >
          {page}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <button
          onClick={() => handlePageChange(pages[pages.length - 1] + 1)}
          className="btn-ghost px-sm py-xs hover-lift"
        >
          ...
        </button>
      )}

      {pages[pages.length - 1] < totalPages && (
        <button
          onClick={() => handlePageChange(totalPages)}
          className="btn-ghost px-sm py-xs hover-lift"
        >
          {totalPages}
        </button>
      )}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`btn-ghost px-sm py-xs ${
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover-lift'
        }`}
      >
        Next
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7M9 19l7-7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Paginator;

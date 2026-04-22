import React, { useState } from 'react';

const DataTable = ({ 
  data, 
  columns, 
  loading = false, 
  emptyMessage = 'No data available',
  className = '',
  onRowClick = null 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 text-muted inline ml-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4 8l-4-8m6 0v12m0 0l4-8m-4 8m0 0v12" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 text-primary inline ml-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
          sortConfig.direction === 'asc' 
            ? "M5 15l7-7 7 7M5 19l7-7 7 7" 
            : "M19 9l-7 7-7-7M19 5l-7 7-7-7"
        } />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-surface1 border border radius-lg p-lg">
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-sm p-sm">
              <div className="w-8 h-8 loading-skeleton radius-md"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 loading-skeleton radius-sm"></div>
                <div className="h-4 loading-skeleton radius-sm w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                className="cursor-pointer hover:bg-surface2 transition-normal"
                onClick={() => column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center gap-xs">
                  {column.label}
                  {column.sortable !== false && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-xl">
                <div className="text-muted">
                  <svg className="w-12 h-12 mx-auto mb-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v7a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr 
                key={index}
                className={onRowClick ? 'cursor-pointer' : ''}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  const isFirstColumn = columns[0].key === column.key;
                  
                  return (
                    <td key={column.key}>
                      {column.render ? (
                        column.render(value, row)
                      ) : (
                        <span 
                          className={isFirstColumn ? 'text-primary font-medium' : 'text-muted'}
                          title={value}
                        >
                          {value || '-'}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

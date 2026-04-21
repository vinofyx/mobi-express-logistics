import React from 'react';

const StatusBadge = ({ status, size = 'sm' }) => {
  const getStatusClass = (status) => {
    const statusMap = {
      'Requested': 'status-amber',
      'Assigned': 'status-blue',
      'Picked': 'status-green',
      'Failed': 'status-red',
      'Received at Center': 'status-purple',
      'Sorted': 'status-orange',
      'Dispatched': 'status-blue',
      'In Transit': 'status-blue',
      'Received': 'status-green',
      'Delivered': 'status-green',
      'Returned': 'status-red',
    };
    return statusMap[status] || 'status-gray';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span className={`status-badge ${getStatusClass(status)} ${sizeClasses[size]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;

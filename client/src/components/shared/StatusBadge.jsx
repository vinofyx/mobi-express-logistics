import React from 'react';

const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const getStatusClass = (status) => {
    const statusClasses = {
      // Success states
      picked: 'badge-success',
      delivered: 'badge-success',
      active: 'badge-success',
      completed: 'badge-success',
      
      // Info states
      assigned: 'badge-info',
      in_transit: 'badge-info',
      processing: 'badge-info',
      info: 'badge-info',
      
      // Warning states
      requested: 'badge-warning',
      dispatched: 'badge-warning',
      pending: 'badge-warning',
      
      // Danger states
      failed: 'badge-danger',
      damaged: 'badge-danger',
      cancelled: 'badge-danger',
      error: 'badge-danger',
      
      // Special states
      sorted: 'badge-purple',
      hub: 'badge-purple',
      center: 'badge-teal',
      
      // Default
      inactive: 'badge-muted',
      default: 'badge-muted'
    };
    
    return statusClasses[status?.toLowerCase()] || 'badge-muted';
  };

  const formatStatus = (status) => {
    return status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || status;
  };

  const sizeClasses = {
    sm: 'text-xs px-xs py-1',
    md: 'text-sm px-sm py-1',
    lg: 'text-md px-md py-2'
  };

  return (
    <span 
      className={`badge ${getStatusClass(status)} ${sizeClasses[size]} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
        borderRadius: '99px'
      }}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;

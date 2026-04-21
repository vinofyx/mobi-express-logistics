import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PageWrapper = ({ 
  children, 
  title, 
  actions,
  showSidebar = true,
  className = '' 
}) => {
  return (
    <div className="flex h-screen bg-base">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: showSidebar ? '240px' : '0' }}>
        {/* Topbar */}
        <Topbar />
        
        {/* Page Content */}
        <main 
          className={`flex-1 overflow-y-auto ${className}`}
          style={{ 
            padding: '28px 32px',
            background: 'var(--bg-base)'
          }}
        >
          {/* Page Header */}
          {(title || actions) && (
            <div className="flex items-center justify-between mb-lg">
              {title && (
                <div>
                  <h1 className="text-2xl font-bold text-primary">{title}</h1>
                  <p className="text-muted text-sm mt-xs">
                    {title}
                  </p>
                </div>
              )}
              {actions && (
                <div className="flex items-center gap-sm">
                  {actions}
                </div>
              )}
            </div>
          )}
          
          {/* Page Content */}
          <div className="fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageWrapper;

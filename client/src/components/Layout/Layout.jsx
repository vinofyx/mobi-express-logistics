import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7' }}>
    <Sidebar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
      <Topbar />
      <main style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
    </div>
  </div>
);

export default Layout;

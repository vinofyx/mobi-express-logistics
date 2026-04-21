import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const NAV = [
  { section: 'Overview' },
  { to: '/dashboard',  label: 'Dashboard',    icon: '📊' },
  { section: 'Operations' },
  { to: '/customers',  label: 'Customers',    icon: '👥' },
  { to: '/pickups',    label: 'Pickups',       icon: '🚚' },
  { to: '/parcels',    label: 'Parcels',       icon: '📦' },
  { to: '/shipments',  label: 'Shipments',     icon: '🚢' },
  { section: 'Tools' },
  { to: '/track',      label: 'Track Parcel',  icon: '🔍' },
  { to: '/agents',     label: 'Agents',        icon: '👤' },
];

const ROLE_LABELS = {
  admin:              'Administrator',
  operations_manager: 'Ops Manager',
  field_agent:        'Field Agent',
  center_staff:       'Center Staff',
  hub_staff:          'Hub Staff',
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user     = useSelector((state) => state.auth.user);

  const width    = collapsed ? '64px' : '240px';
  const initials = user && user.name
    ? user.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2)
    : 'ME';

  function handleLogout() {
    dispatch(logout());
    navigate('/auth');
  }

  function renderNavItem(item, index) {
    if (item.section) {
      if (collapsed) return null;
      return (
        <div
          key={index}
          style={{
            padding: '14px 10px 4px',
            fontSize: '9px',
            color: '#334155',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
          }}
        >
          {item.section}
        </div>
      );
    }

    var isActive = location.pathname === item.to;

    return (
      <button
        key={index}
        onClick={function() { navigate(item.to); }}
        title={collapsed ? item.label : ''}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          padding: '8px 10px',
          margin: '1px 0',
          borderRadius: '9px',
          border: 'none',
          borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
          background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
          color: isActive ? '#93c5fd' : '#64748b',
          cursor: 'pointer',
          fontWeight: isActive ? 600 : 400,
          fontSize: '13px',
          textAlign: 'left',
          justifyContent: collapsed ? 'center' : 'flex-start',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: '15px', flexShrink: 0 }}>{item.icon}</span>
        {!collapsed && <span>{item.label}</span>}
      </button>
    );
  }

  return (
    <div
      style={{
        width: width,
        minWidth: width,
        minHeight: '100vh',
        background: '#0a0f1e',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.2s ease',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '18px 14px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '10px',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: 800,
                color: '#fff',
                flexShrink: 0,
                boxShadow: '0 0 16px rgba(59,130,246,0.4)',
              }}
            >
              B
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px' }}>
                MobiExpress
              </div>
              <div style={{ color: '#334155', fontSize: '10px', marginTop: '1px' }}>
                Logistics Platform
              </div>
            </div>
          </div>
        )}

        <button
          onClick={function() { setCollapsed(function(c) { return !c; }); }}
          style={{
            background: 'transparent',
            border: '1px solid #1e293b',
            borderRadius: '7px',
            padding: '5px',
            cursor: 'pointer',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV.map(function(item, index) {
          return renderNavItem(item, index);
        })}
      </nav>

      {/* User area */}
      <div style={{ borderTop: '1px solid #1e293b', padding: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            marginBottom: collapsed ? '0' : '10px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 0 10px rgba(59,130,246,0.3)',
            }}
          >
            {initials}
          </div>

          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: '#e2e8f0',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user ? user.name : 'User'}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  padding: '1px 7px',
                  borderRadius: '99px',
                  marginTop: '2px',
                  background: 'rgba(59,130,246,0.15)',
                  color: '#60a5fa',
                  fontWeight: 500,
                }}
              >
                {user ? (ROLE_LABELS[user.role] || 'Staff') : 'Staff'}
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '7px',
              background: 'transparent',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              color: '#475569',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              fontFamily: 'inherit',
            }}
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import { useSelector } from 'react-redux';

var ROLE_LABELS = {
  admin:              'Administrator',
  operations_manager: 'Ops Manager',
  field_agent:        'Field Agent',
  center_staff:       'Center Staff',
  hub_staff:          'Hub Staff',
};

var ROLE_COLORS = {
  admin:               { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  operations_manager:  { bg: 'rgba(16,185,129,0.15)',  color: '#34d399' },
  field_agent:         { bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa' },
  center_staff:        { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
  hub_staff:           { bg: 'rgba(20,184,166,0.15)',  color: '#2dd4bf' },
};

var NOTIFICATIONS = [
  {
    id: 1,
    dot: '#10b981',
    title: 'New pickup request',
    body: 'Ravi Kumar requested pickup from MG Road',
    time: '2 min ago',
  },
  {
    id: 2,
    dot: '#f59e0b',
    title: 'Shipment delayed',
    body: 'SHP-LQX2-CD4 to Delhi delayed by 1 day',
    time: '15 min ago',
  },
  {
    id: 3,
    dot: '#3b82f6',
    title: 'Parcel delivered',
    body: 'LMS-HYD-0420-M7K2 delivered to Mumbai Hub',
    time: '1 hr ago',
  },
];

function getGreeting() {
  var h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

var Topbar = function() {
  var showNotif = useState(false);
  var open      = showNotif[0];
  var setOpen   = showNotif[1];

  var authState = useSelector(function(state) { return state.auth; });
  var user      = authState.user;

  var rc = (user && ROLE_COLORS[user.role]) ? ROLE_COLORS[user.role] : { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' };

  var initials = '';
  if (user && user.name) {
    initials = user.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
  } else {
    initials = 'ME';
  }

  var roleLabel = (user && ROLE_LABELS[user.role]) ? ROLE_LABELS[user.role] : 'Staff';
  var userName  = (user && user.name) ? user.name : 'User';
  var userEmail = (user && user.email) ? user.email : '';
  var firstName = userName.split(' ')[0];

  return (
    <header
      style={{
        height: '60px',
        background: '#111827',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left */}
      <div>
        <h1 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
          {getDate()}
        </p>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>

        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={function() { setOpen(function(s) { return !s; }); }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid #1e293b',
              background: '#1a2235',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <svg width="16" height="16" fill="none" stroke="#64748b" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              style={{
                position: 'absolute',
                top: '7px',
                right: '7px',
                width: '7px',
                height: '7px',
                background: '#ef4444',
                borderRadius: '50%',
                border: '1.5px solid #111827',
              }}
            />
          </button>

          {open && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '44px',
                width: '300px',
                background: '#111827',
                border: '1px solid #1e293b',
                borderRadius: '14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #1e293b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '13px' }}>
                  Notifications
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    background: 'rgba(239,68,68,0.15)',
                    color: '#f87171',
                    padding: '2px 7px',
                    borderRadius: '99px',
                    fontWeight: 600,
                  }}
                >
                  {NOTIFICATIONS.length} new
                </span>
              </div>

              <div>
                {NOTIFICATIONS.map(function(n, i) {
                  return (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: i < NOTIFICATIONS.length - 1 ? '1px solid #1a2235' : 'none',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: n.dot,
                          marginTop: '5px',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#e2e8f0', marginBottom: '2px' }}>
                          {n.title}
                        </p>
                        <p style={{ fontSize: '11px', color: '#64748b' }}>
                          {n.body}
                        </p>
                        <p style={{ fontSize: '10.5px', color: '#334155', marginTop: '3px' }}>
                          {n.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: '12px 16px', borderTop: '1px solid #1e293b' }}>
                <button
                  onClick={function() { setOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '7px',
                    background: 'transparent',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: '#1e293b' }} />

        {/* Role badge */}
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: '99px',
            background: rc.bg,
            color: rc.color,
          }}
        >
          {roleLabel}
        </span>

        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: '#fff',
              boxShadow: '0 0 10px rgba(59,130,246,0.3)',
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1 }}>
              {userName}
            </div>
            <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '1px' }}>
              {userEmail}
            </div>
          </div>
        </div>

      </div>

      {/* Backdrop to close notifications */}
      {open && (
        <div
          onClick={function() { setOpen(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
        />
      )}
    </header>
  );
};

export default Topbar;

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, Truck,
  UserCog, Settings, Bell, ChevronDown, LogOut, Menu, X,
  TrendingUp, TrendingDown, Plus, Search, Home, BarChart3
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', active: true },
  { name: 'Customers', icon: Users, path: '/customers' },
  { name: 'Parcels', icon: Package, path: '/parcels' },
  { name: 'Shipments', icon: Truck, path: '/shipments' },
  { name: 'Users', icon: UserCog, path: '/users' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

const stats = [
  { title: 'Total Shipments', value: '0', change: '0%', up: true, icon: Truck, color: 'blue' },
  { title: 'Active Shipments', value: '0', change: '0%', up: true, icon: Package, color: 'green' },
  { title: 'Delivered', value: '0', change: '0%', up: true, icon: TrendingUp, color: 'purple' },
  { title: 'Pending', value: '0', change: '0%', up: false, icon: BarChart3, color: 'orange' },
];

const recentActivity = [];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getColorConfig = (color) => {
    const configs = {
      blue: { bg: '#dbeafe', icon: '#3b82f6', text: '#1e40af' },
      green: { bg: '#d1fae5', icon: '#10b981', text: '#065f46' },
      purple: { bg: '#ede9fe', icon: '#8b5cf6', text: '#5b21b6' },
      orange: { bg: '#fed7aa', icon: '#f97316', text: '#9a3412' },
    };
    return configs[color] || configs.blue;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'In Transit': { bg: '#dbeafe', color: '#1e40af' },
      'Delivered': { bg: '#d1fae5', color: '#065f46' },
      'Pending': { bg: '#fef3c7', color: '#92400e' },
    };
    const config = statusConfig[status] || { bg: '#f3f4f6', color: '#374151' };
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: config.bg,
        color: config.color
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 260 : 80,
        background: '#1e293b',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
      }}>

        {/* Logo */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 10, 
              background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Truck size={20} color="#fff" />
            </div>
            {sidebarOpen && (
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>MobiExpress</span>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '20px 16px', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 8,
                  textDecoration: 'none',
                  color: item.active ? '#fff' : '#94a3b8',
                  background: item.active ? '#3b82f6' : 'transparent',
                  transition: 'all 0.2s ease',
                  fontWeight: item.active ? 600 : 400,
                }}
                onMouseEnter={(e) => { 
                  if (!item.active) {
                    e.currentTarget.style.background = '#334155';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => { 
                  if (!item.active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span>{item.name}</span>}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 80, transition: 'margin-left 0.3s ease' }}>

        {/* Top Navigation */}
        <header style={{ 
          background: '#fff', 
          borderBottom: '1px solid #e2e8f0', 
          padding: '16px 32px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ position: 'relative', maxWidth: 400, flex: 1 }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: 16, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#94a3b8' 
              }} 
            />
            <input
              type="text"
              placeholder="Search shipments, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', 
                paddingLeft: 48, 
                paddingRight: 16, 
                padding: '12px 16px 12px 48px',
                border: '1px solid #e2e8f0', 
                borderRadius: 10, 
                fontSize: 14, 
                outline: 'none',
                background: '#f8fafc',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.background = '#fff';
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.background = '#f8fafc';
                e.target.style.borderColor = '#e2e8f0';
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notifications */}
            <button style={{ 
              position: 'relative', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: 8,
              borderRadius: 8,
              color: '#64748b'
            }}>
              <Bell size={20} />
              <span style={{ 
                position: 'absolute', 
                top: 6, 
                right: 6, 
                width: 8, 
                height: 8, 
                background: '#ef4444', 
                borderRadius: '50%', 
                border: '2px solid #fff' 
              }}></span>
            </button>

            {/* User Profile */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 10, 
                  padding: '8px 16px', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
              >
                <div style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
                  {user?.name || 'User'}
                </span>
                <ChevronDown size={16} color="#64748b" />
              </button>

              {dropdownOpen && (
                <div style={{ 
                  position: 'absolute', 
                  right: 0, 
                  top: '100%', 
                  marginTop: 8, 
                  width: 200, 
                  background: '#fff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 12, 
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)', 
                  zIndex: 50,
                  overflow: 'hidden'
                }}>
                  <a href="#" style={{ 
                    display: 'block', 
                    padding: '12px 16px', 
                    fontSize: 14, 
                    color: '#374151', 
                    textDecoration: 'none',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Profile
                  </a>
                  <a href="#" style={{ 
                    display: 'block', 
                    padding: '12px 16px', 
                    fontSize: 14, 
                    color: '#374151', 
                    textDecoration: 'none',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Settings
                  </a>
                  <div style={{ margin: '8px 0', borderTop: '1px solid #e2e8f0' }} />
                  <button 
                    onClick={handleLogout} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      width: '100%', 
                      padding: '12px 16px', 
                      fontSize: 14, 
                      color: '#ef4444', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ padding: '32px' }}>

          {/* Compact Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 24 
          }}>
            <div>
              <h1 style={{ 
                fontSize: 24, 
                fontWeight: 700, 
                color: '#1e293b', 
                margin: 0 
              }}>
                Dashboard
              </h1>
              <p style={{ 
                fontSize: 14, 
                color: '#64748b', 
                margin: '4px 0 0' 
              }}>
                Welcome back to Bobba Express, {user?.name || 'User'}
              </p>
            </div>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: '#4F46E5',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#4338ca'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#4F46E5'}
            onClick={() => navigate('/pickups')}
            >
              <Plus size={16} />
              New Pickup
            </button>
          </div>

          {/* Compact Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 16, 
            marginBottom: 24 
          }}>
            {stats.map((stat) => {
              const colors = getColorConfig(stat.color);
              const Icon = stat.icon;
              return (
                <div key={stat.title} style={{ 
                  background: '#ffffff', 
                  borderRadius: 12, 
                  padding: 20, 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginBottom: 12 
                  }}>
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 8, 
                      background: colors.bg, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <Icon size={20} color={colors.icon} />
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4
                    }}>
                      {stat.up ? (
                        <TrendingUp size={12} color="#10b981" />
                      ) : (
                        <TrendingDown size={12} color="#ef4444" />
                      )}
                      <span style={{ 
                        fontSize: 12, 
                        fontWeight: 600, 
                        color: stat.up ? '#10b981' : '#ef4444' 
                      }}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <h3 style={{ 
                      fontSize: 24, 
                      fontWeight: 700, 
                      color: '#1e293b', 
                      margin: 0,
                      lineHeight: 1
                    }}>
                      {stat.value}
                    </h3>
                  </div>
                  <p style={{ 
                    fontSize: 13, 
                    color: '#64748b', 
                    margin: 0, 
                    fontWeight: 500 
                  }}>
                    {stat.title}
                  </p>
                </div>
              );
            })}
          </div>

          
          
          
        </main>
      </div>
    </div>
  );
}
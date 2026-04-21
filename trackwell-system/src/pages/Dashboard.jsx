import React, { useState, useEffect, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { pickupsAPI, parcelsAPI, shipmentsAPI } from '../lib/api';
import { Package, Truck, MapPin, User, Phone, Clock, RefreshCw, TrendingUp, BarChart3, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 12px', display: 'block' }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>Something went wrong</h2>
        <p style={{ color: '#6b7280', marginTop: 8, fontSize: 13 }}>{this.state.error?.message}</p>
        <button onClick={() => this.setState({ error: null })} style={{ marginTop: 16, padding: '8px 24px', borderRadius: 8, border: 'none', background: '#4f46e5', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
      </div>
    );
    return this.props.children;
  }
}

const badge = (status) => {
  const s = (status || '').toLowerCase();
  const map = {
    pending: ['#fef3c7','#92400e'], requested: ['#fef3c7','#92400e'],
    assigned: ['#dbeafe','#1e40af'], in_pickup: ['#dbeafe','#1e40af'],
    at_center: ['#ede9fe','#5b21b6'], in_transit: ['#ede9fe','#5b21b6'],
    delivered: ['#d1fae5','#065f46'],
    returned: ['#fee2e2','#991b1b'], cancelled: ['#fee2e2','#991b1b'],
  };
  const [bg, color] = map[s] || ['#f3f4f6','#374151'];
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: bg, color }}>{status || 'Unknown'}</span>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, gradient, iconBg }) => (
  <div style={{ background: gradient, borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>
        <Icon size={22} color="#fff" />
      </div>
      <TrendingUp size={16} color="rgba(0,0,0,.3)" />
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 4 }}>{label}</div>
    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{sub}</div>
  </div>
);

const QuickStat = ({ icon: Icon, label, value, bg, color }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 11, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{value}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [pickups,   setPickups]   = useState([]);
  const [parcels,   setParcels]   = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const extract = (res) => {
    const d = res?.data;
    if (Array.isArray(d))       return d;
    if (Array.isArray(d?.data)) return d.data;
    return [];
  };

  const fetchAll = async () => {
    try {
      setError('');
      const [p, pa, sh] = await Promise.all([pickupsAPI.getAll(), parcelsAPI.getAll(), shipmentsAPI.getAll()]);
      setPickups(extract(p));
      setParcels(extract(pa));
      setShipments(extract(sh));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return (
    <div style={{ padding: 32 }}>
      <div style={{ height: 28, background: '#e5e7eb', borderRadius: 8, width: '25%', marginBottom: 24, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 24 }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 130, background: '#e5e7eb', borderRadius: 16 }} />)}
      </div>
    </div>
  );

  const stats = {
    pending:  pickups.filter(p  => ['pending','requested'].includes((p?.status||'').toLowerCase())).length,
    transit:  parcels.filter(p  => (p?.status||'').toLowerCase() === 'in_transit').length,
    active:   shipments.filter(s => ['created','dispatched','in_transit'].includes((s?.status||'').toLowerCase())).length,
    delivered: parcels.filter(p => (p?.status||'').toLowerCase() === 'delivered').length,
  };

  return (
    <ErrorBoundary>
      <div style={{ padding: 32, background: '#f5f5f7', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', margin: 0 }}>Admin Dashboard</h1>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Real-time logistics overview</p>
          </div>
          <button onClick={() => { setRefreshing(true); fetchAll(); }} disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin .7s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
            <AlertCircle size={16} color="#dc2626" />
            <span style={{ fontSize: 13, color: '#b91c1c' }}>{error}</span>
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 28 }}>
          <StatCard label="Total Pickups"   value={pickups.length}   sub={`${stats.pending} pending`}   icon={MapPin}   gradient="linear-gradient(135deg,#dbeafe,#bfdbfe)" iconBg="#3b82f6" />
          <StatCard label="Total Parcels"   value={parcels.length}   sub={`${stats.transit} in transit`} icon={Package}   gradient="linear-gradient(135deg,#ede9fe,#ddd6fe)" iconBg="#8b5cf6" />
          <StatCard label="Total Shipments" value={shipments.length} sub={`${stats.active} active`}     icon={Truck}     gradient="linear-gradient(135deg,#d1fae5,#a7f3d0)" iconBg="#10b981" />
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
          <QuickStat icon={Clock}       label="Pending Pickups"  value={stats.pending}   bg="#fef3c7" color="#d97706" />
          <QuickStat icon={Truck}       label="In Transit"       value={stats.transit}   bg="#ede9fe" color="#7c3aed" />
          <QuickStat icon={CheckCircle} label="Delivered"        value={stats.delivered} bg="#d1fae5" color="#059669" />
          <QuickStat icon={BarChart3}   label="Active Shipments" value={stats.active}    bg="#dbeafe" color="#2563eb" />
        </div>

        {/* Tables */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 24 }}>

          {/* Recent Pickups */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.06)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Recent Pickups</h3>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>Latest requests</p>
              </div>
              <button onClick={() => navigate('/pickups')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#4f46e5', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div style={{ padding: '12px 0' }}>
              {pickups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
                  <MapPin size={36} style={{ margin: '0 auto 8px', display: 'block', opacity: .4 }} />
                  <p style={{ fontSize: 13 }}>No pickups yet</p>
                </div>
              ) : pickups.slice(0, 5).map((p, i) => (
                <div key={p?._id || i} style={{ padding: '12px 24px', borderBottom: i < Math.min(pickups.length,5)-1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={13} color="#7c3aed" />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#111', flex: 1 }}>{p?.customer?.name || p?.name || 'Unknown'}</span>
                    {badge(p?.status)}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6b7280', paddingLeft: 36 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Phone size={10} />{p?.customer?.phone || 'N/A'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} />{p?.pickupDate || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Shipments */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.06)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Recent Shipments</h3>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>Latest updates</p>
              </div>
              <button onClick={() => navigate('/shipments')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#4f46e5', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div style={{ padding: '12px 0' }}>
              {shipments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
                  <Truck size={36} style={{ margin: '0 auto 8px', display: 'block', opacity: .4 }} />
                  <p style={{ fontSize: 13 }}>No shipments yet</p>
                </div>
              ) : shipments.slice(0, 5).map((s, i) => (
                <div key={s?._id || i} style={{ padding: '12px 24px', borderBottom: i < Math.min(shipments.length,5)-1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#374151', flex: 1 }}>{s?.shipmentId || s?._id?.slice(-8) || 'N/A'}</span>
                    {badge(s?.status)}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6b7280' }}>
                    <span>From: <strong>{s?.originHub || 'N/A'}</strong></span>
                    <span>To: <strong>{s?.destinationHub || 'N/A'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </ErrorBoundary>
  );
}

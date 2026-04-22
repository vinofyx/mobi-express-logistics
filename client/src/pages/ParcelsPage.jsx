import React, { useState, useEffect } from 'react';
import { parcelsAPI } from '../lib/api';
import { Package, Search, RefreshCw, AlertCircle } from 'lucide-react';

const badge = (status) => {
  const s = (status || '').toLowerCase();
  const map = {
    pending: ['#fef3c7','#92400e'], in_pickup: ['#dbeafe','#1e40af'],
    at_center: ['#ede9fe','#5b21b6'], in_transit: ['#ede9fe','#5b21b6'],
    delivered: ['#d1fae5','#065f46'], returned: ['#fee2e2','#991b1b'],
  };
  const [bg, color] = map[s] || ['#f3f4f6','#374151'];
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: bg, color }}>{status || 'Unknown'}</span>;
};

export default function ParcelsPage() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  const load = async () => {
    try {
      setError('');
      const res = await parcelsAPI.getAll();
      const d = res?.data;
      setParcels(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
    } catch (err) {
      setError('Failed to load parcels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = parcels.filter(p =>
    (p?.trackingId || '').toLowerCase().includes(search.toLowerCase()) ||
    (p?.status || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 32, background: '#f5f5f7', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0 }}>Parcels</h1>
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{parcels.length} total parcels</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by tracking ID or status…"
          style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }} />
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertCircle size={16} color="#dc2626" /><span style={{ fontSize: 13, color: '#b91c1c' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,.06)', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: 16, padding: '14px 24px', background: '#f9fafb', borderBottom: '1px solid #f3f4f6', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            <span>Tracking ID</span><span>Type</span><span>Weight</span><span>Status</span><span>COD</span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
              <Package size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: .4 }} />
              <p style={{ fontSize: 14 }}>No parcels found</p>
            </div>
          ) : filtered.map((p, i) => (
            <div key={p?._id || i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: 16, padding: '14px 24px', borderBottom: i < filtered.length-1 ? '1px solid #f9fafb' : 'none', alignItems: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#4f46e5' }}>{p?.trackingId || 'N/A'}</span>
              <span style={{ fontSize: 13, color: '#374151' }}>{p?.type || 'Standard'}</span>
              <span style={{ fontSize: 13, color: '#374151' }}>{p?.weight ? `${p.weight} kg` : 'N/A'}</span>
              <span>{badge(p?.status)}</span>
              <span style={{ fontSize: 13, color: '#374151' }}>{p?.codAmount ? `₹${p.codAmount}` : '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

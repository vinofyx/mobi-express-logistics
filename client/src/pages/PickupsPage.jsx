import React, { useState, useEffect, useCallback } from 'react';
import { pickupsAPI, customersAPI } from '../lib/api';

const STATUS_MAP = {
  Requested:  { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  Assigned:   { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  PickedUp:   { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  AtCenter:   { bg: '#ede9fe', color: '#5b21b6', dot: '#8b5cf6' },
  Cancelled:  { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
};

const DELIVERY_TYPES = ['standard', 'express', 'same_day'];
const PARCEL_TYPES   = ['document', 'parcel', 'fragile', 'electronics', 'bulk'];

const Badge = ({ status }) => {
  const cfg = STATUS_MAP[status] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:99,
      fontSize:11, fontWeight:600, background:cfg.bg, color:cfg.color }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.dot, display:'inline-block' }} />
      {status}
    </span>
  );
};

const statCard = (label, value, color, icon) => (
  <div key={label} style={{ background:'#fff', borderRadius:14, padding:'20px 22px', flex:1, minWidth:140,
    borderTop:`3px solid ${color}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
    <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
    <div style={{ fontSize:28, fontWeight:800, color:'#111', lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>{label}</div>
  </div>
);

const EMPTY_FORM = {
  phone:'', customerId:'', customerName:'',
  line1:'', city:'', state:'', pincode:'',
  scheduledDate:'', pickupTime:'09:00',
  deliveryType:'standard', parcelType:'parcel', notes:'',
};

export default function PickupsPage() {
  const [pickups,    setPickups]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('All');
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [custLoad,   setCustLoad]   = useState(false);
  const [custErr,    setCustErr]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formErr,    setFormErr]    = useState('');

  const loadPickups = useCallback(async () => {
    try {
      setError('');
      const res = await pickupsAPI.getAll();
      const d = res?.data;
      setPickups(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []);
    } catch { setError('Failed to load pickups. Check your connection.'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { loadPickups(); }, [loadPickups]);

  const lookupCustomer = async () => {
    if (!form.phone || form.phone.length < 10) return;
    setCustErr(''); setCustLoad(true);
    try {
      const res = await customersAPI.getAll({ phone: form.phone });
      const list = res?.data?.data || res?.data || [];
      const cust = Array.isArray(list) ? list[0] : null;
      if (cust) {
        setForm(f => ({
          ...f,
          customerId:   cust._id,
          customerName: cust.name,
          line1:  cust.address?.line1   || '',
          city:   cust.address?.city    || '',
          state:  cust.address?.state   || '',
          pincode:cust.address?.pincode || '',
        }));
      } else {
        setCustErr('No customer found with this phone number.');
        setForm(f => ({ ...f, customerId:'', customerName:'' }));
      }
    } catch { setCustErr('Error looking up customer.'); }
    finally  { setCustLoad(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr(''); setSuccessMsg('');
    if (!form.customerId) return setFormErr('Customer not found. Look up by phone first.');
    if (!form.line1 || !form.city || !form.state || !form.pincode)
      return setFormErr('Complete pickup address is required.');
    if (!form.scheduledDate) return setFormErr('Scheduled date is required.');
    setSubmitting(true);
    try {
      await pickupsAPI.create({
        customer:      form.customerId,
        pickupAddress: { line1:form.line1, city:form.city, state:form.state, pincode:form.pincode },
        scheduledDate: form.scheduledDate,
        pickupTime:    form.pickupTime || '09:00',
        deliveryType:  form.deliveryType,
        parcelType:    form.parcelType,
        notes:         form.notes,
      });
      setSuccessMsg('Pickup created successfully!');
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadPickups();
    } catch (err) {
      setFormErr(err?.response?.data?.message || 'Failed to create pickup. Please try again.');
    } finally { setSubmitting(false); }
  };

  const counts = {
    total:     pickups.length,
    requested: pickups.filter(p => p.status === 'Requested').length,
    assigned:  pickups.filter(p => p.status === 'Assigned').length,
    completed: pickups.filter(p => p.status === 'PickedUp' || p.status === 'AtCenter').length,
  };

  const displayed = pickups.filter(p => {
    const matchFilter = filter === 'All' || p.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (p.customer?.name || '').toLowerCase().includes(q)
      || (p.pickupAddress?.city || '').toLowerCase().includes(q)
      || (p.status || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const inp = (extra = {}) => ({
    width:'100%', padding:'9px 12px', borderRadius:9, border:'1.5px solid #e5e7eb',
    fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', ...extra,
  });
  const lbl = { fontSize:12, fontWeight:600, color:'#374151', marginBottom:4, display:'block' };
  const sel  = { ...inp(), background:'#fff', cursor:'pointer' };

  return (
    <div style={{ padding:28, background:'#f5f5f7', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#0f172a', margin:0 }}>Pickups</h1>
          <p style={{ fontSize:12, color:'#6b7280', marginTop:3 }}>Manage all pickup requests</p>
        </div>
        <button
          onClick={() => { setShowForm(f => !f); setFormErr(''); setSuccessMsg(''); }}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:10,
            border:'none', background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff',
            fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 8px rgba(99,102,241,0.3)' }}>
          {showForm ? '× Cancel' : '+ New Pickup'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:14, marginBottom:22, flexWrap:'wrap' }}>
        {statCard('Total Pickups',  counts.total,     '#3b82f6', '')}
        {statCard('Requested',      counts.requested, '#f59e0b', '')}
        {statCard('Assigned',       counts.assigned,  '#6366f1', '')}
        {statCard('Completed',      counts.completed, '#10b981', '')}
      </div>

      {/* Success */}
      {successMsg && (
        <div style={{ background:'#d1fae5', color:'#065f46', padding:'10px 16px', borderRadius:10,
          marginBottom:16, fontSize:13, fontWeight:600 }}>
          {successMsg}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div style={{ background:'#fff', borderRadius:16, padding:24, marginBottom:22,
          boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid #e5e7eb' }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:'#111', marginBottom:18, marginTop:0 }}>
            New Pickup Request
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Customer lookup */}
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Customer Phone *</label>
              <div style={{ display:'flex', gap:8 }}>
                <input style={inp({ flex:1 })} placeholder="10-digit phone"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone:e.target.value }))} />
                <button type="button" onClick={lookupCustomer}
                  style={{ padding:'9px 16px', borderRadius:9, border:'1.5px solid #3b82f6',
                    background:'#eff6ff', color:'#3b82f6', fontSize:12, fontWeight:700,
                    cursor:'pointer', whiteSpace:'nowrap' }}>
                  {custLoad ? '...' : 'Look up'}
                </button>
              </div>
              {custErr && <p style={{ color:'#ef4444', fontSize:11, marginTop:4 }}>{custErr}</p>}
              {form.customerName && (
                <div style={{ marginTop:6, padding:'6px 12px', background:'#f0fdf4', borderRadius:8,
                  fontSize:12, color:'#15803d', fontWeight:600 }}>
                  {form.customerName}
                </div>
              )}
            </div>

            {/* Address */}
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Pickup Address *</label>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <input style={inp()} placeholder="Street address / Line 1"
                  value={form.line1} onChange={e => setForm(f => ({ ...f, line1:e.target.value }))} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 120px', gap:8 }}>
                  <input style={inp()} placeholder="City"
                    value={form.city} onChange={e => setForm(f => ({ ...f, city:e.target.value }))} />
                  <input style={inp()} placeholder="State"
                    value={form.state} onChange={e => setForm(f => ({ ...f, state:e.target.value }))} />
                  <input style={inp()} placeholder="Pincode" maxLength={6}
                    value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode:e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
              <div>
                <label style={lbl}>Scheduled Date *</label>
                <input type="date" style={inp()} value={form.scheduledDate}
                  onChange={e => setForm(f => ({ ...f, scheduledDate:e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>Pickup Time</label>
                <input type="time" style={inp()} value={form.pickupTime}
                  onChange={e => setForm(f => ({ ...f, pickupTime:e.target.value }))} />
              </div>
            </div>

            {/* Type */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
              <div>
                <label style={lbl}>Delivery Type</label>
                <select style={sel} value={form.deliveryType}
                  onChange={e => setForm(f => ({ ...f, deliveryType:e.target.value }))}>
                  {DELIVERY_TYPES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Parcel Type</label>
                <select style={sel} value={form.parcelType}
                  onChange={e => setForm(f => ({ ...f, parcelType:e.target.value }))}>
                  {PARCEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Notes</label>
              <textarea style={{ ...inp(), height:70, resize:'vertical' }} placeholder="Optional notes..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))} />
            </div>

            {formErr && (
              <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:9,
                fontSize:12, marginBottom:14, fontWeight:500 }}>
                {formErr}
              </div>
            )}

            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                style={{ padding:'9px 18px', borderRadius:9, border:'1.5px solid #e5e7eb',
                  background:'#fff', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                style={{ padding:'9px 22px', borderRadius:9, border:'none',
                  background:submitting?'#93c5fd':'linear-gradient(135deg,#3b82f6,#6366f1)',
                  color:'#fff', fontSize:13, fontWeight:700, cursor:submitting?'not-allowed':'pointer' }}>
                {submitting ? 'Creating...' : 'Create Pickup'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter + Search bar */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:'1 1 220px' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'#9ca3af' }}></span>
          <input style={{ ...inp({ paddingLeft:34, background:'#fff' }) }}
            placeholder="Search customer, city, status..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All','Requested','Assigned','PickedUp','AtCenter','Cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding:'7px 14px', borderRadius:8, border:'1.5px solid',
              borderColor: filter===s ? '#3b82f6' : '#e5e7eb',
              background:  filter===s ? '#eff6ff'  : '#fff',
              color:        filter===s ? '#3b82f6'  : '#374151',
              fontSize:12, fontWeight:600, cursor:'pointer' }}>
            {s}
          </button>
        ))}
        <button onClick={loadPickups}
          style={{ padding:'7px 14px', borderRadius:8, border:'1.5px solid #e5e7eb',
            background:'#fff', color:'#374151', fontSize:12, fontWeight:600, cursor:'pointer' }}>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
        border:'1px solid #e5e7eb', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e5e7eb' }}>
                {['Customer','Pickup Address','Date','Time','Delivery','Parcel','Status',''].map(h => (
                  <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11,
                    fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.04em',
                    whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:'#9ca3af' }}>
                  Loading pickups...
                </td></tr>
              ) : error ? (
                <tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:'#ef4444' }}>
                  {error}
                </td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan={8} style={{ padding:48, textAlign:'center', color:'#9ca3af' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}></div>
                  <div style={{ fontWeight:600 }}>No pickups found</div>
                  <div style={{ fontSize:12, marginTop:4 }}>
                    {search || filter !== 'All' ? 'Try clearing filters.' : 'Create your first pickup above.'}
                  </div>
                </td></tr>
              ) : displayed.map((p, i) => (
                <tr key={p._id} style={{ borderBottom:'1px solid #f1f5f9',
                  background: i%2===0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding:'12px 14px', fontWeight:600, color:'#111' }}>
                    {p.customer?.name || ''}
                    {p.customer?.phone && (
                      <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{p.customer.phone}</div>
                    )}
                  </td>
                  <td style={{ padding:'12px 14px', color:'#374151' }}>
                    {p.pickupAddress?.line1 || ''}
                    <div style={{ fontSize:11, color:'#9ca3af' }}>
                      {[p.pickupAddress?.city, p.pickupAddress?.state].filter(Boolean).join(', ')}
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', color:'#374151', whiteSpace:'nowrap' }}>
                    {p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString('en-IN') : ''}
                  </td>
                  <td style={{ padding:'12px 14px', color:'#374151' }}>{p.pickupTime || ''}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ fontSize:11, fontWeight:600, color:'#6366f1',
                      background:'#ede9fe', padding:'2px 8px', borderRadius:6 }}>
                      {(p.deliveryType||'').replace('_',' ')}
                    </span>
                  </td>
                  <td style={{ padding:'12px 14px', color:'#374151', textTransform:'capitalize' }}>
                    {p.parcelType || ''}
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <Badge status={p.status} />
                  </td>
                  <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                    <button style={{ fontSize:11, padding:'4px 10px', borderRadius:7,
                      border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', color:'#374151' }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {displayed.length > 0 && (
          <div style={{ padding:'10px 16px', borderTop:'1px solid #f1f5f9',
            fontSize:12, color:'#9ca3af', textAlign:'right' }}>
            Showing {displayed.length} of {pickups.length} pickups
          </div>
        )}
      </div>
    </div>
  );
}

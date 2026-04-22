import React, { useState, useEffect, useCallback } from 'react';
import { customersAPI } from '../lib/api';

const TYPE_CFG = {
  B2B: { bg:'#dbeafe', color:'#1e40af' },
  B2C: { bg:'#d1fae5', color:'#065f46' },
};

const statCard = (label, value, color, icon) => (
  <div key={label} style={{ background:'#fff', borderRadius:14, padding:'20px 22px', flex:1, minWidth:130,
    borderTop:`3px solid ${color}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
    <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
    <div style={{ fontSize:28, fontWeight:800, color:'#111', lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>{label}</div>
  </div>
);

const EMPTY_FORM = {
  name:'', phone:'', email:'', type:'B2C',
  companyName:'', gst:'',
  line1:'', city:'', state:'', pincode:'',
};

const inp = (extra={}) => ({
  width:'100%', padding:'9px 12px', borderRadius:9, border:'1.5px solid #e5e7eb',
  fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', ...extra,
});
const lbl = { fontSize:12, fontWeight:600, color:'#374151', marginBottom:4, display:'block' };

export default function CustomersPage() {
  const [customers,  setCustomers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formErr,    setFormErr]    = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await customersAPI.getAll();
      const d = res?.data;
      setCustomers(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []);
    } catch { setError('Failed to load customers.'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr(''); setSuccessMsg('');
    if (!form.name)   return setFormErr('Name is required.');
    if (!form.phone)  return setFormErr('Phone is required.');
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setFormErr('Invalid phone number (10 digits, start 6-9).');
    if (!form.line1 || !form.city || !form.state || !form.pincode) return setFormErr('Complete address is required.');
    if (!/^\d{6}$/.test(form.pincode)) return setFormErr('Pincode must be 6 digits.');
    setSubmitting(true);
    try {
      await customersAPI.create({
        name: form.name, phone: form.phone, email: form.email || undefined,
        type: form.type,
        companyName: form.companyName || undefined,
        gst: form.gst || undefined,
        address: { line1:form.line1, city:form.city, state:form.state, pincode:form.pincode },
      });
      setSuccessMsg(`Customer "${form.name}" created successfully!`);
      setForm(EMPTY_FORM);
      setShowModal(false);
      load();
    } catch (err) {
      setFormErr(err?.response?.data?.message || 'Failed to create customer.');
    } finally { setSubmitting(false); }
  };

  const counts = {
    total:  customers.length,
    b2b:    customers.filter(c => c.type === 'B2B').length,
    b2c:    customers.filter(c => c.type === 'B2C').length,
    active: customers.filter(c => c.isActive !== false).length,
  };

  const displayed = customers.filter(c => {
    const matchType = typeFilter === 'All' || c.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (c.name || '').toLowerCase().includes(q)
      || (c.phone || '').includes(q)
      || (c.email || '').toLowerCase().includes(q)
      || (c.companyName || '').toLowerCase().includes(q)
      || (c.address?.city || '').toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div style={{ padding:28, background:'#f5f5f7', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#0f172a', margin:0 }}>Customers</h1>
          <p style={{ fontSize:12, color:'#6b7280', marginTop:3 }}>Manage customer accounts</p>
        </div>
        <button onClick={() => { setShowModal(true); setFormErr(''); }}
          style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:10,
            border:'none', background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff',
            fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 8px rgba(99,102,241,0.3)' }}>
          + Add Customer
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:14, marginBottom:22, flexWrap:'wrap' }}>
        {statCard('Total Customers', counts.total,  '#3b82f6', '👥')}
        {statCard('B2B',             counts.b2b,   '#6366f1', '🏢')}
        {statCard('B2C',             counts.b2c,   '#10b981', '🙍')}
        {statCard('Active',          counts.active, '#f59e0b', '✅')}
      </div>

      {/* Success */}
      {successMsg && (
        <div style={{ background:'#d1fae5', color:'#065f46', padding:'10px 16px', borderRadius:10,
          marginBottom:16, fontSize:13, fontWeight:600 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:'1 1 220px' }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'#9ca3af' }}>🔍</span>
          <input style={{ ...inp({ paddingLeft:34, background:'#fff' }) }}
            placeholder="Search name, phone, city..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All','B2B','B2C'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            style={{ padding:'7px 16px', borderRadius:8, border:'1.5px solid',
              borderColor: typeFilter===t ? '#3b82f6' : '#e5e7eb',
              background:  typeFilter===t ? '#eff6ff'  : '#fff',
              color:        typeFilter===t ? '#3b82f6'  : '#374151',
              fontSize:12, fontWeight:600, cursor:'pointer' }}>
            {t}
          </button>
        ))}
        <button onClick={load}
          style={{ padding:'7px 14px', borderRadius:8, border:'1.5px solid #e5e7eb',
            background:'#fff', color:'#374151', fontSize:12, fontWeight:600, cursor:'pointer' }}>
          ↻ Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
        border:'1px solid #e5e7eb', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e5e7eb' }}>
                {['Customer','Type','Phone','Email','Address','Status'].map(h => (
                  <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11,
                    fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#9ca3af' }}>
                  Loading customers...
                </td></tr>
              ) : error ? (
                <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#ef4444' }}>{error}</td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan={6} style={{ padding:48, textAlign:'center', color:'#9ca3af' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>👥</div>
                  <div style={{ fontWeight:600 }}>No customers found</div>
                  <div style={{ fontSize:12, marginTop:4 }}>
                    {search || typeFilter !== 'All' ? 'Try clearing filters.' : 'Add your first customer above.'}
                  </div>
                </td></tr>
              ) : displayed.map((c, i) => {
                const typeCfg = TYPE_CFG[c.type] || TYPE_CFG.B2C;
                return (
                  <tr key={c._id} style={{ borderBottom:'1px solid #f1f5f9',
                    background: i%2===0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ fontWeight:700, color:'#111' }}>{c.name}</div>
                      {c.companyName && <div style={{ fontSize:11, color:'#9ca3af' }}>{c.companyName}</div>}
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:99,
                        background:typeCfg.bg, color:typeCfg.color }}>{c.type}</span>
                    </td>
                    <td style={{ padding:'12px 14px', color:'#374151' }}>{c.phone}</td>
                    <td style={{ padding:'12px 14px', color:'#6b7280', fontSize:12 }}>{c.email || '—'}</td>
                    <td style={{ padding:'12px 14px', color:'#374151' }}>
                      {c.address?.city || '—'}
                      {c.address?.state && <span style={{ color:'#9ca3af' }}>, {c.address.state}</span>}
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99,
                        background: c.isActive===false ? '#fee2e2' : '#d1fae5',
                        color: c.isActive===false ? '#991b1b' : '#065f46' }}>
                        {c.isActive===false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {displayed.length > 0 && (
          <div style={{ padding:'10px 16px', borderTop:'1px solid #f1f5f9',
            fontSize:12, color:'#9ca3af', textAlign:'right' }}>
            Showing {displayed.length} of {customers.length} customers
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e => { if (e.target===e.currentTarget) setShowModal(false); }}>
          <div style={{ background:'#fff', borderRadius:18, padding:28, width:'100%', maxWidth:560,
            maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:17, fontWeight:800, color:'#111', margin:0 }}>Add Customer</h2>
              <button onClick={() => setShowModal(false)}
                style={{ background:'#f3f4f6', border:'none', borderRadius:8, padding:'6px 10px',
                  cursor:'pointer', fontSize:16, color:'#6b7280' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Type */}
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Customer Type</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['B2C','B2B'].map(t => (
                    <button type="button" key={t} onClick={() => setForm(f => ({ ...f, type:t }))}
                      style={{ flex:1, padding:'9px', borderRadius:9, border:'1.5px solid',
                        borderColor: form.type===t ? '#3b82f6' : '#e5e7eb',
                        background:  form.type===t ? '#eff6ff'  : '#fff',
                        color:        form.type===t ? '#3b82f6'  : '#374151',
                        fontSize:13, fontWeight:700, cursor:'pointer' }}>
                      {t === 'B2B' ? '🏢 B2B (Business)' : '🙍 B2C (Individual)'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                <div>
                  <label style={lbl}>Full Name *</label>
                  <input style={inp()} placeholder="John Doe"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Phone *</label>
                  <input style={inp()} placeholder="9876543210" maxLength={10}
                    value={form.phone} onChange={e => setForm(f => ({ ...f, phone:e.target.value }))} />
                </div>
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Email</label>
                <input type="email" style={inp()} placeholder="email@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))} />
              </div>

              {form.type === 'B2B' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                  <div>
                    <label style={lbl}>Company Name</label>
                    <input style={inp()} placeholder="Acme Corp"
                      value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName:e.target.value }))} />
                  </div>
                  <div>
                    <label style={lbl}>GST Number</label>
                    <input style={inp()} placeholder="22AAAAA0000A1Z5" maxLength={15}
                      value={form.gst} onChange={e => setForm(f => ({ ...f, gst:e.target.value.toUpperCase() }))} />
                  </div>
                </div>
              )}

              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Address *</label>
                <input style={{ ...inp(), marginBottom:8 }} placeholder="Street / Line 1"
                  value={form.line1} onChange={e => setForm(f => ({ ...f, line1:e.target.value }))} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 110px', gap:8 }}>
                  <input style={inp()} placeholder="City"
                    value={form.city} onChange={e => setForm(f => ({ ...f, city:e.target.value }))} />
                  <input style={inp()} placeholder="State"
                    value={form.state} onChange={e => setForm(f => ({ ...f, state:e.target.value }))} />
                  <input style={inp()} placeholder="Pincode" maxLength={6}
                    value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode:e.target.value }))} />
                </div>
              </div>

              {formErr && (
                <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:9,
                  fontSize:12, marginBottom:14, fontWeight:500 }}>⚠ {formErr}</div>
              )}

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding:'9px 18px', borderRadius:9, border:'1.5px solid #e5e7eb',
                    background:'#fff', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{ padding:'9px 22px', borderRadius:9, border:'none',
                    background:submitting?'#93c5fd':'linear-gradient(135deg,#3b82f6,#6366f1)',
                    color:'#fff', fontSize:13, fontWeight:700, cursor:submitting?'not-allowed':'pointer' }}>
                  {submitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

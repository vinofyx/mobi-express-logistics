import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pickupsAPI, customersAPI } from '../lib/api';
import {
  MapPin, User, Phone, Calendar, Clock, Package,
  Plus, Search, RefreshCw, AlertCircle, CheckCircle,
  ChevronRight, Truck, X,
} from 'lucide-react';

/* ── helpers ──────────────────────────────────────────────────────────────── */
const statusColor = (s) => {
  const m = {
    pending:   ['#fef3c7','#92400e'], requested: ['#fef3c7','#92400e'],
    assigned:  ['#dbeafe','#1e40af'], in_pickup: ['#dbeafe','#1e40af'],
    at_center: ['#ede9fe','#5b21b6'], in_transit: ['#ede9fe','#5b21b6'],
    delivered: ['#d1fae5','#065f46'],
    returned:  ['#fee2e2','#991b1b'], cancelled: ['#fee2e2','#991b1b'],
  };
  const [bg, c] = m[(s||'').toLowerCase()] || ['#f3f4f6','#374151'];
  return <span style={{ fontSize:11, fontWeight:600, padding:'2px 9px', borderRadius:99, background:bg, color:c }}>{s||'Unknown'}</span>;
};

const inp = (extra={}) => ({
  width:'100%', padding:'11px 14px', borderRadius:10,
  border:'1.5px solid #e5e7eb', background:'#f9fafb',
  fontSize:14, outline:'none', boxSizing:'border-box',
  fontFamily:'inherit', ...extra,
});

const Field = ({ label, icon: Icon, children, required }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
    <label style={{ fontSize:13, fontWeight:600, color:'#374151' }}>
      {label} {required && <span style={{ color:'#ef4444' }}>*</span>}
    </label>
    {Icon ? (
      <div style={{ position:'relative' }}>
        <Icon size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', pointerEvents:'none' }} />
        {React.cloneElement(children, { style:{ ...inp(), paddingLeft:38, ...(children.props.style||{}) } })}
      </div>
    ) : children}
  </div>
);

/* ── Modal ─────────────────────────────────────────────────────────────────── */
function CreateModal({ onClose, onCreated }) {
  const [form, setForm]     = useState({ name:'', phone:'', line1:'', city:'', state:'', pincode:'', pickupDate:'', pickupTime:'', parcelType:'standard' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.line1 || !form.pickupDate) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true); setError('');
    try {
      // find-or-create customer
      const csRes  = await customersAPI.getAll({ search: form.phone });
      const list   = csRes?.data?.data?.customers || csRes?.data?.data || csRes?.data || [];
      const arr    = Array.isArray(list) ? list : [];
      let customerId;
      const existing = arr.find(c => c.phone === form.phone);
      if (existing) {
        customerId = existing._id;
      } else {
        const cr = await customersAPI.create({ name:form.name, phone:form.phone, address:{ line1:form.line1, city:form.city, state:form.state, pincode:form.pincode } });
        customerId = cr?.data?.data?.customer?._id || cr?.data?.data?._id;
      }
      await pickupsAPI.create({
        customer:   customerId,
        pickupDate: form.pickupDate,
        pickupTime: form.pickupTime,
        address:    { line1:form.line1, city:form.city, state:form.state, pincode:form.pincode },
        parcelType: form.parcelType,
      });
      setSuccess(true);
      setTimeout(() => { onCreated(); onClose(); }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create pickup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,.3)' }}>
        {/* Header */}
        <div style={{ padding:'24px 28px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#3b82f6,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Truck size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize:16, fontWeight:800, color:'#111', margin:0 }}>New Pickup Request</h2>
              <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>Fill in the customer and pickup details</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border:'none', background:'#f3f4f6', borderRadius:8, padding:8, cursor:'pointer', display:'flex' }}><X size={16} color="#6b7280" /></button>
        </div>

        <form onSubmit={submit} style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:18 }}>
          {success && (
            <div style={{ background:'#d1fae5', border:'1px solid #6ee7b7', borderRadius:10, padding:'12px 16px', display:'flex', gap:10, alignItems:'center' }}>
              <CheckCircle size={16} color="#059669" /><span style={{ fontSize:13, color:'#065f46', fontWeight:600 }}>Pickup created successfully!</span>
            </div>
          )}
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 16px', display:'flex', gap:10, alignItems:'center' }}>
              <AlertCircle size={16} color="#dc2626" /><span style={{ fontSize:13, color:'#b91c1c' }}>{error}</span>
            </div>
          )}

          <div style={{ background:'#f8faff', borderRadius:12, padding:16, border:'1px solid #e0e7ff' }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#4f46e5', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 14px' }}>Customer Information</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Field label="Full Name" icon={User} required>
                <input type="text" placeholder="John Doe" value={form.name} onChange={set('name')} />
              </Field>
              <Field label="Phone Number" icon={Phone} required>
                <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
              </Field>
            </div>
          </div>

          <div style={{ background:'#f8faff', borderRadius:12, padding:16, border:'1px solid #e0e7ff' }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#4f46e5', textTransform:'uppercase', letterSpacing:'.05em', margin:'0 0 14px' }}>Pickup Address</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <Field label="Street / Line 1" icon={MapPin} required>
                <input type="text" placeholder="123 MG Road" value={form.line1} onChange={set('line1')} />
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#374151' }}>City</label>
                  <input style={inp()} type="text" placeholder="Bangalore" value={form.city} onChange={set('city')} />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#374151' }}>State</label>
                  <input style={inp()} type="text" placeholder="Karnataka" value={form.state} onChange={set('state')} />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#374151' }}>Pincode</label>
                  <input style={inp()} type="text" placeholder="560001" value={form.pincode} onChange={set('pincode')} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
            <Field label="Pickup Date" icon={Calendar} required>
              <input type="date" value={form.pickupDate} onChange={set('pickupDate')} />
            </Field>
            <Field label="Pickup Time" icon={Clock}>
              <input type="time" value={form.pickupTime} onChange={set('pickupTime')} />
            </Field>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <label style={{ fontSize:13, fontWeight:600, color:'#374151' }}>Parcel Type</label>
              <select style={inp()} value={form.parcelType} onChange={set('parcelType')}>
                <option value="standard">Standard</option>
                <option value="document">Document</option>
                <option value="fragile">Fragile</option>
                <option value="electronics">Electronics</option>
                <option value="bulk">Bulk</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading || success}
            style={{ padding:'13px', border:'none', borderRadius:12, background: loading||success ? '#a5b4fc' : 'linear-gradient(135deg,#4f46e5,#6366f1)', color:'#fff', fontWeight:700, fontSize:14, cursor: loading||success ? 'not-allowed':'pointer', boxShadow:'0 4px 14px rgba(79,70,229,.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {loading ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .65s linear infinite' }} /> Creating…</> : <><Plus size={15} /> Create Pickup</>}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function PickupsPage() {
  const [pickups,   setPickups]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all');
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    try { setError('');
      const res = await pickupsAPI.getAll();
      const d = res?.data; setPickups(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
    } catch { setError('Failed to load pickups.'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const STATUS_FILTERS = ['all','pending','assigned','in_pickup','at_center','delivered'];
  const filtered = pickups.filter(p => {
    const matchSearch = (p?.customer?.name||p?.name||'').toLowerCase().includes(search.toLowerCase()) ||
                        (p?.customer?.phone||'').includes(search);
    const matchFilter = filter === 'all' || (p?.status||'').toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  const counts = { all: pickups.length };
  pickups.forEach(p => { const s=(p?.status||'').toLowerCase(); counts[s]=(counts[s]||0)+1; });

  return (
    <div style={{ padding:32, background:'#f5f5f7', minHeight:'100vh', fontFamily:'Inter, system-ui, sans-serif' }}>
      {showModal && <CreateModal onClose={() => setShowModal(false)} onCreated={load} />}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'#111', margin:0 }}>Pickups</h1>
          <p style={{ fontSize:13, color:'#6b7280', marginTop:4 }}>{pickups.length} total pickup requests</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:10, border:'1px solid #e5e7eb', background:'#fff', color:'#374151', cursor:'pointer', fontSize:13, fontWeight:600 }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#4f46e5,#6366f1)', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700, boxShadow:'0 4px 14px rgba(79,70,229,.35)' }}>
            <Plus size={15} /> New Pickup
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:24 }}>
        {[
          { label:'Total',     val:counts.all||0,        bg:'#ede9fe', c:'#5b21b6' },
          { label:'Pending',   val:counts.pending||0,    bg:'#fef3c7', c:'#92400e' },
          { label:'Assigned',  val:counts.assigned||0,   bg:'#dbeafe', c:'#1e40af' },
          { label:'In Pickup', val:counts.in_pickup||0,  bg:'#dbeafe', c:'#1e40af' },
          { label:'Delivered', val:counts.delivered||0,  bg:'#d1fae5', c:'#065f46' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:800, color:s.c }}>{s.val}</div>
            <div style={{ fontSize:11, color:s.c, fontWeight:600, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1', minWidth:220 }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone…"
            style={{ width:'100%', padding:'10px 14px 10px 36px', borderRadius:10, border:'1px solid #e5e7eb', background:'#fff', fontSize:13, outline:'none', boxSizing:'border-box' }} />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'8px 14px', borderRadius:8, border:'1.5px solid', fontSize:12, fontWeight:600, cursor:'pointer', textTransform:'capitalize',
                borderColor: filter===f ? '#4f46e5' : '#e5e7eb',
                background:  filter===f ? '#4f46e5'  : '#fff',
                color:       filter===f ? '#fff'     : '#6b7280',
              }}>{f}</button>
          ))}
        </div>
      </div>

      {error && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', gap:10, alignItems:'center' }}><AlertCircle size={16} color="#dc2626" /><span style={{ fontSize:13, color:'#b91c1c' }}>{error}</span></div>}

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,.06)', overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1.2fr 1.2fr 1fr', gap:16, padding:'13px 24px', background:'#f9fafb', borderBottom:'1px solid #f3f4f6', fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.05em' }}>
          <span>Customer</span><span>Address</span><span>Date / Time</span><span>Status</span><span>Actions</span>
        </div>
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'#9ca3af', fontSize:14 }}>Loading pickups…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'#9ca3af' }}>
            <Truck size={40} style={{ margin:'0 auto 12px', display:'block', opacity:.4 }} />
            <p style={{ fontSize:14 }}>No pickups found</p>
          </div>
        ) : filtered.map((p, i) => (
          <div key={p?._id||i} style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1.2fr 1.2fr 1fr', gap:16, padding:'14px 24px', borderBottom: i<filtered.length-1 ? '1px solid #f9fafb':'none', alignItems:'center' }}
            onMouseEnter={e => e.currentTarget.style.background='#fafafa'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:'#111' }}>{p?.customer?.name||p?.name||'Unknown'}</div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:2, display:'flex', alignItems:'center', gap:4 }}><Phone size={10}/>{p?.customer?.phone||'N/A'}</div>
            </div>
            <div style={{ fontSize:12, color:'#6b7280' }}>{p?.address?.line1||p?.address||'N/A'}{p?.address?.city ? `, ${p.address.city}`:''}</div>
            <div style={{ fontSize:12, color:'#374151' }}>
              <div style={{ fontWeight:600 }}>{p?.pickupDate||'—'}</div>
              <div style={{ color:'#9ca3af', marginTop:2 }}>{p?.pickupTime||'—'}</div>
            </div>
            <div>{statusColor(p?.status)}</div>
            <button style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#4f46e5', border:'none', background:'none', cursor:'pointer', fontWeight:600 }}>
              Details <ChevronRight size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

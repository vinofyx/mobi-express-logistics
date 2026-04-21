import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

/* ─── Shared styles ──────────────────────────────────────────────────── */
const F = { fontFamily: 'Inter, system-ui, sans-serif' };

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 16,
};

const card = {
  background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480,
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', ...F,
};

const header = (color) => ({
  background: color, padding: '20px 24px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
});

const body   = { padding: '24px 24px 0' };
const footer = { padding: '16px 24px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end' };

const inp = (err) => ({
  width: '100%', padding: '10px 12px', borderRadius: 10, boxSizing: 'border-box',
  border: `1.5px solid ${err ? '#ef4444' : '#e2e8f0'}`, fontSize: 14,
  outline: 'none', background: '#f8fafc', color: '#0f172a',
});

const label   = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 };
const errTxt  = { color: '#ef4444', fontSize: 12, marginTop: 3 };
const row     = { marginBottom: 14 };
const grid2   = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

const btnPrimary = (bg, disabled) => ({
  padding: '11px 24px', borderRadius: 10, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
  background: disabled ? '#93c5fd' : bg, color: '#fff', fontSize: 14, fontWeight: 700,
  display: 'flex', alignItems: 'center', gap: 6,
});

const btnSecondary = {
  padding: '11px 20px', borderRadius: 10, border: '1.5px solid #e2e8f0',
  cursor: 'pointer', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600,
};

/* Shared spin keyframe — injected once per modal */
const SPIN_CSS = `@keyframes _spin{to{transform:rotate(360deg)}}`;
const spinStyle = { animation: '_spin 0.7s linear infinite' };

/* ─── Toast ──────────────────────────────────────────────────────────── */
function Toast({ type, message }) {
  const ok = type === 'success';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
      borderRadius: 10, marginBottom: 16,
      background: ok ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`,
    }}>
      {ok ? <CheckCircle size={16} color="#16a34a" /> : <AlertCircle size={16} color="#dc2626" />}
      <p style={{ margin: 0, fontSize: 14, color: ok ? '#15803d' : '#dc2626', fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
}

/* ─── CloseBtn ───────────────────────────────────────────────────────── */
function CloseBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
      cursor: 'pointer', padding: 6, display: 'flex', color: '#fff',
    }}>
      <X size={18} />
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   1. ADD CUSTOMER MODAL
═══════════════════════════════════════════════════════════════════════════ */
export function AddCustomerModal({ onClose, onSuccess }) {
  const [form, setForm]     = useState({ name: '', phone: '', email: '', line1: '', city: '', state: '', pincode: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState(null);

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                e.name    = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone  = 'Enter valid 10-digit mobile (starts 6–9)';
    if (!form.line1.trim())               e.line1   = 'Address line is required';
    if (!form.city.trim())                e.city    = 'City is required';
    if (!form.state.trim())               e.state   = 'State is required';
    if (!/^\d{6}$/.test(form.pincode))   e.pincode = 'Enter valid 6-digit PIN code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await axiosInstance.post('/customers', {
        name:    form.name,
        phone:   form.phone,
        email:   form.email || undefined,
        address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode },
      });
      setToast({ type: 'success', message: `Customer "${form.name}" created successfully!` });
      setTimeout(() => { onSuccess?.(); onClose(); }, 1500);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to create customer.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{SPIN_CSS}</style>
      <div style={card}>
        <div style={header('linear-gradient(135deg,#7c3aed,#a855f7)')}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Add Customer</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '2px 0 0' }}>Register a new customer</p>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div style={body}>
          {toast && <Toast {...toast} />}

          <div style={row}>
            <label style={label}>Full Name *</label>
            <input style={inp(errors.name)} placeholder="e.g. Dharani Lekkala" value={form.name} onChange={set('name')} />
            {errors.name && <p style={errTxt}>{errors.name}</p>}
          </div>

          <div style={{ ...grid2, marginBottom: 14 }}>
            <div>
              <label style={label}>Phone *</label>
              <input style={inp(errors.phone)} placeholder="9876543210" value={form.phone} onChange={set('phone')} maxLength={10} />
              {errors.phone && <p style={errTxt}>{errors.phone}</p>}
            </div>
            <div>
              <label style={label}>Email (optional)</label>
              <input style={inp()} placeholder="email@example.com" value={form.email} onChange={set('email')} />
            </div>
          </div>

          <div style={row}>
            <label style={label}>Address Line 1 *</label>
            <input style={inp(errors.line1)} placeholder="123 Main Street" value={form.line1} onChange={set('line1')} />
            {errors.line1 && <p style={errTxt}>{errors.line1}</p>}
          </div>

          <div style={{ ...grid2, marginBottom: 14 }}>
            <div>
              <label style={label}>City *</label>
              <input style={inp(errors.city)} placeholder="Hyderabad" value={form.city} onChange={set('city')} />
              {errors.city && <p style={errTxt}>{errors.city}</p>}
            </div>
            <div>
              <label style={label}>State *</label>
              <input style={inp(errors.state)} placeholder="Telangana" value={form.state} onChange={set('state')} />
              {errors.state && <p style={errTxt}>{errors.state}</p>}
            </div>
          </div>

          <div style={row}>
            <label style={label}>PIN Code *</label>
            <input style={inp(errors.pincode)} placeholder="500001" value={form.pincode} onChange={set('pincode')} maxLength={6} />
            {errors.pincode && <p style={errTxt}>{errors.pincode}</p>}
          </div>
        </div>

        <div style={footer}>
          <button style={btnSecondary} onClick={onClose}>Cancel</button>
          <button style={btnPrimary('linear-gradient(135deg,#7c3aed,#a855f7)', loading)} onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader size={14} style={spinStyle} /> Saving…</> : 'Create Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2. CREATE PICKUP MODAL  (find-or-create customer → then pickup)
═══════════════════════════════════════════════════════════════════════════ */
export function CreatePickupModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', phone: '', line1: '', city: '', state: '', pincode: '', pickupDate: '', pickupTime: '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!form.name.trim())                 e.name       = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone      = 'Valid 10-digit mobile required';
    if (!form.line1.trim())                e.line1      = 'Address required';
    if (!form.city.trim())                 e.city       = 'City required';
    if (!form.state.trim())                e.state      = 'State required';
    if (!/^\d{6}$/.test(form.pincode))    e.pincode    = 'Valid 6-digit PIN required';
    if (!form.pickupDate)                  e.pickupDate = 'Pickup date required';
    if (!form.pickupTime)                  e.pickupTime = 'Pickup time required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* Find existing customer by phone, create new one only if none found */
  const findOrCreateCustomer = async () => {
    const searchRes = await axiosInstance.get(`/customers?search=${form.phone}`);
    const list = searchRes.data?.data;
    const customers = Array.isArray(list) ? list : (list?.customers || []);
    const existing = customers.find((c) => c.phone === form.phone);
    if (existing) return existing._id;

    const createRes = await axiosInstance.post('/customers', {
      name:    form.name,
      phone:   form.phone,
      address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode },
    });
    return createRes.data.data.customer._id;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const customerId = await findOrCreateCustomer();

      await axiosInstance.post('/pickups', {
        customer:   customerId,
        pickupDate: form.pickupDate,
        pickupTime: form.pickupTime,
        address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode },
      });

      setToast({ type: 'success', message: 'Pickup scheduled successfully!' });
      setTimeout(() => { onSuccess?.(); onClose(); }, 1500);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to create pickup.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{SPIN_CSS}</style>
      <div style={{ ...card, maxWidth: 520 }}>
        <div style={header('linear-gradient(135deg,#2563eb,#6366f1)')}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Create Pickup</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '2px 0 0' }}>Schedule a new pickup request</p>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div style={body}>
          {toast && <Toast {...toast} />}
          <p style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '8px 12px', borderRadius: 8, marginBottom: 14 }}>
            If the customer already exists their record will be reused automatically.
          </p>

          <div style={{ ...grid2, marginBottom: 14 }}>
            <div>
              <label style={label}>Customer Name *</label>
              <input style={inp(errors.name)} placeholder="Full name" value={form.name} onChange={set('name')} />
              {errors.name && <p style={errTxt}>{errors.name}</p>}
            </div>
            <div>
              <label style={label}>Phone *</label>
              <input style={inp(errors.phone)} placeholder="9876543210" value={form.phone} onChange={set('phone')} maxLength={10} />
              {errors.phone && <p style={errTxt}>{errors.phone}</p>}
            </div>
          </div>

          <div style={row}>
            <label style={label}>Pickup Address *</label>
            <input style={inp(errors.line1)} placeholder="Street address" value={form.line1} onChange={set('line1')} />
            {errors.line1 && <p style={errTxt}>{errors.line1}</p>}
          </div>

          <div style={{ ...grid2, marginBottom: 14 }}>
            <div>
              <label style={label}>City *</label>
              <input style={inp(errors.city)} placeholder="Hyderabad" value={form.city} onChange={set('city')} />
              {errors.city && <p style={errTxt}>{errors.city}</p>}
            </div>
            <div>
              <label style={label}>State *</label>
              <input style={inp(errors.state)} placeholder="Telangana" value={form.state} onChange={set('state')} />
              {errors.state && <p style={errTxt}>{errors.state}</p>}
            </div>
          </div>

          <div style={{ ...grid2, marginBottom: 14 }}>
            <div>
              <label style={label}>PIN Code *</label>
              <input style={inp(errors.pincode)} placeholder="500001" value={form.pincode} onChange={set('pincode')} maxLength={6} />
              {errors.pincode && <p style={errTxt}>{errors.pincode}</p>}
            </div>
          </div>

          <div style={{ ...grid2, marginBottom: 14 }}>
            <div>
              <label style={label}>Pickup Date *</label>
              <input type="date" min={today} style={inp(errors.pickupDate)} value={form.pickupDate} onChange={set('pickupDate')} />
              {errors.pickupDate && <p style={errTxt}>{errors.pickupDate}</p>}
            </div>
            <div>
              <label style={label}>Pickup Time *</label>
              <input type="time" style={inp(errors.pickupTime)} value={form.pickupTime} onChange={set('pickupTime')} />
              {errors.pickupTime && <p style={errTxt}>{errors.pickupTime}</p>}
            </div>
          </div>
        </div>

        <div style={footer}>
          <button style={btnSecondary} onClick={onClose}>Cancel</button>
          <button style={btnPrimary('linear-gradient(135deg,#2563eb,#6366f1)', loading)} onClick={handleSubmit} disabled={loading}>
            {loading ? <><Loader size={14} style={spinStyle} /> Scheduling…</> : 'Schedule Pickup'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3. TRACK SHIPMENT MODAL
═══════════════════════════════════════════════════════════════════════════ */

/* Normalise any status string to the statusColor key (e.g. "In Transit" → "in_transit") */
function normaliseStatus(s) {
  return String(s).toLowerCase().replace(/[\s-]+/g, '_');
}

const statusColor = {
  pending:     { bg: '#fff7ed', color: '#c2410c' },
  requested:   { bg: '#fff7ed', color: '#c2410c' },
  processing:  { bg: '#fef9c3', color: '#a16207' },
  in_pickup:   { bg: '#fef9c3', color: '#a16207' },
  at_center:   { bg: '#e0e7ff', color: '#4338ca' },
  in_transit:  { bg: '#dbeafe', color: '#1d4ed8' },
  shipped:     { bg: '#e0e7ff', color: '#4338ca' },
  delivered:   { bg: '#dcfce7', color: '#15803d' },
  returned:    { bg: '#fee2e2', color: '#dc2626' },
  cancelled:   { bg: '#fee2e2', color: '#dc2626' },
  created:     { bg: '#f1f5f9', color: '#475569' },
};

export function TrackShipmentModal({ onClose }) {
  const [shipmentId, setShipmentId] = useState('');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');

  const handleTrack = async () => {
    const id = shipmentId.trim();
    if (!id) { setError('Enter a shipment or tracking ID'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axiosInstance.get(`/shipments/track/${id}`);
      /* Handle both { data: {...} } and { shipment: {...} } shapes */
      const raw = res.data?.data;
      setResult(raw || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Shipment not found. Try a different ID.');
    } finally {
      setLoading(false);
    }
  };

  const statusVal = result?.shipment?.status || result?.status;
  const statusKey = statusVal ? normaliseStatus(statusVal) : null;
  const statusC   = (statusKey && statusColor[statusKey]) || { bg: '#f1f5f9', color: '#64748b' };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{SPIN_CSS}</style>
      <div style={card}>
        <div style={header('linear-gradient(135deg,#059669,#14b8a6)')}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Track Shipment</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '2px 0 0' }}>
              Enter shipment or parcel tracking ID
            </p>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div style={body}>
          <div style={row}>
            <label style={label}>Tracking / Shipment ID</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...inp(!!error), flex: 1 }}
                placeholder="e.g. SHP-HYD-20260417-ABC1"
                value={shipmentId}
                onChange={(e) => { setShipmentId(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              />
              <button
                onClick={handleTrack}
                disabled={loading}
                style={{
                  padding: '10px 18px', background: 'linear-gradient(135deg,#059669,#14b8a6)',
                  color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {loading ? <Loader size={14} style={spinStyle} /> : null}
                Track
              </button>
            </div>
            {error && <p style={errTxt}>{error}</p>}
          </div>

          {result && (
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: 0 }}>
                  {result.shipment?.shipmentId || result.shipmentId || shipmentId}
                </p>
                {statusVal && (
                  <span style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: statusC.bg, color: statusC.color, textTransform: 'capitalize',
                  }}>
                    {statusVal}
                  </span>
                )}
              </div>

              {[
                ['Origin',      result.shipment?.originHub      || result.originHub],
                ['Destination', result.shipment?.destinationHub || result.destinationHub],
                ['Location',    result.currentLocation],
                ['Parcels',     result.shipment?.parcels?.length ?? result.parcels?.length],
                ['Created',     result.shipment?.createdAt
                  ? new Date(result.shipment.createdAt).toLocaleDateString('en-IN')
                  : null],
              ].filter(([, v]) => v != null && v !== '').map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={footer}>
          <button style={btnSecondary} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   4. ADD PARCEL MODAL  (lookup customer by phone → create parcel)
═══════════════════════════════════════════════════════════════════════════ */
export function AddParcelModal({ onClose, onSuccess }) {
  const [step, setStep]           = useState(1);
  const [phone, setPhone]         = useState('');
  const [customer, setCustomer]   = useState(null);
  const [phoneErr, setPhoneErr]   = useState('');
  const [finding, setFinding]     = useState(false);

  const [form, setForm]           = useState({ weight: '', type: 'Parcel', description: '' });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState(null);

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: '' }));
  };

  const findCustomer = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneErr('Enter valid 10-digit mobile number');
      return;
    }
    setFinding(true); setPhoneErr('');
    try {
      const res = await axiosInstance.get(`/customers?search=${phone}`);
      /* paginate returns a flat array as res.data.data */
      const raw  = res.data?.data;
      const list = Array.isArray(raw) ? raw : (raw?.customers || []);
      /* Prefer exact phone match */
      const found = list.find((c) => c.phone === phone) || list[0] || null;
      if (!found) {
        setPhoneErr('No customer found with this number. Please add the customer first.');
      } else {
        setCustomer(found);
        setStep(2);
      }
    } catch (err) {
      setPhoneErr(err.response?.data?.message || 'Error looking up customer. Try again.');
    } finally {
      setFinding(false);
    }
  };

  const handleSubmit = async () => {
    const e = {};
    const w = parseFloat(form.weight);
    if (!form.weight || isNaN(w) || w < 0.1) e.weight = 'Enter valid weight (min 0.1 kg)';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await axiosInstance.post('/parcels', {
        customer:    customer._id,
        weight:      w,
        type:        form.type,
      });
      setToast({ type: 'success', message: 'Parcel added successfully!' });
      setTimeout(() => { onSuccess?.(); onClose(); }, 1500);
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to add parcel.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{SPIN_CSS}</style>
      <div style={card}>
        <div style={header('linear-gradient(135deg,#d97706,#f59e0b)')}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Add Parcel</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '2px 0 0' }}>
              {step === 1 ? 'Step 1 of 2 — Find customer' : `Step 2 of 2 — Parcel for ${customer?.name}`}
            </p>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        <div style={body}>
          {toast && <Toast {...toast} />}

          {/* Step 1 — Find Customer */}
          {step === 1 && (
            <>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                Enter the customer's registered phone number to link this parcel.
              </p>
              <div style={row}>
                <label style={label}>Customer Phone *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...inp(!!phoneErr), flex: 1 }}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setPhoneErr(''); }}
                    maxLength={10}
                    onKeyDown={(e) => e.key === 'Enter' && findCustomer()}
                  />
                  <button
                    onClick={findCustomer}
                    disabled={finding}
                    style={{
                      padding: '10px 16px', background: 'linear-gradient(135deg,#d97706,#f59e0b)',
                      color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700,
                      cursor: finding ? 'not-allowed' : 'pointer', fontSize: 14,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {finding ? <Loader size={14} style={spinStyle} /> : null}
                    Find
                  </button>
                </div>
                {phoneErr && <p style={errTxt}>{phoneErr}</p>}
              </div>
            </>
          )}

          {/* Step 2 — Parcel Details */}
          {step === 2 && (
            <>
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
                padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center',
              }}>
                <CheckCircle size={16} color="#16a34a" />
                <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                  {customer?.name} — {customer?.phone}
                </span>
              </div>

              <div style={{ ...grid2, marginBottom: 14 }}>
                <div>
                  <label style={label}>Weight (kg) *</label>
                  <input
                    style={inp(errors.weight)}
                    placeholder="e.g. 2.5"
                    value={form.weight}
                    onChange={set('weight')}
                    type="number"
                    step="0.1"
                    min="0.1"
                  />
                  {errors.weight && <p style={errTxt}>{errors.weight}</p>}
                </div>
                <div>
                  <label style={label}>Parcel Type</label>
                  <select style={inp()} value={form.type} onChange={set('type')}>
                    {['Document', 'Parcel', 'Fragile', 'Perishable', 'Electronics'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={row}>
                <label style={label}>Description (optional)</label>
                <input
                  style={inp()}
                  placeholder="Brief description of contents"
                  value={form.description}
                  onChange={set('description')}
                />
              </div>
            </>
          )}
        </div>

        <div style={footer}>
          {step === 2 && (
            <button style={btnSecondary} onClick={() => setStep(1)}>← Back</button>
          )}
          <button style={btnSecondary} onClick={onClose}>Cancel</button>
          {step === 1 ? (
            <button
              style={btnPrimary('linear-gradient(135deg,#d97706,#f59e0b)', finding)}
              onClick={findCustomer}
              disabled={finding}
            >
              {finding ? <><Loader size={14} style={spinStyle} /> Finding…</> : 'Find Customer →'}
            </button>
          ) : (
            <button
              style={btnPrimary('linear-gradient(135deg,#d97706,#f59e0b)', loading)}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <><Loader size={14} style={spinStyle} /> Saving…</> : 'Add Parcel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { User, Mail, Lock, Eye, EyeOff, UserCheck } from 'lucide-react';
import { loginSuccess } from '../../store/slices/authSlice';
import { authAPI } from '../../api/auth.api';

const roleOptions = [
  { value: 'customer',            label: 'Customer',            desc: 'Send and receive parcels' },
  { value: 'field_agent',         label: 'Field Agent',         desc: 'Handle pickups and deliveries' },
  { value: 'center_staff',        label: 'Center Staff',        desc: 'Process parcels at center' },
  { value: 'hub_staff',           label: 'Hub Staff',           desc: 'Manage hub operations' },
  { value: 'operations_manager',  label: 'Operations Manager',  desc: 'Oversee all operations' },
];

const strengthColor = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'];

function calcStrength(pw) {
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^a-zA-Z0-9]/.test(pw))  s++;
  return s;
}

export default function RegisterPage() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const [form, setForm]         = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'customer' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCpw, setShowCpw]   = useState(false);
  const strength                = calcStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2)       errs.name            = 'Full name must be at least 2 characters';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email          = 'Enter a valid email';
    if (!form.password || form.password.length < 6)             errs.password        = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)                 errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await authAPI.register({ name: form.name, email: form.email, password: form.password, role: form.role });
      const { user, token } = result.data;
      localStorage.setItem('token', token);
      dispatch(loginSuccess({ user, token }));
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inp = (hasErr) => ({
    width: '100%', padding: '11px 12px 11px 40px',
    border: `1.5px solid ${hasErr ? '#ef4444' : '#e2e8f0'}`,
    borderRadius: 10, fontSize: 14, outline: 'none',
    background: '#f8fafc', boxSizing: 'border-box', color: '#0f172a',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0f9ff 0%,#e0e7ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 8px 40px rgba(0,0,0,0.10)', border: '1px solid #e2e8f0' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>M</span>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>MobiExpress</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Create your account</h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Join the leading logistics management platform</p>
          </div>

          {/* API Error */}
          {apiError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>!</span>
              <p style={{ color: '#dc2626', fontSize: 14, margin: 0 }}>{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input name="name" type="text" placeholder="Enter your full name" value={form.name} onChange={handleChange} disabled={loading} style={inp(errors.name)} />
              </div>
              {errors.name && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} disabled={loading} style={inp(errors.email)} />
              </div>
              {errors.email && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{errors.email}</p>}
            </div>

            {/* Role */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Role</label>
              <div style={{ position: 'relative' }}>
                <UserCheck size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <select name="role" value={form.role} onChange={handleChange} disabled={loading}
                  style={{ ...inp(false), paddingLeft: 40, appearance: 'none', cursor: 'pointer' }}>
                  {roleOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input name="password" type={showPw ? 'text' : 'password'} placeholder="Create a password" value={form.password} onChange={handleChange} disabled={loading}
                  style={{ ...inp(errors.password), paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < strength ? strengthColor[strength - 1] : '#e2e8f0', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strengthColor[strength - 1] || '#94a3b8', margin: 0 }}>
                    {form.password ? strengthLabel[strength - 1] || 'Too short' : ''}
                  </p>
                </div>
              )}
              {errors.password && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input name="confirmPassword" type={showCpw ? 'text' : 'password'} placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} disabled={loading}
                  style={{ ...inp(errors.confirmPassword), paddingRight: 40 }} />
                <button type="button" onClick={() => setShowCpw(!showCpw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                  {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: 13, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
              color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
            }}>
              {loading ? (
                <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

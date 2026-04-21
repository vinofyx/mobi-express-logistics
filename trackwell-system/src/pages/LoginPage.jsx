import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, LogIn, Truck, Package, MapPin } from 'lucide-react';
import { loginSuccess } from '../store/slices/authSlice';
import { authAPI } from '../api/auth.api';

export default function LoginPage() {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError]         = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim())                        errs.email    = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))  errs.email    = 'Enter a valid email';
    if (!formData.password)                            errs.password = 'Password is required';
    else if (formData.password.length < 6)             errs.password = 'Minimum 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await authAPI.login({ email: formData.email, password: formData.password });
      const { user, token } = result.data;
      localStorage.setItem('token', token);
      dispatch(loginSuccess({ user, token }));
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  /* ── shared input style ── */
  const inputBase = (hasErr) => ({
    width: '100%',
    padding: '11px 12px 11px 40px',
    border: `1.5px solid ${hasErr ? '#ef4444' : '#e2e8f0'}`,
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    background: '#f8fafc',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
    color: '#0f172a',
  });

  const features = [
    { icon: Truck,   title: 'Live Shipment Tracking',  desc: 'Monitor every delivery in real time.' },
    { icon: Package, title: 'Smart Parcel Management', desc: 'Scan, sort, and route parcels faster.' },
    { icon: MapPin,  title: 'Pickup Scheduling',       desc: 'Assign and track field agents easily.' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Left: Branding ───────────────────────────────────── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e293b 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow blob */}
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>M</span>
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 20, margin: 0, lineHeight: 1.2 }}>MobiExpress</p>
            <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Logistics Platform</p>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ color: '#fff', fontSize: 40, fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px' }}>
          Deliver Smarter.<br />
          <span style={{ background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Faster. Better.
          </span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, margin: '0 0 48px', lineHeight: 1.6 }}>
          The complete logistics management solution for modern businesses.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color="#3b82f6" />
              </div>
              <div>
                <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, margin: '0 0 2px' }}>{title}</p>
                <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 32, marginTop: 56, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {[['10K+', 'Parcels Daily'], ['98.5%', 'On-Time Rate'], ['500+', 'Field Agents']].map(([val, label]) => (
            <div key={label}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 22, margin: 0 }}>{val}</p>
              <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form ──────────────────────────────────────── */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Sign in to your account to continue</p>
          </div>

          {/* API Error */}
          {apiError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ color: '#ef4444', fontSize: 18 }}>!</span>
              <p style={{ color: '#dc2626', fontSize: 14, margin: 0 }}>{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  style={inputBase(errors.email)}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e)  => e.target.style.borderColor = errors.email ? '#ef4444' : '#e2e8f0'}
                />
              </div>
              {errors.email && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ ...inputBase(errors.password), paddingRight: 40 }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e)  => e.target.style.borderColor = errors.password ? '#ef4444' : '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{errors.password}</p>}
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#3b82f6', width: 14, height: 14 }} />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
              color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(59,130,246,0.4)', transition: 'opacity 0.15s',
            }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <><LogIn size={16} /> Sign in</>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </p>

          {/* Demo credentials */}
          <div style={{ marginTop: 28, padding: '16px', background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Account</p>
            <p style={{ fontSize: 13, color: '#1e40af', margin: '0 0 2px' }}><strong>Email:</strong> admin@example.com</p>
            <p style={{ fontSize: 13, color: '#1e40af', margin: '0 0 2px' }}><strong>Password:</strong> admin123</p>
            <p style={{ fontSize: 13, color: '#1e40af', margin: 0 }}><strong>Role:</strong> Admin</p>
          </div>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

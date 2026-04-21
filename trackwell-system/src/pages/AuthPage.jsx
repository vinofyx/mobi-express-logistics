import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import { authAPI } from '../api/auth.api';
import {
  Eye, EyeOff, Mail, Lock, User, Phone,
  Truck, Package, Globe, ShieldCheck, ArrowRight, Zap,
} from 'lucide-react';

const Field = ({ icon: Icon, label, error, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
      <input
        {...props}
        style={{ width: '100%', padding: '11px 14px 11px 40px', border: `1.5px solid ${error ? '#ef4444' : '#e5e7eb'}`, borderRadius: 10, fontSize: 14, background: '#f9fafb', outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; e.target.style.background = '#fff'; }}
        onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
      />
    </div>
    {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
  </div>
);

const PwField = ({ label, show, onToggle, error, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
      <input type={show ? 'text' : 'password'} placeholder="••••••••" value={value} onChange={onChange}
        style={{ width: '100%', padding: '11px 44px 11px 40px', border: `1.5px solid ${error ? '#ef4444' : '#e5e7eb'}`, borderRadius: 10, fontSize: 14, background: '#f9fafb', outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; e.target.style.background = '#fff'; }}
        onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f9fafb'; }}
      />
      <button type="button" onClick={onToggle}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2, display: 'flex' }}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
    {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
  </div>
);

const Feature = ({ icon: Icon, title, desc }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color="#fff" />
    </div>
    <div>
      <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{title}</div>
      <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginTop: 2 }}>{desc}</div>
    </div>
  </div>
);

const Stat = ({ value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{value}</div>
    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>{label}</div>
  </div>
);

export default function AuthPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [mode, setMode]       = useState('login');
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [fieldErr, setFieldErr]   = useState({});
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setFieldErr(p => ({ ...p, [k]: '' }));
    setServerErr('');
  };

  const validate = () => {
    const e = {};
    if (mode === 'signup') {
      if (!form.name.trim())  e.name  = 'Full name is required';
      if (!form.phone.trim()) e.phone = 'Phone number is required';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
      if (form.password.length < 6) e.password = 'Minimum 6 characters';
    }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerErr('');
    try {
      if (mode === 'login') {
        const res = await authAPI.login({ email: form.email, password: form.password });
        const { user, token } = res.data;
        dispatch(loginSuccess({ user, token }));
        navigate('/dashboard');
      } else {
        await authAPI.register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: 'customer' });
        setMode('login');
        setForm(p => ({ name: '', email: p.email, phone: '', password: '', confirmPassword: '' }));
      }
    } catch (err) {
      setServerErr(err?.response?.data?.message || (mode === 'login' ? 'Invalid email or password.' : 'Registration failed. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setServerErr('');
    setFieldErr({});
    setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>

      {/* LEFT PANEL */}
      <div className="auth-panel-left" style={{
        flex: '0 0 460px', display: 'none',
        background: 'linear-gradient(145deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)',
        position: 'relative', overflow: 'hidden',
        flexDirection: 'column', justifyContent: 'space-between', padding: '48px 44px',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,.3)', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(167,139,250,.25)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#818cf8,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(99,102,241,.5)' }}>
              <Truck size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>MobiExpress</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Logistics Platform</div>
            </div>
          </div>

          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.25, margin: '0 0 12px' }}>
            {mode === 'login' ? 'Welcome back 👋' : 'Join MobiExpress'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, lineHeight: 1.7, margin: '0 0 40px' }}>
            {mode === 'login'
              ? 'Sign in to manage your entire logistics operation from one powerful dashboard.'
              : 'Create your account and start streamlining logistics today.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Feature icon={Zap}         title="Real-time Tracking"   desc="Live shipment status & GPS location" />
            <Feature icon={Globe}       title="Smart Logistics"      desc="AI-optimised routes & ETAs" />
            <Feature icon={ShieldCheck} title="Enterprise Security"  desc="End-to-end encrypted operations" />
            <Feature icon={Package}     title="Parcel Management"    desc="Full lifecycle parcel tracking" />
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', paddingTop: 28, borderTop: '1px solid rgba(255,255,255,.12)' }}>
          <Stat value="50K+" label="Deliveries" />
          <Stat value="99.8%" label="Uptime" />
          <Stat value="120+" label="Couriers" />
          <Stat value="4.9★" label="Rating" />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', background: '#f5f5f7' }}>
        <div style={{ width: '100%', maxWidth: 432 }}>

          {/* Mobile logo */}
          <div className="auth-mobile-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} color="#fff" />
            </div>
            <span style={{ fontSize: 19, fontWeight: 800, color: '#1e1b4b' }}>MobiExpress</span>
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px 30px', boxShadow: '0 8px 48px rgba(0,0,0,.09)', border: '1px solid rgba(0,0,0,.06)' }}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 5px', letterSpacing: '-0.2px' }}>
                {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
              </h1>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                {mode === 'login' ? 'Enter your credentials to continue' : 'Fill in the details below to get started'}
              </p>
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 24 }}>
              {['login', 'signup'].map(m => (
                <button key={m} type="button" onClick={() => switchMode(m)}
                  style={{ flex: 1, padding: '8px 0', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .18s',
                    background: mode === m ? '#fff' : 'transparent',
                    color: mode === m ? '#4f46e5' : '#6b7280',
                    boxShadow: mode === m ? '0 1px 6px rgba(0,0,0,.1)' : 'none',
                  }}>
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {serverErr && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚠️</span>
                <span style={{ fontSize: 13, color: '#b91c1c' }}>{serverErr}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'signup' && (
                <Field icon={User} label="Full Name" type="text" placeholder="John Doe" value={form.name} onChange={set('name')} error={fieldErr.name} />
              )}
              {mode === 'signup' && (
                <Field icon={Phone} label="Phone Number" type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={set('phone')} error={fieldErr.phone} />
              )}
              <Field icon={Mail} label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={fieldErr.email} />
              <PwField label="Password" show={showPw} onToggle={() => setShowPw(p => !p)} value={form.password} onChange={set('password')} error={fieldErr.password} />
              {mode === 'signup' && (
                <PwField label="Confirm Password" show={showCpw} onToggle={() => setShowCpw(p => !p)} value={form.confirmPassword} onChange={set('confirmPassword')} error={fieldErr.confirmPassword} />
              )}

              {mode === 'login' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
                  <button type="button" style={{ border: 'none', background: 'none', fontSize: 13, color: '#4f46e5', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                    Forgot password?
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ marginTop: 6, width: '100%', padding: '13px', border: 'none', borderRadius: 12,
                  cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700,
                  background: loading ? '#a5b4fc' : 'linear-gradient(135deg,#4f46e5 0%,#6366f1 100%)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: loading ? 'none' : '0 4px 18px rgba(79,70,229,.38)', transition: 'opacity .2s',
                }}>
                {loading ? (
                  <>
                    <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'auth-spin .65s linear infinite' }} />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280' }}>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                style={{ border: 'none', background: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#9ca3af' }}>
            © 2025 MobiExpress · All rights reserved
          </p>
        </div>
      </div>

      <style>{`
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        @media (min-width: 860px) {
          .auth-panel-left  { display: flex !important; }
          .auth-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}

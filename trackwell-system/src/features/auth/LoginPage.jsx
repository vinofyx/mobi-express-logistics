import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { authAPI } from '../../api/auth.api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authAPI.login({ email: formData.email, password: formData.password });
      const { user, token } = result.data;
      localStorage.setItem('token', token);
      dispatch(loginSuccess({ user, token }));
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-base">
      {/* Left Panel */}
      <div className="w-1/2 flex items-center justify-center p-xl">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center gap-sm mb-xl">
            <div 
              className="w-12 h-12 gradient-blue-purple radius-lg flex items-center justify-center text-white text-xl font-bold shadow-glow-blue"
              style={{ boxShadow: '0 0 24px rgba(59,130,246,0.4)' }}
            >
              M
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">MobiExpress</h1>
              <p className="text-muted">Logistics Platform</p>
            </div>
          </div>

          {/* Sign In Form */}
          <div className="fade-up">
            <h2 className="text-2xl font-bold text-primary mb-md">Sign in to your account</h2>
            
            <form onSubmit={handleSubmit} className="space-y-lg">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-primary mb-sm">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-primary mb-sm">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-danger bg-opacity-10 border border-danger text-danger p-sm radius-md">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-md text-md font-bold shadow-button"
                style={{ height: '48px' }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner w-5 h-5 mr-sm"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-lg">
              <p className="text-muted">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-blue hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 bg-surface1 flex items-center justify-center p-xl relative overflow-hidden">
        {/* Radial Glow Blob */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-md fade-up-delayed-1">
          {/* Large Emoji Illustration */}
          <div className="text-6xl mb-lg">🚚</div>
          
          {/* Tagline */}
          <h2 className="text-2xl font-bold text-primary mb-sm">
            Streamline Your Logistics
          </h2>
          <p className="text-muted text-lg mb-xl">
            Manage pickups, track parcels, and optimize delivery routes with our powerful platform.
          </p>

          {/* Today's Stats */}
          <div className="grid grid-cols-3 gap-sm">
            <div className="bg-surface2 border border p-sm radius-lg text-center">
              <div className="text-2xl mb-xs">📊</div>
              <div className="text-lg font-bold text-primary">247</div>
              <div className="text-xs text-muted">Pickups Today</div>
            </div>
            <div className="bg-surface2 border border p-sm radius-lg text-center">
              <div className="text-2xl mb-xs">📦</div>
              <div className="text-lg font-bold text-primary">1,429</div>
              <div className="text-xs text-muted">Parcels Processed</div>
            </div>
            <div className="bg-surface2 border border p-sm radius-lg text-center">
              <div className="text-2xl mb-xs">✅</div>
              <div className="text-lg font-bold text-success">98.5%</div>
              <div className="text-xs text-muted">On-Time Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

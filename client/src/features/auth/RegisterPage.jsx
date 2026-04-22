import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { authAPI } from '../../api/auth.api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const roleOptions = [
    { value: 'customer', label: 'Customer', description: 'Send and receive parcels' },
    { value: 'field_agent', label: 'Field Agent', description: 'Handle pickups and deliveries' },
    { value: 'center_staff', label: 'Center Staff', description: 'Process parcels at center' },
    { value: 'hub_staff', label: 'Hub Staff', description: 'Manage hub operations' },
    { value: 'operations_manager', label: 'Operations Manager', description: 'Oversee all operations' }
  ];

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      const { user, token } = result.data;
      localStorage.setItem('token', token);
      dispatch(loginSuccess({ user, token }));
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 1) return 'bg-danger';
    if (strength === 2) return 'bg-warning';
    if (strength === 3) return 'bg-blue';
    return 'bg-success';
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-lg">
      <div className="w-full max-w-md fade-up">
        {/* Card */}
        <div 
          className="bg-surface1 border border radius-xl p-xl"
          style={{ 
            borderColor: 'var(--border)',
            background: 'var(--bg-surface1)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-lg">
            <div className="flex items-center justify-center gap-sm mb-md">
              <div 
                className="w-10 h-10 gradient-blue-purple radius-lg flex items-center justify-center text-white text-lg font-bold shadow-glow-blue"
                style={{ boxShadow: '0 0 24px rgba(59,130,246,0.4)' }}
              >
                M
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">MobiExpress</h1>
                <p className="text-muted">Create Account</p>
              </div>
            </div>
            <p className="text-muted">
              Join the leading logistics management platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-primary mb-sm">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email Address */}
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

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-primary mb-sm">
                Select your role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input w-full"
                required
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} — {option.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-primary mb-sm">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input w-full ${error.includes('password') ? 'border-danger' : ''}`}
                placeholder="Create a strong password"
                required
              />
              
              {/* Password Strength Meter */}
              <div className="flex gap-xs mt-sm">
                {[1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded-full transition-normal ${
                      passwordStrength >= level ? getPasswordStrengthColor(passwordStrength) : 'bg-surface2'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-primary mb-sm">
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input w-full ${error.includes('match') ? 'border-danger' : ''}`}
                placeholder="Confirm your password"
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
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-lg">
            <p className="text-muted">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-blue hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

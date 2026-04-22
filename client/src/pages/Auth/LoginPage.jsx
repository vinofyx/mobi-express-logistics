import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../store/thunks/authThunk';
import { Mail, Phone, X, AlertCircle } from 'lucide-react';

// Contact Administrator Modal Component
const ContactAdminModal = ({ show, onClose }) => {
  const handleEmailAdmin = () => {
    window.location.href = 'mailto:dharanilekkala425@gmail.com?subject=Account Request&body=I would like to request access to Bobba Express Logistics system.';
  };

  const handleCallSupport = () => {
    window.location.href = 'tel:+1234567890';
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      overflowY: 'auto',
      height: '100%',
      width: '100%',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        maxWidth: '448px',
        width: '100%',
        margin: '0 16px',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>Contact Administrator</h3>
          <button
            onClick={onClose}
            style={{
              color: '#6b7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertCircle size={24} style={{ color: '#3b82f6', marginTop: '2px' }} />
            <div>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#1e40af',
                margin: '0 0 4px 0'
              }}>Need an account?</h4>
              <p style={{
                fontSize: '14px',
                color: '#3b82f6',
                margin: '0'
              }}>
                Contact your system administrator to get access to Bobba Express Logistics Management System.
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: '#f9fafb'
            }} onClick={handleEmailAdmin}>
              <Mail size={20} style={{ color: '#9ca3af' }} />
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827',
                  margin: '0'
                }}>Email Administrator</p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0'
                }}>dharanilekkala425@gmail.com</p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: '#f9fafb'
            }} onClick={handleCallSupport}>
              <Phone size={20} style={{ color: '#9ca3af' }} />
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827',
                  margin: '0'
                }}>Call Support</p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0'
                }}>+1 (234) 567-8900</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#111827',
              marginBottom: '8px'
            }}>Instructions:</h4>
            <ol style={{
              fontSize: '12px',
              color: '#4b5563',
              margin: '0',
              paddingLeft: '20px'
            }}>
              <li style={{ marginBottom: '4px' }}>Send an email to the administrator with your full name and role</li>
              <li style={{ marginBottom: '4px' }}>Include your department and reason for access</li>
              <li style={{ marginBottom: '4px' }}>Wait for the administrator to create your account</li>
              <li style={{ marginBottom: '0' }}>You'll receive login credentials via email</li>
            </ol>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '16px'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                handleEmailAdmin();
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#2563eb',
                border: '1px solid #2563eb',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showContactModal, setShowContactModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await dispatch(loginUser(formData));
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleContactAdmin = () => {
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ maxWidth: '448px', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#2563eb',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7H8m5 0v6m0-6V4a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 01-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 104 0m6 0a2 2 0 104 0m-4 0a2 2 0 104 0" />
                </svg>
              </div>
              <span style={{ marginLeft: '8px', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Bobba Express</span>
            </div>
          </div>
          <h2 style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '30px',
            fontWeight: '800',
            color: '#111827'
          }}>
            Sign in to your account
          </h2>
          <p style={{
            marginTop: '8px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Or{' '}
            <button 
              onClick={handleContactAdmin}
              style={{
                fontWeight: '500',
                color: '#2563eb',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              contact your administrator
            </button>
            {' '}to get access
          </p>
        </div>
        
        <form style={{ marginTop: '32px' }} onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '6px',
                  backgroundColor: 'white'
                }}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p style={{ marginTop: '4px', fontSize: '12px', color: '#ef4444' }}>{errors.email}</p>
              )}
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: `1px solid ${errors.password ? '#ef4444' : '#d1d5db'}`,
                  borderRadius: '6px',
                  backgroundColor: 'white'
                }}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p style={{ marginTop: '4px', fontSize: '12px', color: '#ef4444' }}>{errors.password}</p>
              )}
            </div>
          </div>

          {error && (
            <div style={{
              borderRadius: '6px',
              backgroundColor: '#fef2f2',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex' }}>
                <div style={{ flexShrink: 0 }}>
                  <AlertCircle size={20} style={{ color: '#f59e0b' }} />
                </div>
                <div style={{ marginLeft: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#991b1b', marginBottom: '4px' }}>Login failed</h3>
                  <div style={{ fontSize: '14px', color: '#b91c1c', marginTop: '4px' }}>
                    <p>{error}</p>
                    {error.includes('No account found') && (
                      <p style={{ marginTop: '8px' }}>
                        <button
                          onClick={handleContactAdmin}
                          style={{
                            fontWeight: '500',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none',
                            color: '#2563eb'
                          }}
                        >
                          Contact your administrator
                        </button>
                        {' '}to create an account.
                      </p>
                    )}
                    {error.includes('Invalid credentials') && (
                      <p style={{ marginTop: '8px' }}>
                        Please check your credentials or{' '}
                        <button
                          onClick={() => setFormData({ ...formData, password: 'Admin@123' })}
                          style={{
                            fontWeight: '500',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none',
                            color: '#2563eb'
                          }}
                        >
                          try the default password
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                border: '1px solid #2563eb',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
              Don't have an account?{' '}
              <a 
                href="/register"
                style={{
                  fontWeight: '500',
                  color: '#2563eb',
                  textDecoration: 'underline'
                }}
              >
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>

      <ContactAdminModal 
        show={showContactModal} 
        onClose={handleCloseContactModal} 
      />
    </div>
  );
};

export default LoginPage;

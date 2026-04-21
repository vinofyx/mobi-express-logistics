import React, { useState } from 'react';
import { authAPI } from '../api/auth.api';

const TestAPI = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRegister = async () => {
    setLoading(true);
    try {
      const response = await authAPI.register({
        name: 'Test User',
        email: 'test' + Date.now() + '@example.com',
        password: 'Test@1234',
        role: 'center_staff'
      });
      setResult('SUCCESS: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult('ERROR: ' + JSON.stringify(error.response?.data || error.message, null, 2));
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', margin: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>API Test Component</h3>
      <button onClick={testRegister} disabled={loading} style={{ padding: '10px 20px', margin: '10px 0' }}>
        {loading ? 'Testing...' : 'Test Register API'}
      </button>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
        {result}
      </pre>
    </div>
  );
};

export default TestAPI;

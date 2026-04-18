// Test script to verify login and signup functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('Health Check:', response.data);
    return true;
  } catch (error) {
    console.error('Health Check Failed:', error.message);
    return false;
  }
}

async function testLogin() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('Login Test:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('Login Test Failed:', error.message);
    return false;
  }
}

async function testSignup() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer',
      phone: '9876543210',
      address: '123 Test St'
    });
    console.log('Signup Test:', response.data);
    return response.data.success;
  } catch (error) {
    console.error('Signup Test Failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== AUTHENTICATION API TESTS ===\n');
  
  const health = await testHealth();
  const login = await testLogin();
  const signup = await testSignup();
  
  console.log('\n=== TEST RESULTS ===');
  console.log('Health Check:', health ? 'PASS' : 'FAIL');
  console.log('Login API:', login ? 'PASS' : 'FAIL');
  console.log('Signup API:', signup ? 'PASS' : 'FAIL');
  
  const allPassed = health && login && signup;
  console.log('\nOverall Status:', allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
  
  if (allPassed) {
    console.log('\n=== FRONTEND TESTING INSTRUCTIONS ===');
    console.log('1. Open: http://localhost:8080/login');
    console.log('2. Use credentials: admin@example.com / admin123');
    console.log('3. Open: http://localhost:8080/signup');
    console.log('4. Fill form and test registration');
    console.log('5. Check browser console for debug logs');
  }
}

runTests().catch(console.error);

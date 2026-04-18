// Simple test using Node.js built-in http module
const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testHealth() {
  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    };
    
    const response = await makeRequest(options);
    console.log('Health Check:', response.statusCode, response.body);
    return response.statusCode === 200;
  } catch (error) {
    console.error('Health Check Failed:', error.message);
    return false;
  }
}

async function testLogin() {
  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const data = {
      email: 'admin@example.com',
      password: 'admin123'
    };
    
    const response = await makeRequest(options, data);
    console.log('Login Test:', response.statusCode, response.body);
    return response.statusCode === 200;
  } catch (error) {
    console.error('Login Test Failed:', error.message);
    return false;
  }
}

async function testSignup() {
  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const data = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer',
      phone: '9876543210',
      address: '123 Test St'
    };
    
    const response = await makeRequest(options, data);
    console.log('Signup Test:', response.statusCode, response.body);
    return response.statusCode === 201;
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
    console.log('6. Both forms should now work correctly');
  } else {
    console.log('\n=== TROUBLESHOOTING ===');
    console.log('1. Make sure backend server is running on port 5000');
    console.log('2. Check MongoDB connection');
    console.log('3. Verify CORS configuration');
    console.log('4. Check browser network tab for errors');
  }
}

runTests().catch(console.error);

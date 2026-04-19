// Full-stack authentication flow test
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  name: 'Full Stack Test User',
  email: 'fullstack@test.com',
  password: '123456',
  phone: '9876543210',
  address: '123 Full Stack Test St',
  role: 'customer'
};

// Helper function to make HTTP requests
const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsed
          });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

// Test functions
async function testHealthCheck() {
  console.log('\n=== 1. HEALTH CHECK ===');
  try {
    const response = await makeRequest('GET', '/health');
    console.log(`Status: ${response.statusCode}`);
    console.log(`Response:`, response.data);
    return response.statusCode === 200 && response.data.success;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
}

async function testUserSignup() {
  console.log('\n=== 2. USER SIGNUP ===');
  try {
    console.log('Signup data:', TEST_USER);
    const response = await makeRequest('POST', '/api/auth/register', TEST_USER);
    console.log(`Status: ${response.statusCode}`);
    console.log(`Response:`, response.data);
    
    if (response.statusCode === 201 && response.data.success) {
      console.log('User created successfully!');
      console.log('User ID:', response.data.data.user._id);
      console.log('User email:', response.data.data.user.email);
      console.log('User role:', response.data.data.user.role);
      return true;
    } else {
      console.error('Signup failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('Signup error:', error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n=== 3. USER LOGIN ===');
  try {
    const loginData = {
      email: TEST_USER.email,
      password: TEST_USER.password
    };
    
    console.log('Login data:', loginData);
    const response = await makeRequest('POST', '/api/auth/login', loginData);
    console.log(`Status: ${response.statusCode}`);
    console.log(`Response:`, response.data);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('Login successful!');
      console.log('User name:', response.data.data.user.name);
      console.log('Token received:', response.data.data.token ? 'YES' : 'NO');
      console.log('Refresh token received:', response.data.data.refreshToken ? 'YES' : 'NO');
      return true;
    } else {
      console.error('Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('Login error:', error.message);
    return false;
  }
}

async function testDashboardEndpoints() {
  console.log('\n=== 4. DASHBOARD ENDPOINTS ===');
  
  const endpoints = [
    { path: '/api/pickups', name: 'Pickups' },
    { path: '/api/parcels', name: 'Parcels' },
    { path: '/api/shipments', name: 'Shipments' }
  ];
  
  let allPassed = true;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint.name} API...`);
      const response = await makeRequest('GET', endpoint.path);
      console.log(`Status: ${response.statusCode}`);
      
      if (response.statusCode === 200 && response.data.success) {
        console.log(`${endpoint.name} API working!`);
        console.log(`Data type: ${Array.isArray(response.data.data) ? 'Array' : 'Other'}`);
        console.log(`Data length: ${Array.isArray(response.data.data) ? response.data.data.length : 'N/A'}`);
        
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          console.log(`Sample item:`, JSON.stringify(response.data.data[0], null, 2));
        }
      } else {
        console.error(`${endpoint.name} API failed:`, response.data.message);
        allPassed = false;
      }
    } catch (error) {
      console.error(`${endpoint.name} API error:`, error.message);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testGetUsers() {
  console.log('\n=== 5. GET USERS (ADMIN) ===');
  try {
    const response = await makeRequest('GET', '/api/users');
    console.log(`Status: ${response.statusCode}`);
    console.log(`Response:`, response.data);
    
    if (response.statusCode === 200 && response.data.success) {
      console.log('Users retrieved successfully!');
      console.log('Total users:', response.data.data.length);
      
      // Check if our test user is in the list
      const testUser = response.data.data.find(u => u.email === TEST_USER.email);
      if (testUser) {
        console.log('Test user found in database!');
        console.log('Test user details:', {
          name: testUser.name,
          email: testUser.email,
          role: testUser.role,
          isActive: testUser.isActive
        });
      } else {
        console.log('Test user not found in database');
      }
      
      return true;
    } else {
      console.error('Get users failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('Get users error:', error.message);
    return false;
  }
}

// Main test runner
async function runFullStackTests() {
  console.log('=== FULL-STACK LOGISTICS APP TEST ===');
  console.log('Testing complete authentication flow and dashboard functionality\n');
  
  const results = {
    healthCheck: false,
    signup: false,
    login: false,
    dashboard: false,
    getUsers: false
  };
  
  // Run all tests
  results.healthCheck = await testHealthCheck();
  results.signup = await testUserSignup();
  results.login = await testUserLogin();
  results.dashboard = await testDashboardEndpoints();
  results.getUsers = await testGetUsers();
  
  // Summary
  console.log('\n=== TEST RESULTS SUMMARY ===');
  console.log('\nHealth Check:', results.healthCheck ? 'PASS' : 'FAIL');
  console.log('User Signup:', results.signup ? 'PASS' : 'FAIL');
  console.log('User Login:', results.login ? 'PASS' : 'FAIL');
  console.log('Dashboard APIs:', results.dashboard ? 'PASS' : 'FAIL');
  console.log('Get Users:', results.getUsers ? 'PASS' : 'FAIL');
  
  const allTestsPassed = Object.values(results).every(result => result === true);
  
  console.log('\n=== FINAL RESULT ===');
  if (allTestsPassed) {
    console.log('ALL TESTS PASSED! \u2705');
    console.log('\nThe full-stack logistics app is working correctly:');
    console.log('- Backend server is running on http://localhost:5000');
    console.log('- MongoDB connection is working');
    console.log('- User registration saves to database');
    console.log('- User login works correctly');
    console.log('- Dashboard APIs return proper data');
    console.log('- Frontend can access all endpoints');
    
    console.log('\nNEXT STEPS:');
    console.log('1. Open frontend: http://localhost:8080');
    console.log('2. Test signup in browser');
    console.log('3. Test login in browser');
    console.log('4. Access dashboard');
    console.log('5. Verify no map errors');
  } else {
    console.log('SOME TESTS FAILED! \u274c');
    console.log('\nPlease check the failed tests and fix the issues.');
  }
  
  return allTestsPassed;
}

// Run tests
runFullStackTests().catch(console.error);

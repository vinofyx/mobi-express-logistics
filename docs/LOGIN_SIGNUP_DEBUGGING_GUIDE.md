# Login/Signup Issues - Complete Debugging & Fix Guide

## **Current Status Analysis**

### **Servers Running**
- **Frontend**: http://localhost:8080 ✅ (Vite v7.3.2)
- **Backend**: http://localhost:5001 ✅ (Confirmed via netstat)

### **Current Login Component**
```javascript
// File: trackwell-system/src/pages/Login.jsx
const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.login(form);
      alert("Login successful");
      console.log(res);
    } catch (err) {
      alert("Login failed");
      console.error(err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" value={form.email} onChange={handleChange} />
      <input type="password" name="password" value={form.password} onChange={handleChange} />
      <button type="submit">Login</button>
    </form>
  );
};
```

---

## **Potential Issues & Fixes**

### **1. Form Submission Issues**

#### **Problem**: Form not submitting or handleSubmit not called
**Symptoms**:
- Clicking Login button does nothing
- Page refreshes on submit
- No console log messages

**Fixes**:
```javascript
// Ensure form has onSubmit handler
<form onSubmit={handleSubmit} style={styles.form}>

// Ensure button type="submit"
<button type="submit" style={styles.button}>Login</button>

// Prevent default behavior
const handleSubmit = async (e) => {
  e.preventDefault();  // ✅ This is correct
  // ... rest of logic
};
```

### **2. API Endpoint Issues**

#### **Problem**: authService.login() failing
**Current authService**:
```javascript
export const authService = {
  login: async (data) => {
    const response = await API.post("/auth/login", data);
    return response.data;  // ✅ Correct
  }
};
```

**Debug Steps**:
```javascript
// Add debugging to handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Form data:", form);  // Debug form data
  console.log("API call starting...");  // Debug API call
  
  try {
    const res = await authService.login(form);
    console.log("API response:", res);  // Debug response
    alert("Login successful");
  } catch (err) {
    console.error("API error:", err);  // Debug error
    alert("Login failed");
  }
};
```

### **3. Request Payload Issues**

#### **Problem**: Data not being sent correctly
**Expected Request**:
```javascript
// Should send:
POST /api/auth/login
Content-Type: application/json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Debug Network Tab**:
1. **Open Browser Dev Tools**: F12
2. **Go to Network Tab**
3. **Submit Login Form**
4. **Check Request**:
   - **Method**: Should be POST
   - **URL**: http://localhost:5001/api/auth/login
   - **Headers**: Content-Type: application/json
   - **Payload**: Check if email/password are present

### **4. CORS Issues**

#### **Problem**: CORS errors between frontend and backend
**Symptoms**:
- Console shows CORS errors
- Network requests blocked
- No response from backend

**Check Backend CORS**:
```javascript
// Backend should have:
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  credentials: true
}));
```

### **5. Response Handling Issues**

#### **Problem**: Response not processed correctly
**Expected Backend Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id": "...", "name": "...", "email": "...", "role": "..." },
    "token": "jwt-token...",
    "refreshToken": "refresh-token..."
  }
}
```

**Enhanced Login Component**:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const res = await authService.login(form);
    console.log("Full API response:", res);
    
    // Check response structure
    if (res.success) {
      alert("Login successful");
      console.log("User data:", res.data.user);
      console.log("Token:", res.data.token);
      
      // Optional: Save to localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Optional: Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      alert(res.message || "Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert(err.response?.data?.message || "Login failed");
  }
};
```

---

## **Complete Debugging Checklist**

### **Frontend Checklist**
- [ ] Form has onSubmit handler
- [ ] Button has type="submit"
- [ ] preventDefault() is called
- [ ] Form state updates correctly
- [ ] Console shows form data on submit
- [ ] Network tab shows API request
- [ ] Request method is POST
- [ ] Request URL is correct
- [ ] Request headers include Content-Type
- [ ] Request body contains email/password

### **Backend Checklist**
- [ ] Server is running on port 5001
- [ ] CORS allows frontend origin
- [ ] /api/auth/login endpoint exists
- [ ] Endpoint accepts POST requests
- [ ] Endpoint returns JSON response
- [ ] Response includes success field
- [ ] Response includes data field

### **Response Checklist**
- [ ] Response status is 200
- [ ] Response has success: true
- [ ] Response has data object
- [ ] Data contains user object
- [ ] Data contains token
- [ ] Console shows response data
- [ ] No CORS errors in console

---

## **Enhanced Login Component (Production Ready)**

```javascript
import React, { useState } from "react";
import { authService } from "../lib/authService";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Submitting form with data:", form);
      
      const res = await authService.login(form);
      console.log("API response:", res);
      
      if (res.success) {
        alert("Login successful!");
        console.log("User logged in:", res.data.user);
        
        // Save to localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('refreshToken', res.data.refreshToken);
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Login</h2>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          
          <button 
            type="submit" 
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5"
  },
  card: {
    padding: "30px",
    background: "#fff",
    borderRadius: "10px",
    width: "300px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px"
  },
  button: {
    padding: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px"
  },
  error: {
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
    fontSize: "14px"
  }
};

export default Login;
```

---

## **Testing Commands**

### **1. Test API Directly**
```bash
# Test login endpoint
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### **2. Test in Browser**
1. **Open**: http://localhost:8080/login
2. **Open Dev Tools**: F12
3. **Go to Console Tab**
4. **Fill Form**: admin@example.com / admin123
5. **Submit Form**: Click Login button
6. **Check Console**: Look for error messages
7. **Check Network**: Verify API request/response

### **3. Demo Credentials**
```
Admin: admin@example.com / admin123
Agent: agent@example.com / agent123
Customer: customer@example.com / customer123
Staff: staff@example.com / staff123
```

---

## **Common Issues & Solutions**

### **Issue**: "Network Error"
**Solution**: Check backend server is running
```bash
cd d:\MobiExpress\backend
node src/minimal-server.js
```

### **Issue**: "CORS Error"
**Solution**: Backend CORS configuration
```javascript
app.use(cors({
  origin: ['http://localhost:8080'],
  credentials: true
}));
```

### **Issue**: "Invalid Credentials"
**Solution**: Use demo accounts from above

### **Issue**: "Form Not Submitting"
**Solution**: Check onSubmit handler and button type

---

## **Debugging Prompt for AI**

**Use this prompt when asking for help with login/signup issues:**

"My login and signup forms are failing. The login form has email and password fields with a Login button. Please debug and fix the following potential issues:

Form submission — Check if the form has onSubmit or button onClick handlers wired correctly
API endpoint — Verify the fetch/axios call is hitting the correct URL with the right HTTP method (POST)
Request payload — Ensure email and password are being sent in the request body as JSON with Content-Type: application/json
CORS errors — Check browser console for CORS issues between frontend and backend
Auth token handling — Confirm the response token is being saved (localStorage / cookie / state)
Password validation — Make sure password isn't being blocked by client-side validation rules
Error handling — Add try/catch and display the actual error message from the server response

Current setup:
- Frontend: http://localhost:8080 (Vite)
- Backend: http://localhost:5001 (Node.js)
- Login component: React with controlled form
- API service: axios with baseURL http://localhost:5001/api
- Auth endpoint: POST /api/auth/login

Please help me identify why the login/signup is not working and provide specific fixes."
```

---

## **Next Steps**

### **1. Immediate Testing**
1. **Test API directly** with curl command
2. **Test login form** with browser dev tools
3. **Check console** for specific error messages
4. **Verify network requests** in dev tools

### **2. Apply Fixes**
1. **Update login component** with enhanced error handling
2. **Add loading states** for better UX
3. **Implement proper redirects** after login
4. **Add form validation** for better error prevention

### **3. Test Thoroughly**
1. **Test all demo accounts**
2. **Test invalid credentials**
3. **Test empty form submission**
4. **Test network failures**

---

**This comprehensive guide should help you identify and fix any login/signup issues you're experiencing!**

**Last Updated**: April 18, 2026
**Status**: Ready for Debugging

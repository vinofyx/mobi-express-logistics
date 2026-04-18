import React, { useState } from "react";
import { authService } from "../lib/authService";

const SignupEnhanced = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "customer"
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

    // Debug logging
    console.log("=== SIGNUP ATTEMPT ===");
    console.log("Form data:", form);
    console.log("API endpoint: http://localhost:5001/api/auth/signup");

    try {
      const res = await authService.signup(form);
      console.log("API response:", res);
      
      if (res.success) {
        alert("Signup successful!");
        console.log("User registered:", res.data.user);
        console.log("Token received:", res.data.token);
        
        // Save to localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('refreshToken', res.data.refreshToken);
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        console.error("Signup failed:", res.message);
        setError(res.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Sign Up</h2>
        
        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Enter full name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
            required
            disabled={loading}
          />
          
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
            disabled={loading}
          />
          
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
            disabled={loading}
          />
          
          <input
            type="tel"
            name="phone"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
            disabled={loading}
          />
          
          <input
            type="text"
            name="address"
            placeholder="Enter address"
            value={form.address}
            onChange={handleChange}
            style={styles.input}
            disabled={loading}
          />
          
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={styles.input}
            disabled={loading}
          >
            <option value="customer">Customer</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
            <option value="center_operator">Center Operator</option>
          </select>
          
          <button 
            type="submit" 
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        
        <div style={styles.debugInfo}>
          <h4>Debug Info:</h4>
          <p>Frontend: http://localhost:8080</p>
          <p>Backend: http://localhost:5001</p>
          <p>Check browser console for detailed logs</p>
        </div>
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
    background: "#f5f5f5",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    padding: "30px",
    background: "#fff",
    borderRadius: "10px",
    width: "400px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  input: {
    padding: "12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none"
  },
  button: {
    padding: "12px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s"
  },
  error: {
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
    fontSize: "14px",
    border: "1px solid #f5c6cb"
  },
  debugInfo: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#e9ecef",
    borderRadius: "5px",
    fontSize: "12px",
    color: "#6c757d"
  }
};

export default SignupEnhanced;

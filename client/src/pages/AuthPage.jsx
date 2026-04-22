import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../store/slices/authSlice";
import { authAPI } from "../api/auth.api";

const inp = {
  width: "100%", padding: "12px 16px", borderRadius: 10,
  border: "1.5px solid #e5e7eb", background: "#f9fafb",
  fontSize: 14, outline: "none", boxSizing: "border-box",
  fontFamily: "inherit", color: "#111", transition: "border-color .2s",
};

export default function AuthPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [mode, setMode]       = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({ name: "", email: "", password: "", role: "center_staff" });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        const res = await authAPI.login({ email: form.email, password: form.password });
        const { accessToken, user } = res.data;
        dispatch(loginSuccess({ user, token: accessToken }));
        navigate("/dashboard");
      } else {
        if (!form.name || form.password.length < 8) {
          setError("Name is required and password must be at least 8 characters.");
          return;
        }
        await authAPI.register({ name: form.name, email: form.email, password: form.password, role: form.role });
        setMode("login");
        setError("");
        setForm((p) => ({ ...p, name: "" }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: "📦", title: "Parcel Tracking",    desc: "Real-time status for every parcel" },
    { icon: "🚚", title: "Pickup Management",  desc: "Schedule and assign pickups instantly" },
    { icon: "🚢", title: "Shipment Control",   desc: "End-to-end shipment visibility" },
    { icon: "👥", title: "Role-based Access",  desc: "Admin, Staff, Agent permissions" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 72px", background: "linear-gradient(145deg,#0f0c29,#302b63,#24243e)",
        color: "#fff", position: "relative", overflow: "hidden",
      }}>
        {/* glow blobs */}
        <div style={{ position:"absolute", top:-100, left:-100, width:400, height:400, borderRadius:"50%", background:"rgba(99,102,241,.25)", filter:"blur(80px)" }} />
        <div style={{ position:"absolute", bottom:-80, right:-80,  width:320, height:320, borderRadius:"50%", background:"rgba(139,92,246,.2)",  filter:"blur(60px)" }} />

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:56, position:"relative" }}>
          <div style={{ width:46, height:46, borderRadius:14, background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:900, boxShadow:"0 0 20px rgba(99,102,241,.5)" }}>M</div>
          <div>
            <div style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.3px" }}>MobiExpress</div>
            <div style={{ fontSize:11, color:"#94a3b8", marginTop:1 }}>Logistics Platform</div>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize:40, fontWeight:900, lineHeight:1.2, margin:"0 0 16px", position:"relative" }}>
          Logistics<br />
          <span style={{ background:"linear-gradient(135deg,#60a5fa,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Simplified.</span>
        </h1>
        <p style={{ fontSize:15, color:"#94a3b8", lineHeight:1.8, maxWidth:380, margin:"0 0 52px", position:"relative" }}>
          One platform to manage pickups, parcels, shipments and customers with role-based access control.
        </p>

        {/* Feature list */}
        <div style={{ display:"flex", flexDirection:"column", gap:20, position:"relative" }}>
          {features.map((f) => (
            <div key={f.title} style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:"rgba(255,255,255,.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700 }}>{f.title}</div>
                <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div style={{ display:"flex", gap:36, marginTop:56, borderTop:"1px solid rgba(255,255,255,.1)", paddingTop:32, position:"relative" }}>
          {[["500+","Deliveries/day"],["99.9%","Uptime"],["5 Roles","Access control"]].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontSize:22, fontWeight:800, color:"#60a5fa" }}>{v}</div>
              <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
      <div style={{ width:500, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 48px", background:"#f8fafc" }}>
        <div style={{ width:"100%", background:"#fff", borderRadius:24, padding:"44px 44px 40px", boxShadow:"0 8px 40px rgba(0,0,0,.10)" }}>

          {/* Tab switcher */}
          <div style={{ display:"flex", background:"#f1f5f9", borderRadius:12, padding:4, marginBottom:36 }}>
            {[["login","Sign In"],["register","Sign Up"]].map(([t,l]) => (
              <button key={t} onClick={() => switchTab(t)} style={{
                flex:1, padding:"10px 0", border:"none", borderRadius:9,
                fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                background: tab===t ? "#fff"      : "transparent",
                color:      tab===t ? "#111"      : "#64748b",
                boxShadow:  tab===t ? "0 1px 6px rgba(0,0,0,.12)" : "none",
                transition: "all .2s",
              }}>{l}</button>
            ))}
          </div>

          {/* Heading */}
          <h2 style={{ fontSize:24, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>
            {tab === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ fontSize:13, color:"#64748b", margin:"0 0 28px" }}>
            {tab === "login" ? "Sign in to access your dashboard" : "Register a new staff or agent account"}
          </p>

          {/* Error / Success banners */}
          {error && (
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#b91c1c", display:"flex", alignItems:"center", gap:8 }}>
              <span>⚠</span> {error}
            </div>
          )}
          {success && (
            <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#166534", display:"flex", alignItems:"center", gap:8 }}>
              <span>✓</span> {success}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:7 }}>Email Address</label>
                <input style={inp} type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} autoComplete="email" required />
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:7 }}>Password</label>
                <input style={inp} type="password" placeholder="Enter your password" value={form.password} onChange={set("password")} autoComplete="current-password" required />
              </div>
              <button type="submit" disabled={loading} style={{
                marginTop:8, padding:"14px", border:"none", borderRadius:12,
                background: loading ? "#c7d2fe" : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                color:"#fff", fontWeight:700, fontSize:15, cursor: loading ? "not-allowed" : "pointer",
                boxShadow:"0 4px 16px rgba(79,70,229,.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontFamily:"inherit", transition:"opacity .2s",
              }}>
                {loading ? (
                  <><span style={{ width:16, height:16, border:"2.5px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }} /> Signing in…</>
                ) : "Sign In →"}
              </button>
              <p style={{ textAlign:"center", fontSize:13, color:"#64748b", margin:0 }}>
                Don't have an account?{" "}
                <button type="button" onClick={() => switchTab("register")} style={{ background:"none", border:"none", color:"#4f46e5", fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:7 }}>Full Name</label>
                <input style={inp} type="text" placeholder="John Doe" value={form.name} onChange={set("name")} required />
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:7 }}>Email Address</label>
                <input style={inp} type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} required />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:7 }}>Password</label>
                  <input style={inp} type="password" placeholder="Min 8 chars" value={form.password} onChange={set("password")} required />
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:7 }}>Confirm</label>
                  <input style={inp} type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set("confirmPassword")} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:7 }}>Role</label>
                <select style={{ ...inp, cursor:"pointer" }} value={form.role} onChange={set("role")}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading} style={{
                marginTop:6, padding:"14px", border:"none", borderRadius:12,
                background: loading ? "#c7d2fe" : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                color:"#fff", fontWeight:700, fontSize:15, cursor: loading ? "not-allowed" : "pointer",
                boxShadow:"0 4px 16px rgba(79,70,229,.35)", display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontFamily:"inherit",
              }}>
                {loading ? (
                  <><span style={{ width:16, height:16, border:"2.5px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }} /> Creating…</>
                ) : "Create Account →"}
              </button>
              <p style={{ textAlign:"center", fontSize:13, color:"#64748b", margin:0 }}>
                Already have an account?{" "}
                <button type="button" onClick={() => switchTab("login")} style={{ background:"none", border:"none", color:"#4f46e5", fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box;}`}</style>
    </div>
  );
}

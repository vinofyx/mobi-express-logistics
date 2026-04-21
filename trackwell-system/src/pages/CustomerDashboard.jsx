import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Truck, MapPin, TrendingUp, TrendingDown, Plus } from "lucide-react";

const mockData = {
  parcels: [
    { trackingId: "PKG001", status: "in_transit",  destination: "New York, NY",     weight: "2.5 kg" },
    { trackingId: "PKG002", status: "delivered",   destination: "Los Angeles, CA",  weight: "1.8 kg" },
  ],
  shipments: [
    { shipmentId: "SHP001", status: "processing", origin: "Chicago, IL",   destination: "Miami, FL"  },
    { shipmentId: "SHP002", status: "shipped",    origin: "Seattle, WA",   destination: "Boston, MA" },
  ],
  pickups: [
    { pickupId: "PU001", status: "scheduled",  address: "123 Main St",  date: "2024-01-15" },
    { pickupId: "PU002", status: "completed",  address: "456 Oak Ave",  date: "2024-01-14" },
  ],
};

const statusConfig = {
  in_transit:  { bg: "#dbeafe", color: "#1d4ed8", label: "In Transit" },
  delivered:   { bg: "#dcfce7", color: "#15803d", label: "Delivered"  },
  processing:  { bg: "#fef9c3", color: "#a16207", label: "Processing" },
  shipped:     { bg: "#e0e7ff", color: "#4338ca", label: "Shipped"    },
  scheduled:   { bg: "#f0fdf4", color: "#166534", label: "Scheduled"  },
  completed:   { bg: "#dcfce7", color: "#15803d", label: "Completed"  },
  pending:     { bg: "#fff7ed", color: "#c2410c", label: "Pending"    },
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const user = { name: "User" }; // Mock user for now

  const f = { fontFamily: "Inter, system-ui, sans-serif" };

  const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || { bg: "#f1f5f9", color: "#64748b", label: status };
    return (
      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
        {cfg.label}
      </span>
    );
  };

  const statCards = [
    { title: "Total Parcels",      value: mockData.parcels.length,   icon: Package, gradient: "linear-gradient(135deg,#3b82f6,#6366f1)", trend: "+12%", up: true  },
    { title: "Active Shipments",   value: mockData.shipments.length, icon: Truck,   gradient: "linear-gradient(135deg,#8b5cf6,#a855f7)", trend: "+8%",  up: true  },
    { title: "Scheduled Pickups",  value: mockData.pickups.length,   icon: MapPin,  gradient: "linear-gradient(135deg,#10b981,#14b8a6)", trend: "-3%",  up: false },
  ];

  return (
    <div style={{ ...f, background: "#f8fafc", minHeight: "100vh", padding: 24 }}>
      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#1e1b4b 100%)",
        borderRadius: 20, padding: "32px 36px", marginBottom: 24, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 6px", fontWeight: 500 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>
              {greeting()}, <span style={{ background: "linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user?.name || "User"}</span>! 
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
              Here's your BobbaExpress logistics overview. Track shipments and manage deliveries efficiently.
            </p>
          </div>
          <button onClick={() => navigate("/pickups")}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.4)", whiteSpace: "nowrap" }}>
            <Plus size={16} /> New Pickup
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: s.gradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={22} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 4px", fontWeight: 500 }}>{s.title}</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>{s.value}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {s.up ? <TrendingUp size={13} color="#22c55e" /> : <TrendingDown size={13} color="#ef4444" />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.up ? "#22c55e" : "#ef4444" }}>{s.trend}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Message */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", textAlign: "center" }}>
        <h2 style={{ color: "#15803d", marginBottom: 16 }}>Customer Dashboard Working! </h2>
        <p style={{ color: "#64748b", marginBottom: 16 }}>
          This is a simplified version without Redux dependency. The full dashboard with Redux integration will be available once the Redux context issue is resolved.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <button onClick={() => navigate("/")} style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Go Home
          </button>
          <button onClick={() => navigate("/dashboard")} style={{ padding: "8px 16px", background: "#6b7280", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

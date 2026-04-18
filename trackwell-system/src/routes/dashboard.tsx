import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, type AppRole } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard")({
  component: DashboardGate,
});

// Role -> default landing route
const ROLE_HOME: Record<AppRole, string> = {
  admin: "/dashboard/admin",
  center_operator: "/dashboard/center",
  agent: "/dashboard/agent",
  customer: "/dashboard/customer",
};

function pickHome(roles: AppRole[]): string {
  if (roles.includes("admin")) return ROLE_HOME.admin;
  if (roles.includes("center_operator")) return ROLE_HOME.center_operator;
  if (roles.includes("agent")) return ROLE_HOME.agent;
  return ROLE_HOME.customer;
}

function DashboardGate() {
  const { user, loading, getRoles } = useAuth();
  const navigate = useNavigate();
  const roles = getRoles();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    // Only redirect when at exact /dashboard
    if (window.location.pathname === "/dashboard") {
      navigate({ to: pickHome(roles) });
    }
  }, [user, loading, roles, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return <Outlet />;
}

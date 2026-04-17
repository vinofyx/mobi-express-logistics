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
  const { user, loading, roles } = useAuth();
  const navigate = useNavigate();

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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return <Outlet />;
}

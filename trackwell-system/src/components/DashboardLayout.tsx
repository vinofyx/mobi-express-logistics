import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  Plus,
  Truck,
  Building2,
  Users,
  ShieldCheck,
  LogOut,
  ClipboardList,
  Warehouse,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS } from "@/lib/shipment-utils";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export function DashboardLayout({
  children,
  title,
  nav,
  roleLabel,
}: {
  children: ReactNode;
  title: string;
  nav: NavItem[];
  roleLabel: string;
}) {
  const { user, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="border-b p-4">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <div className="mb-3 rounded-md bg-sidebar-accent px-3 py-2 text-xs">
            <p className="font-semibold">{user?.email}</p>
            <p className="mt-0.5 text-muted-foreground">{roleLabel}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex w-full flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
          <Logo />
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b bg-background px-2 py-2 md:hidden">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <header className="border-b bg-background px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-xs text-muted-foreground md:hidden">
            {roles.map((r) => ROLE_LABELS[r]).join(" · ")}
          </p>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export const ICONS = {
  LayoutDashboard,
  Package,
  Plus,
  Truck,
  Building2,
  Users,
  ShieldCheck,
  ClipboardList,
  Warehouse,
};

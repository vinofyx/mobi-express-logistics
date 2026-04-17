import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Truck, Package, MapPin, Globe2, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { TrackingWidget } from "@/components/TrackingWidget";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mobi Express — Reliable end-to-end logistics" },
      {
        name: "description",
        content:
          "Book pickups, transfer through hubs, and deliver anywhere. Track every package live with Mobi Express logistics.",
      },
      { property: "og:title", content: "Mobi Express — Reliable end-to-end logistics" },
      {
        property: "og:description",
        content: "Book pickups, transfer through hubs, deliver anywhere. Live tracking included.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tracking, setTracking] = useState("");

  const handleTrack = (e: FormEvent) => {
    e.preventDefault();
    const t = tracking.trim();
    if (!t) return;
    navigate({ to: "/track/$trackingNumber", params: { trackingNumber: t } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Services
            </a>
            <a href="#how" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              How it works
            </a>
            <a href="#track" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Track
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Trusted nationwide
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Logistics that move at the speed of your business.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">
              Book pickups in seconds. Watch every step from your door to the recipient — across hubs and
              cities, in real time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/pickup/new">
                  Book a pickup <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <a href="#track">Track a shipment</a>
              </Button>
            </div>
          </div>

          {/* Track card */}
          <div id="track" className="flex items-center">
            <TrackingWidget />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Built for every shipment</h2>
          <p className="mt-3 text-muted-foreground">
            From a single document to bulk parcels, Mobi Express moves it through our hub network.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Package,
              title: "Door-to-door delivery",
              desc: "We pick up at your address and deliver to the recipient anywhere across our network.",
            },
            {
              icon: Truck,
              title: "Hub transfers",
              desc: "Packages route through origin and destination hubs for faster, predictable delivery times.",
            },
            {
              icon: MapPin,
              title: "Live tracking",
              desc: "Customers and recipients track every status change with a public tracking page.",
            },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">From request to delivery in a few clear steps.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { n: "1", t: "Request pickup", d: "Tell us where to collect and where to deliver." },
              { n: "2", t: "Field agent collects", d: "Our agent picks up and drops at the origin hub." },
              { n: "3", t: "Hub transfer", d: "We route the package to the destination hub." },
              { n: "4", t: "Delivered", d: "Out for delivery and signed for at the recipient's door." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border bg-card p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div
          className="rounded-2xl px-8 py-12 text-center text-primary-foreground md:px-16 md:py-16"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}
        >
          <h2 className="text-3xl font-bold md:text-4xl">Ready to ship smarter?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Create a free account and book your first pickup in under a minute.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/signup">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link to="/login">I have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Mobi Express Logistics</p>
        </div>
      </footer>
    </div>
  );
}


# Mobi Express Logistics — Full MVP Plan

A multi-role logistics platform with hub-transfer workflow, public tracking, and four role-specific dashboards.

## Tech Stack (adapted for Lovable)
- **Frontend**: React + Tailwind + shadcn/ui (TanStack Router)
- **Backend**: Lovable Cloud (Postgres, serverless functions, JWT auth) — replaces Node/Express + MongoDB
- **Auth**: Email/password with role-based access via a separate `user_roles` table

## Roles & Permissions
- **Admin** — manages users, agents, centers, routes; full visibility
- **Customer** — books pickups, views own shipments, tracks status
- **Field Agent** — sees assigned pickups, marks collected, drops at center
- **Center Operator** — receives at center, dispatches to destination center, marks delivered

## Data Model
- `profiles` (name, phone, address)
- `user_roles` (user_id, role: admin/customer/agent/center_operator)
- `centers` (name, city, address) — origin/destination hubs
- `agents` (user_id, assigned_center_id)
- `shipments` (tracking_number, customer_id, pickup_address, destination_address, origin_center_id, destination_center_id, weight, package_type, status, assigned_agent_id)
- `shipment_events` (shipment_id, status, location, notes, created_by, created_at) — timeline for tracking

**Shipment statuses**: `pending_pickup → picked_up → at_origin_center → in_transit → at_destination_center → out_for_delivery → delivered` (plus `cancelled`, `failed_delivery`)

## Pages & Flows

### Public
- **Landing page** — hero, services, "Track shipment" input, CTA to sign up
- **Public tracking page** (`/track/$trackingNumber`) — timeline of shipment events, no login required
- **Login / Signup** (customers self-register; staff accounts created by admin)

### Customer dashboard (`/customer`)
- Overview: active shipments, recent activity
- **Request Pickup** form: pickup address, destination address + city, package details
- **My Shipments** list with live status + tracking number
- Shipment detail page with full timeline

### Field Agent dashboard (`/agent`)
- **Assigned pickups** queue (today's list)
- Action: mark "Picked up" with optional notes → status becomes `picked_up`
- Action: mark "Dropped at center" → status becomes `at_origin_center`
- History of completed pickups

### Center Operator dashboard (`/center`)
- **Inbound** tab — packages arriving at this center (mark received)
- **Dispatch** tab — packages to forward to destination center (mark in-transit)
- **Out for delivery** tab — assign to delivery agent, mark delivered/failed
- Center inventory snapshot

### Admin dashboard (`/admin`)
- KPI cards: total shipments, in-transit, delivered today, active agents
- **Users** — list + assign roles, create staff accounts
- **Centers** — CRUD for hubs
- **Agents** — assign agents to centers
- **Shipments** — full table with filters (status, center, date), manual reassignment
- **Pickup queue** — assign unassigned pickups to field agents

## Key Behaviors
- New pickup request auto-generates tracking number and `pending_pickup` event
- Each status change writes to `shipment_events` (powers the public timeline)
- Role guards on every dashboard route via TanStack Router `beforeLoad` + `_authenticated` layout
- RLS policies: customers see only their shipments; agents see only assigned; center operators see only their center's shipments; admins see all

## Design
- Clean, professional logistics aesthetic — blue/white primary palette with accent for status badges
- Color-coded status badges across all views
- Mobile-friendly (field agents will use phones)
- Responsive sidebar navigation per role

## Build Order
1. Auth + roles infrastructure + landing page
2. Customer flow (signup, request pickup, my shipments, public tracking)
3. Admin dashboard (users, centers, agents, shipment overview)
4. Field agent dashboard
5. Center operator dashboard
6. Polish, status timeline component, seed demo data

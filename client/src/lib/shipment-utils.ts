import type { Database } from "@/integrations/supabase/types";

// Backend shipment statuses
export type ShipmentStatus = 
  | "Created"
  | "Dispatched" 
  | "In Transit"
  | "Received"
  // Legacy statuses for compatibility
  | "pending_pickup"
  | "picked_up"
  | "at_origin_center"
  | "in_transit"
  | "at_destination_center"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "failed_delivery";

export type PackageType = Database["public"]["Enums"]["package_type"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  // New backend statuses
  Created: "Created",
  Dispatched: "Dispatched",
  "In Transit": "In Transit",
  Received: "Received",
  
  // Legacy statuses for compatibility
  pending_pickup: "Pending Pickup",
  picked_up: "Picked Up",
  at_origin_center: "At Origin Center",
  in_transit: "In Transit",
  at_destination_center: "At Destination Center",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed_delivery: "Failed Delivery",
};

export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  // New backend statuses
  Created: "bg-warning/15 text-warning-foreground border-warning/30",
  Dispatched: "bg-info/15 text-info border-info/30",
  "In Transit": "bg-primary/15 text-primary border-primary/30",
  Received: "bg-success/15 text-success border-success/30",
  
  // Legacy statuses for compatibility
  pending_pickup: "bg-warning/15 text-warning-foreground border-warning/30",
  picked_up: "bg-info/15 text-info border-info/30",
  at_origin_center: "bg-info/15 text-info border-info/30",
  in_transit: "bg-primary/15 text-primary border-primary/30",
  at_destination_center: "bg-info/15 text-info border-info/30",
  out_for_delivery: "bg-primary/20 text-primary border-primary/40",
  delivered: "bg-success/15 text-success border-success/30",
  cancelled: "bg-muted text-muted-foreground border-border",
  failed_delivery: "bg-destructive/15 text-destructive border-destructive/30",
};

export const STATUS_ORDER: ShipmentStatus[] = [
  // New backend statuses
  "Created",
  "Dispatched",
  "In Transit",
  "Received",
  
  // Legacy statuses for compatibility
  "pending_pickup",
  "picked_up",
  "at_origin_center",
  "in_transit",
  "at_destination_center",
  "out_for_delivery",
  "delivered",
];

export const PACKAGE_TYPE_LABELS: Record<PackageType, string> = {
  document: "Document",
  parcel: "Parcel",
  fragile: "Fragile",
  heavy: "Heavy",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  customer: "Customer",
  agent: "Field Agent",
  center_operator: "Center Operator",
};

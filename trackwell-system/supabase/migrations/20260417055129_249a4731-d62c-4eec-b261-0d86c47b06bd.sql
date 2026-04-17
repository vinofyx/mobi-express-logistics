-- ============= ENUMS =============
CREATE TYPE public.app_role AS ENUM ('admin', 'customer', 'agent', 'center_operator');

CREATE TYPE public.shipment_status AS ENUM (
  'pending_pickup',
  'picked_up',
  'at_origin_center',
  'in_transit',
  'at_destination_center',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'failed_delivery'
);

CREATE TYPE public.package_type AS ENUM ('document', 'parcel', 'fragile', 'heavy');

-- ============= UTIL FUNCTIONS =============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============= PROFILES =============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= USER ROLES =============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============= CENTERS =============
CREATE TABLE public.centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_centers_updated_at
  BEFORE UPDATE ON public.centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= AGENTS =============
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_center_id UUID REFERENCES public.centers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: get an agent's center
CREATE OR REPLACE FUNCTION public.get_agent_center(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT assigned_center_id FROM public.agents WHERE user_id = _user_id LIMIT 1
$$;

-- ============= SHIPMENTS =============
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  origin_center_id UUID REFERENCES public.centers(id) ON DELETE SET NULL,
  destination_center_id UUID REFERENCES public.centers(id) ON DELETE SET NULL,
  weight_kg NUMERIC(10,2) NOT NULL DEFAULT 1,
  package_type public.package_type NOT NULL DEFAULT 'parcel',
  description TEXT,
  status public.shipment_status NOT NULL DEFAULT 'pending_pickup',
  assigned_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_shipments_customer ON public.shipments(customer_id);
CREATE INDEX idx_shipments_agent ON public.shipments(assigned_agent_id);
CREATE INDEX idx_shipments_status ON public.shipments(status);
CREATE INDEX idx_shipments_origin_center ON public.shipments(origin_center_id);
CREATE INDEX idx_shipments_dest_center ON public.shipments(destination_center_id);

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= SHIPMENT EVENTS =============
CREATE TABLE public.shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status public.shipment_status NOT NULL,
  location TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_shipment_events_shipment ON public.shipment_events(shipment_id);
CREATE INDEX idx_shipment_events_created ON public.shipment_events(created_at DESC);

-- ============= AUTO TRACKING NUMBER + INITIAL EVENT =============
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  candidate TEXT;
  exists_count INT;
BEGIN
  LOOP
    candidate := 'MOBI-' || upper(substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 8));
    SELECT count(*) INTO exists_count FROM public.shipments WHERE tracking_number = candidate;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_shipment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := public.generate_tracking_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_tracking_number
  BEFORE INSERT ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_shipment();

CREATE OR REPLACE FUNCTION public.create_initial_shipment_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.shipment_events (shipment_id, status, location, notes, created_by)
  VALUES (
    NEW.id,
    NEW.status,
    NEW.pickup_city,
    'Pickup request created',
    NEW.customer_id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_shipment_created
  AFTER INSERT ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.create_initial_shipment_event();

-- Auto-create event whenever shipment status changes
CREATE OR REPLACE FUNCTION public.log_shipment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.shipment_events (shipment_id, status, created_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_shipment_status_changed
  AFTER UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.log_shipment_status_change();

-- ============= NEW USER HANDLER =============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============= RLS POLICIES =============

-- profiles
CREATE POLICY "Authenticated can view profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- centers
CREATE POLICY "Authenticated can view centers"
  ON public.centers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage centers - insert"
  ON public.centers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage centers - update"
  ON public.centers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage centers - delete"
  ON public.centers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- agents
CREATE POLICY "Agents see own + staff see all"
  ON public.agents FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'center_operator')
  );

CREATE POLICY "Admins insert agents"
  ON public.agents FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update agents"
  ON public.agents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete agents"
  ON public.agents FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- shipments
CREATE POLICY "Customers see own shipments"
  ON public.shipments FOR SELECT TO authenticated
  USING (
    auth.uid() = customer_id
    OR auth.uid() = assigned_agent_id
    OR public.has_role(auth.uid(), 'admin')
    OR (
      public.has_role(auth.uid(), 'center_operator')
      AND (
        origin_center_id = public.get_agent_center(auth.uid())
        OR destination_center_id = public.get_agent_center(auth.uid())
      )
    )
  );

CREATE POLICY "Customers create their shipments"
  ON public.shipments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff update shipments"
  ON public.shipments FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR auth.uid() = assigned_agent_id
    OR public.has_role(auth.uid(), 'center_operator')
  );

CREATE POLICY "Admins delete shipments"
  ON public.shipments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- shipment_events: PUBLIC READABLE (for public tracking by tracking number)
CREATE POLICY "Anyone can view shipment events"
  ON public.shipment_events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert events"
  ON public.shipment_events FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'agent')
    OR public.has_role(auth.uid(), 'center_operator')
    OR EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.id = shipment_id AND s.customer_id = auth.uid()
    )
  );
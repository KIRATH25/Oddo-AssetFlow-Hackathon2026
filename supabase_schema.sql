-- ========================================================================
-- ASSETFLOW DATABASE SCHEMA SCHEMA MIGRATION
-- Copy and paste this into the Supabase SQL Editor (https://supabase.com)
-- to initialize the database tables, policies, and triggers.
-- ========================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Employee',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'Employee')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to categories" ON public.categories;
CREATE POLICY "Allow read access to categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write access to categories" ON public.categories;
CREATE POLICY "Allow write access to categories" ON public.categories FOR ALL USING (true);


-- 3. Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  asset_tag TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('Available', 'Allocated', 'Maintenance', 'Disposed')) DEFAULT 'Available',
  serial_number TEXT,
  location TEXT,
  purchase_date DATE,
  cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Assets
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to assets" ON public.assets;
CREATE POLICY "Allow read access to assets" ON public.assets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write access to assets" ON public.assets;
CREATE POLICY "Allow write access to assets" ON public.assets FOR ALL USING (true);


-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to bookings" ON public.bookings;
CREATE POLICY "Allow read access to bookings" ON public.bookings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write access to bookings" ON public.bookings;
CREATE POLICY "Allow write access to bookings" ON public.bookings FOR ALL USING (true);


-- 5. Maintenance Requests Table
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  issue TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'assigned', 'inProgress', 'resolved')) DEFAULT 'pending',
  cost NUMERIC,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on Maintenance
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to maintenance_requests" ON public.maintenance_requests;
CREATE POLICY "Allow read access to maintenance_requests" ON public.maintenance_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write access to maintenance_requests" ON public.maintenance_requests;
CREATE POLICY "Allow write access to maintenance_requests" ON public.maintenance_requests FOR ALL USING (true);


-- 6. Allocations Table
CREATE TABLE IF NOT EXISTS public.allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'returned')) DEFAULT 'active',
  allocated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expected_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Allocations
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to allocations" ON public.allocations;
CREATE POLICY "Allow read access to allocations" ON public.allocations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write access to allocations" ON public.allocations;
CREATE POLICY "Allow write access to allocations" ON public.allocations FOR ALL USING (true);


-- 7. Transfer Requests Table
CREATE TABLE IF NOT EXISTS public.transfer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('requested', 'approved', 'rejected')) DEFAULT 'requested',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Transfer Requests
ALTER TABLE public.transfer_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to transfer_requests" ON public.transfer_requests;
CREATE POLICY "Allow read access to transfer_requests" ON public.transfer_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write access to transfer_requests" ON public.transfer_requests;
CREATE POLICY "Allow write access to transfer_requests" ON public.transfer_requests FOR ALL USING (true);


-- 8. Audit Cycles Table
CREATE TABLE IF NOT EXISTS public.audit_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Audits
ALTER TABLE public.audit_cycles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to audit_cycles" ON public.audit_cycles;
CREATE POLICY "Allow read access to audit_cycles" ON public.audit_cycles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write access to audit_cycles" ON public.audit_cycles;
CREATE POLICY "Allow write access to audit_cycles" ON public.audit_cycles FOR ALL USING (true);


-- 9. Activity Log Table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_name TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('allocation', 'booking', 'maintenance', 'transfer')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Activity Log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to activity_log" ON public.activity_log;
CREATE POLICY "Allow read access to activity_log" ON public.activity_log FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write access to activity_log" ON public.activity_log;
CREATE POLICY "Allow write access to activity_log" ON public.activity_log FOR ALL USING (true);

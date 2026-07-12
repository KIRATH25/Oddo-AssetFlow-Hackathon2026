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
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'Employee'),
    new.email
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
  asset_tag TEXT UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed')) DEFAULT 'Available',
  serial_number TEXT,
  location TEXT,
  purchase_date DATE,
  cost NUMERIC,
  description TEXT,
  photo_url TEXT,
  is_bookable BOOLEAN DEFAULT false,
  condition TEXT CHECK (condition IN ('New', 'Good', 'Fair', 'Poor')) DEFAULT 'Good',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  custom_fields JSONB DEFAULT '[]'::jsonb,
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
  title TEXT,
  is_all_day BOOLEAN DEFAULT false,
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


-- 10. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  head_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Departments (only Admin can write, anyone logged in can read)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to departments" ON public.departments;
CREATE POLICY "Allow public read access to departments" ON public.departments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to departments" ON public.departments;
CREATE POLICY "Allow admin write access to departments" ON public.departments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
  )
);

-- 11. Profile Columns Extension
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 12. Categories Columns Extension
ALTER TABLE public.categories 
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('Asset Category', 'CSR Activity', 'Challenge')) DEFAULT 'Asset Category';


-- 13. Asset Tag Sequence and Trigger (for AF-0001 format auto generation)
CREATE SEQUENCE IF NOT EXISTS public.asset_tag_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.generate_asset_tag()
RETURNS trigger AS $$
BEGIN
  IF NEW.asset_tag IS NULL OR NEW.asset_tag = '' THEN
    NEW.asset_tag := 'AF-' || LPAD(nextval('public.asset_tag_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_asset_created
  BEFORE INSERT ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.generate_asset_tag();

-- 14. Enable btree_gist extension for UUID mapping in EXCLUDE constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 15. Exclusion constraint on bookings to prevent overlapping slots on active assets
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_overlap_exclusion;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_overlap_exclusion 
  EXCLUDE USING gist (
    asset_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status IN ('upcoming', 'ongoing'));



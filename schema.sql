-- SheRoam Supabase Database Schema

-- Disable strict text forcing temporarily
SET default_transaction_read_only = off;

-- 1. Create USERS table extending Supabase's built in auth.users
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  initials TEXT,
  trip_dates TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. Create POSTS table
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  cat_label TEXT NOT NULL,
  color TEXT DEFAULT '#7C3AED',
  verified BOOLEAN DEFAULT false,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  bookmarks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: In a true prod app, likes should be its own junction table to track individual user likes. 
-- For our prototype integration, we will leave it as an integer matching the mock API logic. 

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can update their posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
-- Allow updating likes (naive implementation for prototype)
CREATE POLICY "Anyone can update likes" ON public.posts FOR UPDATE USING (true);

-- 3. Create MESSAGES table for real-time chat
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 4. Create trigger to update users table updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Function to handle new user signups automagically pushing to our users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, initials, city, trip_dates)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New Voyager'),
    COALESCE(NEW.raw_user_meta_data->>'initials', 'NV'),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Global'),
    COALESCE(NEW.raw_user_meta_data->>'tripDates', 'Soon')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- New Schema Additions for Production Features

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_lat FLOAT8;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_lng FLOAT8;

-- 5. Create EMERGENCY_LOGS table for S.O.S Tracking
CREATE TABLE public.emergency_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  latitude FLOAT8,
  longitude FLOAT8,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'safely_resolved', 'escalated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emergency_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view emergency_logs" ON public.emergency_logs FOR SELECT USING (true);
CREATE POLICY "Auth users can insert emergency_logs" ON public.emergency_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own emergency logs" ON public.emergency_logs FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_emergency_modtime
BEFORE UPDATE ON public.emergency_logs FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 6. Create LOCATIONS table for Map Database
CREATE TABLE public.locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('safe_zone', 'danger_zone', 'moderate_zone', 'shestay', 'sheguide')),
  label TEXT NOT NULL,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  score INT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view locations" ON public.locations FOR SELECT USING (true);


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

-- 7. Create VERIFICATION_REQUESTS table for video-based identity verification
CREATE TABLE public.verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
-- Users can view their own verification requests
CREATE POLICY "Users can view own verification requests"
  ON public.verification_requests FOR SELECT USING (auth.uid() = user_id);
-- Users can insert their own verification requests
CREATE POLICY "Users can submit verification requests"
  ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Broad select for admin panel (all authenticated users can read all — admin password protects the UI)
CREATE POLICY "Admin can view all verification requests"
  ON public.verification_requests FOR SELECT USING (auth.role() = 'authenticated');
-- Broad update for admin actions (approve/reject)
CREATE POLICY "Admin can update verification requests"
  ON public.verification_requests FOR UPDATE USING (auth.role() = 'authenticated');

-- 8. Create SAFE_SCORES table for crowd-sourced safety ratings
CREATE TABLE public.safe_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  place_name TEXT NOT NULL,
  score INT NOT NULL CHECK (score >= 0 AND score <= 10),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.safe_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view safe_scores" ON public.safe_scores FOR SELECT USING (true);
CREATE POLICY "Auth users can insert safe_scores" ON public.safe_scores FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. Create INCIDENTS table for incident tracking
CREATE TABLE public.incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  location_name TEXT NOT NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('harassment', 'theft', 'stalking', 'assault', 'unsafe_area', 'other')),
  description TEXT,
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Auth users can report incidents" ON public.incidents FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════
-- 10. SEED DATA: Indian Locations
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.locations (type, label, latitude, longitude, score, metadata) VALUES
  ('safe_zone', 'Connaught Place, Delhi', 28.6315, 77.2167, 78, '{"city":"Delhi","state":"Delhi"}'),
  ('safe_zone', 'Khan Market, Delhi', 28.6005, 77.2270, 85, '{"city":"Delhi","state":"Delhi"}'),
  ('moderate_zone', 'Chandni Chowk, Delhi', 28.6506, 77.2303, 55, '{"city":"Delhi","state":"Delhi"}'),
  ('danger_zone', 'Isolated Areas - Yamuna Bank', 28.6225, 77.2928, 30, '{"city":"Delhi","state":"Delhi"}'),
  ('safe_zone', 'India Gate, Delhi', 28.6129, 77.2295, 88, '{"city":"Delhi","state":"Delhi"}'),
  ('shestay', 'SheStay - Safe Haven Delhi', 28.6350, 77.2200, 92, '{"city":"Delhi","type":"hostel"}'),
  ('sheguide', 'Priya M. - Delhi Guide', 28.6280, 77.2190, NULL, '{"city":"Delhi","lang":"HI/EN"}'),
  ('safe_zone', 'Marine Drive, Mumbai', 18.9442, 72.8234, 90, '{"city":"Mumbai","state":"Maharashtra"}'),
  ('safe_zone', 'Bandra Bandstand, Mumbai', 19.0500, 72.8200, 82, '{"city":"Mumbai","state":"Maharashtra"}'),
  ('moderate_zone', 'Dharavi, Mumbai', 19.0437, 72.8547, 45, '{"city":"Mumbai","state":"Maharashtra"}'),
  ('safe_zone', 'Gateway of India, Mumbai', 18.9220, 72.8347, 87, '{"city":"Mumbai","state":"Maharashtra"}'),
  ('shestay', 'SheStay - Mumbai Central', 18.9700, 72.8200, 91, '{"city":"Mumbai","type":"hostel"}'),
  ('safe_zone', 'MG Road, Bangalore', 12.9758, 77.6045, 80, '{"city":"Bangalore","state":"Karnataka"}'),
  ('safe_zone', 'Indiranagar, Bangalore', 12.9784, 77.6408, 83, '{"city":"Bangalore","state":"Karnataka"}'),
  ('moderate_zone', 'Majestic Area, Bangalore', 12.9767, 77.5713, 52, '{"city":"Bangalore","state":"Karnataka"}'),
  ('sheguide', 'Ananya R. - Bangalore Guide', 12.9750, 77.6100, NULL, '{"city":"Bangalore","lang":"KN/EN"}'),
  ('safe_zone', 'Park Street, Kolkata', 22.5515, 88.3527, 76, '{"city":"Kolkata","state":"West Bengal"}'),
  ('safe_zone', 'Victoria Memorial, Kolkata', 22.5448, 88.3426, 85, '{"city":"Kolkata","state":"West Bengal"}'),
  ('moderate_zone', 'Sealdah Station Area, Kolkata', 22.5653, 88.3703, 48, '{"city":"Kolkata","state":"West Bengal"}'),
  ('safe_zone', 'Marina Beach, Chennai', 13.0499, 80.2824, 75, '{"city":"Chennai","state":"Tamil Nadu"}'),
  ('safe_zone', 'T Nagar, Chennai', 13.0418, 80.2341, 78, '{"city":"Chennai","state":"Tamil Nadu"}'),
  ('safe_zone', 'Hitech City, Hyderabad', 17.4435, 78.3772, 82, '{"city":"Hyderabad","state":"Telangana"}'),
  ('safe_zone', 'Charminar, Hyderabad', 17.3616, 78.4747, 70, '{"city":"Hyderabad","state":"Telangana"}'),
  ('safe_zone', 'Koregaon Park, Pune', 18.5362, 73.8939, 80, '{"city":"Pune","state":"Maharashtra"}'),
  ('safe_zone', 'FC Road, Pune', 18.5270, 73.8407, 77, '{"city":"Pune","state":"Maharashtra"}'),
  ('safe_zone', 'Sector 17, Chandigarh', 30.7412, 76.7844, 85, '{"city":"Chandigarh","state":"Chandigarh"}'),
  ('safe_zone', 'Sukhna Lake, Chandigarh', 30.7421, 76.8186, 88, '{"city":"Chandigarh","state":"Chandigarh"}'),
  ('safe_zone', 'Rock Garden, Chandigarh', 30.7525, 76.8100, 86, '{"city":"Chandigarh","state":"Chandigarh"}'),
  ('safe_zone', 'Mall Road, Shimla', 31.1048, 77.1734, 82, '{"city":"Shimla","state":"Himachal Pradesh"}'),
  ('safe_zone', 'The Ridge, Shimla', 31.1054, 77.1695, 85, '{"city":"Shimla","state":"Himachal Pradesh"}'),
  ('safe_zone', 'Old Manali', 32.2714, 77.1694, 75, '{"city":"Manali","state":"Himachal Pradesh"}'),
  ('moderate_zone', 'Rohtang Pass Road', 32.3700, 77.2500, 55, '{"city":"Manali","state":"Himachal Pradesh"}'),
  ('safe_zone', 'McLeodganj, Dharamshala', 32.2427, 76.3234, 78, '{"city":"Dharamshala","state":"Himachal Pradesh"}'),
  ('safe_zone', 'Kasol Main Market', 32.0100, 77.3148, 65, '{"city":"Kasol","state":"Himachal Pradesh"}'),
  ('sheguide', 'Meera S. - Himachal Guide', 31.1050, 77.1700, NULL, '{"city":"Shimla","lang":"HI/EN"}'),
  ('safe_zone', 'Gandhi Maidan, Patna', 25.6120, 85.1430, 65, '{"city":"Patna","state":"Bihar"}'),
  ('moderate_zone', 'Patna Junction Area', 25.6084, 85.1376, 45, '{"city":"Patna","state":"Bihar"}'),
  ('safe_zone', 'Mahabodhi Temple, Bodh Gaya', 24.6961, 84.9911, 80, '{"city":"Bodh Gaya","state":"Bihar"}'),
  ('safe_zone', 'Nalanda University Ruins', 25.1357, 85.4432, 75, '{"city":"Nalanda","state":"Bihar"}'),
  ('safe_zone', 'Rajpur Road, Dehradun', 30.3388, 78.0489, 75, '{"city":"Dehradun","state":"Uttarakhand"}'),
  ('safe_zone', 'Laxman Jhula, Rishikesh', 30.1254, 78.3222, 80, '{"city":"Rishikesh","state":"Uttarakhand"}'),
  ('safe_zone', 'Triveni Ghat, Rishikesh', 30.1038, 78.2962, 82, '{"city":"Rishikesh","state":"Uttarakhand"}'),
  ('moderate_zone', 'Haridwar Station Area', 29.9457, 78.1642, 50, '{"city":"Haridwar","state":"Uttarakhand"}'),
  ('safe_zone', 'Mall Road, Nainital', 29.3919, 79.4542, 80, '{"city":"Nainital","state":"Uttarakhand"}'),
  ('safe_zone', 'Mall Road, Mussoorie', 30.4598, 78.0644, 78, '{"city":"Mussoorie","state":"Uttarakhand"}'),
  ('sheguide', 'Kavya D. - Uttarakhand Guide', 30.3390, 78.0490, NULL, '{"city":"Dehradun","lang":"HI/EN"}');

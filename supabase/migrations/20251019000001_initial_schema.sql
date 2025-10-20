-- Initial Schema for Kryzon CTF Platform
-- Created: October 19, 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'creator', 'moderator', 'admin');
CREATE TYPE machine_difficulty AS ENUM ('beginner', 'easy', 'medium', 'hard', 'expert');
CREATE TYPE machine_category AS ENUM ('web', 'pwn', 'crypto', 'reverse', 'forensics', 'misc');
CREATE TYPE machine_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'retired');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'achievement');
CREATE TYPE flag_type AS ENUM ('static', 'dynamic', 'regex');

-- ============================================================================
-- PROFILES TABLE - Extends Supabase auth.users
-- ============================================================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER PROGRESS TABLE - XP and category stats
-- ============================================================================
CREATE TABLE user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category machine_category NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    machines_solved INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- ============================================================================
-- MACHINES TABLE - CTF challenges
-- ============================================================================
CREATE TABLE machines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    difficulty machine_difficulty NOT NULL,
    category machine_category NOT NULL,
    status machine_status DEFAULT 'draft',
    xp_reward INTEGER NOT NULL DEFAULT 100,
    vm_url TEXT, -- Supabase storage URL
    docker_image TEXT,
    instance_config JSONB, -- Docker/VM configuration
    solve_count INTEGER DEFAULT 0,
    first_blood_user_id UUID REFERENCES profiles(id),
    first_blood_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MACHINE FILES TABLE - Additional files for machines
-- ============================================================================
CREATE TABLE machine_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL, -- Supabase storage URL
    file_size BIGINT,
    file_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FLAGS TABLE - Machine flags/objectives
-- ============================================================================
CREATE TABLE flags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    flag_value TEXT NOT NULL,
    flag_type flag_type DEFAULT 'static',
    regex_pattern TEXT, -- For regex flags
    xp_value INTEGER DEFAULT 10,
    is_final_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SUBMISSIONS TABLE - User flag submissions
-- ============================================================================
CREATE TABLE submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    flag_id UUID REFERENCES flags(id) ON DELETE CASCADE,
    submitted_flag TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    xp_awarded INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, flag_id) -- Prevent duplicate correct submissions
);

-- ============================================================================
-- NOTIFICATIONS TABLE - User notifications
-- ============================================================================
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    metadata JSONB, -- Additional data (machine_id, xp gained, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MACHINE INSTANCES TABLE - Active machine instances
-- ============================================================================
CREATE TABLE machine_instances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    instance_url TEXT, -- VM/Container access URL
    ssh_config JSONB, -- SSH connection details
    status VARCHAR(20) DEFAULT 'starting', -- starting, running, stopping, stopped
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, machine_id) -- One instance per user per machine
);

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User progress policies
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all progress" ON user_progress FOR SELECT USING (true);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Machines policies
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved machines" ON machines FOR SELECT USING (status = 'approved');
CREATE POLICY "Creators can view own machines" ON machines FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Admins can view all machines" ON machines FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);
CREATE POLICY "Creators can insert machines" ON machines FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own machines" ON machines FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Admins can update all machines" ON machines FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Machine files policies
ALTER TABLE machine_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files of approved machines" ON machine_files FOR SELECT USING (
    EXISTS (SELECT 1 FROM machines WHERE id = machine_id AND status = 'approved')
);

-- Flags policies
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flags of approved machines" ON flags FOR SELECT USING (
    EXISTS (SELECT 1 FROM machines WHERE id = machine_id AND status = 'approved')
);

-- Submissions policies
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions" ON submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Machine instances policies
ALTER TABLE machine_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own instances" ON machine_instances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own instances" ON machine_instances FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES for better performance
-- ============================================================================

-- Profiles indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Machines indexes
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_machines_creator ON machines(creator_id);
CREATE INDEX idx_machines_category ON machines(category);
CREATE INDEX idx_machines_difficulty ON machines(difficulty);

-- Submissions indexes
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_machine ON submissions(machine_id);
CREATE INDEX idx_submissions_correct ON submissions(is_correct);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================================================
-- TRIGGERS for automatic updates
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('machine-files', 'machine-files', false),
    ('machine-vms', 'machine-vms', false),
    ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload machine files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'machine-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload VMs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'machine-vms' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create default admin user (you'll need to update this with your actual user ID after signup)
-- INSERT INTO profiles (id, username, full_name, role) 
-- VALUES ('YOUR_USER_ID_HERE', 'admin', 'Administrator', 'admin');
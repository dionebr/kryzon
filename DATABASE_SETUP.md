# Database Setup Instructions

## 1. Configure Environment Variables

Update your `.env` file with your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=[your-project-id]
```

## 2. Run Database Migration

### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy the contents of `supabase/migrations/20251019000001_initial_schema.sql`
5. Paste and run the SQL

### Option B: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

## 3. Create Admin User

1. Sign up in your app or create a user in Supabase Auth
2. Run this SQL to make yourself admin:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE username = 'your_username';
```

## 4. Test the Application

```bash
npm run dev
```

Your database is now ready! 🎉

## Database Schema Overview

- **profiles** - User accounts and roles
- **machines** - CTF challenges
- **flags** - Challenge objectives
- **submissions** - User attempts
- **notifications** - System notifications
- **user_progress** - XP and leveling
- **machine_instances** - Active VM instances
- **machine_files** - Challenge attachments
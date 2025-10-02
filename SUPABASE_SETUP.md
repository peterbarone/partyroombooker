# Supabase Setup Guide

## Setting Up Your Supabase Database

### Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign up/sign in
2. Create a new project
3. Choose a database password and region
4. Wait for the project to be ready (~2 minutes)

### Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to "Settings" → "API"
2. Copy the following values:
   - Project URL
   - `anon` public key
   - `service_role` secret key (for admin operations)

### Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 4: Create the Database Schema

1. In your Supabase dashboard, go to the "SQL Editor"
2. Click "New query"
3. Copy the contents of `src/lib/database.sql` and paste it
4. Run the query to create all tables, indexes, and sample data

### Step 5: Verify the Setup

1. Go to "Table Editor" in your Supabase dashboard
2. You should see all the tables created
3. Check the `tenants` table - you should see "thefamilyfunfactory" entry
4. Check other tables for sample data

### Step 6: Test the API Connection

Run the development server and test the Supabase connection:

```bash
npm run dev
```

Then visit: http://localhost:3000/api/test-supabase

You should see a success message with tenant data.

## Troubleshooting

### Common Issues:

1. **Environment variables not loaded**: Make sure `.env.local` is in the project root
2. **RLS policies too restrictive**: Check the policies in the SQL Editor
3. **Missing tables**: Re-run the database.sql script
4. **Wrong API keys**: Double-check the keys from Supabase dashboard

### Database Reset (if needed):

If you need to reset the database:

1. Go to "Settings" → "General" in Supabase dashboard
2. Scroll to "Danger Zone"
3. Click "Reset database password" or recreate the project
4. Re-run the database.sql script

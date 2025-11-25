# beef - Workout Tracking App

A simple workout tracking app built with Next.js and Supabase. Track your sets, reps, and weights across multiple devices.

## Features

- 📊 Dashboard with workout stats and streak tracking
- 💪 Exercise library with movement categories
- 📝 Log workouts with sets/reps/weight
- 📱 Works across all devices (web, mobile)
- ☁️ Cloud storage with Supabase

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Supermix UI components
- **Deployment**: Vercel

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the database to be provisioned

### 2. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** to create the tables

### 3. Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **New Project**
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**

Your app will be live and accessible from any device!

## Project Structure

```
workout-app/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   └── lib/
│       ├── actions/      # Server actions (database queries)
│       ├── constants.ts  # App constants
│       └── supabase.ts   # Supabase client
├── supabase-schema.sql   # Database schema
└── README.md
```

## Free Tier Limits

- **Supabase**: 500 MB database, 2 GB bandwidth/month
- **Vercel**: Unlimited for personal projects

Perfect for personal use! 🎉

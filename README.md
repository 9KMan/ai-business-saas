# AI Business SaaS - Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenRouter account (for AI)

## Environment Setup

1. **Copy environment file:**
```bash
cp .env.local.example .env.local
```

2. **Fill in your credentials in `.env.local`:**

```env
# Supabase (from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenRouter (get from openrouter.ai)
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENROUTER_MODEL=anthropic/claude-3-haiku

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Supabase Setup

### 1. Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and keys to `.env.local`

### 2. Run Database Schema

Go to SQL Editor in Supabase dashboard and run:

```sql
-- =====================================================
-- AI Business SaaS - Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Tasks: Users can only access their own tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on tasks
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);
```

### 3. Enable Email Auth (optional - for email/password)
In Supabase Dashboard → Authentication → Providers → Email → Enable

### 4. Enable Google OAuth (optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. In Supabase → Authentication → Providers → Google → Enable and add credentials

## Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment to Vercel

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ai-business-saas.git
git push -u origin main
```

2. **Deploy on Vercel:**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repo
- Add environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `OPENROUTER_API_KEY`
  - `OPENROUTER_MODEL`
  - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
- Deploy!

## Features

- 🤖 **AI Natural Language Input** - Type tasks naturally, AI parses them
- 📋 **Task Management** - Create, update, delete tasks
- 🏷️ **Priority Levels** - Low, medium, high priority tasks
- 📅 **Due Dates** - Track deadlines
- 🌐 **Multi-language** - English, Hebrew, Spanish, French, German
- 📱 **RTL Support** - Full Hebrew RTL support
- 🔐 **Secure** - Row Level Security via Supabase
- ⚡ **Fast** - Next.js 14 App Router + streaming

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth)
- **AI:** OpenRouter API (Claude, GPT, etc.)
- **i18n:** next-intl

## Project Structure

```
ai-business-saas/
├── app/
│   ├── api/
│   │   ├── ai/route.ts        # AI interpretation endpoint
│   │   └── tasks/route.ts     # Task CRUD endpoint
│   ├── auth/
│   │   ├── callback/route.ts  # OAuth callback
│   │   └── login/page.tsx     # Login page
│   ├── dashboard/
│   │   ├── layout.tsx         # Dashboard layout
│   │   ├── page.tsx           # Dashboard home
│   │   ├── settings/page.tsx  # Settings
│   │   └── tasks/
│   │       ├── page.tsx       # Task list
│   │       └── new/page.tsx   # New task
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Landing page
├── components/
│   ├── ai-input.tsx           # AI input component
│   ├── dashboard-nav.tsx      # Sidebar nav
│   ├── rtl-provider.tsx       # RTL/LTR context
│   ├── task-list.tsx          # Task list
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── ai.ts                  # AI integration
│   ├── i18n.ts                # i18n config
│   ├── supabase/
│   │   ├── client.ts          # Client-side Supabase
│   │   └── server.ts          # Server-side Supabase
│   └── utils.ts               # Utilities
├── types/
│   └── database.ts            # TypeScript types
├── middleware.ts              # Auth protection
└── package.json
```

## License

MIT

# Everest Townhall 2026: Word Cloud 🏔️

A real-time, interactive word cloud application shaped like Mount Everest, built for the Everest Engineering townhall.

## Features
- **Mobile-First Submission**: Participants can submit their 2026 goals via a simple, branded form.
- **Real-time Visualization**: Words appear instantly on the main display, forming a mountain-shaped cloud.
- **Everest Branding**: Uses exact brand colors (`Prospero`, `Everest Yellow`, `Coral`) and optimized typography.

## Setup Instructions

### 1. Supabase Backend
1. Go to [Supabase](https://supabase.com/).
2. Create a new project.
3. Open the **SQL Editor** and run the contents of [`supabase_schema.sql`](./supabase_schema.sql).
4. Go to **Project Settings > API** and copy your `URL` and `Anon Key`.

### 2. Environment Variables
Create a `.env.local` file in the root directory (or use the provided template) and add your Supabase and OpenAI credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
# Publishable Key (safe for client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_anon_key
# Secret Key (server-side ONLY)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key

OPENAI_API_KEY=your_openai_api_key
```


### 3. Local Development
Install dependencies and run the server:
```bash
pnpm install
pnpm dev
```

## Pages
- **Submission**: `http://localhost:3000/` (For participants)
- **Display**: `http://localhost:3000/display` (For the big screen)

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Realtime**: Supabase
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Visualization**: D3.js + d3-cloud


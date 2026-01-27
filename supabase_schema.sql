create table public.submissions (
  id uuid default gen_random_uuid() primary key,
  word text not null,
  name text,
  original_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.submissions enable row level security;

-- Allow anonymous inserts (for the townhall participants)
create policy "Allow anonymous inserts"
on public.submissions
for insert
with check (true);

-- Allow anonymous reads (for the display page)
create policy "Allow anonymous reads"
on public.submissions
for select
using (true);

-- Enable Realtime for the submissions table
begin;
  -- Remove the table from the realtime publication if it exists
  alter publication supabase_realtime drop table if exists submissions;
  -- Add the table to the realtime publication
  alter publication supabase_realtime add table submissions;
commit;

-- Add ip_address column to submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS ip_address text;

-- Create an index for faster unique IP queries
CREATE INDEX IF NOT EXISTS idx_submissions_ip 
ON public.submissions(ip_address);

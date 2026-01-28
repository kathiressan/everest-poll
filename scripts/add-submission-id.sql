-- Add submission_id column to submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS submission_id uuid;

-- For existing rows, set submission_id to the same as id (each row is its own submission)
UPDATE public.submissions 
SET submission_id = id 
WHERE submission_id IS NULL;

-- Make submission_id NOT NULL after backfilling
ALTER TABLE public.submissions 
ALTER COLUMN submission_id SET NOT NULL;

-- Create an index for faster grouping queries
CREATE INDEX IF NOT EXISTS idx_submissions_submission_id 
ON public.submissions(submission_id);

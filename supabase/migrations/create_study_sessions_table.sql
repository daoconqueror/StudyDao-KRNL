-- Create study_sessions table for storing session data
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    group_id INTEGER NOT NULL,
    notes TEXT NOT NULL,
    duration INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
ON public.study_sessions
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON public.study_sessions
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_timestamp ON public.study_sessions(timestamp);

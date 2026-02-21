
-- Create scans table to store scan history
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  overall_risk TEXT NOT NULL,
  risk_explanation TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  trackers JSONB NOT NULL DEFAULT '[]'::jsonb,
  policy_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  tracker_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read scans (public tool, no auth yet)
CREATE POLICY "Scans are publicly readable"
  ON public.scans FOR SELECT
  USING (true);

-- Allow inserts from edge functions (service role)
CREATE POLICY "Allow public inserts"
  ON public.scans FOR INSERT
  WITH CHECK (true);

-- Index for listing recent scans
CREATE INDEX idx_scans_created_at ON public.scans (created_at DESC);
CREATE INDEX idx_scans_url ON public.scans (url);

-- Create messages table for contact form
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a message (public contact form)
CREATE POLICY "Anyone can submit messages"
ON public.messages
FOR INSERT
WITH CHECK (true);

-- Only admins can view messages
CREATE POLICY "Admins can view messages"
ON public.messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update messages (mark as read)
CREATE POLICY "Admins can update messages"
ON public.messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete messages
CREATE POLICY "Admins can delete messages"
ON public.messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create activity log table for notifications
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL, -- 'message', 'resume_download', 'project_view'
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Anyone can insert activity (for tracking)
CREATE POLICY "Anyone can log activity"
ON public.activity_log
FOR INSERT
WITH CHECK (true);

-- Only admins can view activity
CREATE POLICY "Admins can view activity"
ON public.activity_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update activity (mark as read)
CREATE POLICY "Admins can update activity"
ON public.activity_log
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete activity
CREATE POLICY "Admins can delete activity"
ON public.activity_log
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
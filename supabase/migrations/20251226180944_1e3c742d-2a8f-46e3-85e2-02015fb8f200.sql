-- Drop the current policy
DROP POLICY IF EXISTS "Authenticated users can log activity" ON public.activity_log;

-- Create admin-only insert policy
CREATE POLICY "Admins can insert activity" 
ON public.activity_log 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
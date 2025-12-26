-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can log activity" ON public.activity_log;

-- Create a new policy that only allows authenticated users to insert
CREATE POLICY "Authenticated users can log activity" 
ON public.activity_log 
FOR INSERT 
TO authenticated
WITH CHECK (true);
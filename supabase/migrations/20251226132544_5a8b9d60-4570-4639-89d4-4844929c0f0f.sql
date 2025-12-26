-- Enable REPLICA IDENTITY FULL for realtime updates
ALTER TABLE public.site_settings REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
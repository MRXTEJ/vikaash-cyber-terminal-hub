-- Drop and recreate the verify_recovery_code function with proper SHA256 hashing
CREATE OR REPLACE FUNCTION public.verify_recovery_code(_user_id uuid, _code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _code_id uuid;
  _code_hash text;
BEGIN
  -- Hash the input code using SHA256 (same as client-side)
  _code_hash := encode(digest(_code, 'sha256'), 'hex');
  
  -- Find an unused code that matches
  SELECT id INTO _code_id
  FROM public.recovery_codes
  WHERE user_id = _user_id
    AND used = false
    AND code_hash = _code_hash;
  
  IF _code_id IS NOT NULL THEN
    -- Mark the code as used
    UPDATE public.recovery_codes
    SET used = true, used_at = now()
    WHERE id = _code_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;
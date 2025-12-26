import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  userId: string;
  code: string;
}

// Rate limiting for verification attempts to prevent brute force attacks
const verifyRateLimitMap = new Map<string, { count: number; resetTime: number; lockoutUntil?: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_VERIFY_ATTEMPTS = 5; // Max 5 attempts per minute
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minute lockout after too many failures

function checkVerifyRateLimit(userId: string): { allowed: boolean; retryAfter?: number; locked?: boolean } {
  const now = Date.now();
  const userLimit = verifyRateLimitMap.get(userId);

  // Check if user is locked out
  if (userLimit?.lockoutUntil && now < userLimit.lockoutUntil) {
    const retryAfter = Math.ceil((userLimit.lockoutUntil - now) / 1000);
    return { allowed: false, retryAfter, locked: true };
  }

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new rate limit entry
    verifyRateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (userLimit.count >= MAX_VERIFY_ATTEMPTS) {
    // Lock out the user for extended period after too many attempts
    userLimit.lockoutUntil = now + LOCKOUT_DURATION_MS;
    const retryAfter = Math.ceil(LOCKOUT_DURATION_MS / 1000);
    console.log(`User ${userId} locked out for ${retryAfter} seconds due to too many verification attempts`);
    return { allowed: false, retryAfter, locked: true };
  }

  userLimit.count++;
  return { allowed: true };
}

function resetRateLimitOnSuccess(userId: string) {
  verifyRateLimitMap.delete(userId);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, code }: VerifyOTPRequest = await req.json();

    // Validate inputs
    if (!userId || typeof userId !== 'string' || userId.length < 10) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid OTP format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit for verification attempts
    const rateLimit = checkVerifyRateLimit(userId);
    if (!rateLimit.allowed) {
      const message = rateLimit.locked 
        ? "Too many failed attempts. Account temporarily locked."
        : "Too many verification attempts. Please try again later.";
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: message,
          retryAfter: rateLimit.retryAfter 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(rateLimit.retryAfter)
          } 
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("code", code)
      .eq("used", false)
      .single();

    if (fetchError || !otpRecord) {
      console.log("OTP not found or already used:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid OTP code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if OTP is expired
    const expiresAt = new Date(otpRecord.expires_at);
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: "OTP has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from("otp_codes")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    if (updateError) {
      console.error("Failed to mark OTP as used:", updateError);
    }

    // Reset rate limit on successful verification
    resetRateLimitOnSuccess(userId);

    console.log("OTP verified successfully for user:", userId);

    return new Response(
      JSON.stringify({ success: true, message: "OTP verified successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  type: "email" | "phone";
  email?: string;
  phone?: string;
  userId: string;
}

// Rate limiting: Track requests per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 OTP requests per minute per user

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new rate limit entry
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  userLimit.count++;
  return { allowed: true };
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, phone, userId }: OTPRequest = await req.json();

    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.length < 10) {
      return new Response(
        JSON.stringify({ error: "Invalid user ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for user: ${userId}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many OTP requests. Please try again later.",
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
    
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete any existing OTPs for this user
    await supabase
      .from("otp_codes")
      .delete()
      .eq("user_id", userId);

    // Insert new OTP
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        user_id: userId,
        code: otp,
        type,
        expires_at: expiresAt.toISOString(),
        destination: type === "email" ? email : phone,
      });

    if (insertError) {
      console.error("Failed to store OTP:", insertError);
      throw new Error("Failed to store OTP");
    }

    if (type === "email" && email) {
      // Send OTP via Email using Resend
      const emailResponse = await resend.emails.send({
        from: "Admin Login <onboarding@resend.dev>",
        to: [email],
        subject: "Your Admin Login OTP Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #00ff00; text-align: center;">Admin Login OTP</h1>
            <div style="background: #1a1a2e; padding: 30px; border-radius: 10px; text-align: center;">
              <p style="color: #ffffff; font-size: 16px;">Your One-Time Password is:</p>
              <h2 style="color: #00ff00; font-size: 36px; letter-spacing: 8px; margin: 20px 0;">${otp}</h2>
              <p style="color: #888888; font-size: 14px;">This code expires in 5 minutes.</p>
              <p style="color: #ff4444; font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
            </div>
          </div>
        `,
      });

      console.log("Email OTP sent:", emailResponse);

      return new Response(
        JSON.stringify({ success: true, message: "OTP sent to email" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (type === "phone" && phone) {
      // Send OTP via SMS using Twilio
      const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: phone,
            From: twilioPhoneNumber!,
            Body: `Your Admin Login OTP is: ${otp}. This code expires in 5 minutes.`,
          }),
        }
      );

      const twilioData = await twilioResponse.json();
      console.log("SMS OTP sent:", twilioData);

      if (!twilioResponse.ok) {
        throw new Error(`Twilio error: ${twilioData.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: "OTP sent to phone" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid OTP request - missing email or phone");
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
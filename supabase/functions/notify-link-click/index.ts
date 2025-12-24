import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkName, linkUrl } = await req.json();
    console.log(`Link click notification: ${linkName} - ${linkUrl}`);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get admin email from site_settings or use default
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Fetch admin email from profiles via user_roles
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1);

    let adminEmail = 'admin@example.com';
    
    if (adminRoles && adminRoles.length > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', adminRoles[0].user_id)
        .single();
      
      if (profile?.email) {
        adminEmail = profile.email;
      }
    }

    const timestamp = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    });

    // Send email notification
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Portfolio Notifications <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `🔔 ${linkName} Profile Visit - Portfolio Alert`,
        html: `
          <div style="font-family: 'Courier New', monospace; background: #0a0a0a; color: #00ff41; padding: 30px; border: 1px solid #00ff41;">
            <h2 style="color: #ff0040; margin-bottom: 20px;">⚡ Profile Visit Alert</h2>
            <div style="background: #1a1a1a; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><span style="color: #ff0040;">Platform:</span> ${linkName}</p>
              <p style="margin: 0 0 10px 0;"><span style="color: #ff0040;">URL:</span> <a href="${linkUrl}" style="color: #00ffff;">${linkUrl}</a></p>
              <p style="margin: 0;"><span style="color: #ff0040;">Time:</span> ${timestamp}</p>
            </div>
            <p style="color: #888; font-size: 12px;">Someone clicked on your ${linkName} link from your portfolio website.</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
              <p style="color: #00ff41; font-size: 11px;">🔐 Sent from your Portfolio Admin System</p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Resend API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await emailResponse.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in notify-link-click:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
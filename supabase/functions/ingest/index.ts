import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-token",
};

// Simple hash function (same as frontend)
function hashToken(token: string): string {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// Calculate risk score based on request characteristics
function calculateRiskScore(path: string, method: string, userAgent: string, body: string): number {
  let score = 0;
  
  // Path sensitivity
  if (path.includes('admin') || path.includes('config') || path.includes('.env')) score += 30;
  if (path.includes('.git') || path.includes('backup')) score += 25;
  if (path.includes('phpmyadmin') || path.includes('wp-admin')) score += 20;
  
  // Payload analysis
  if (body) {
    if (body.includes('SELECT') || body.includes("'")) score += 25;
    if (body.includes('<script>') || body.includes('<?php')) score += 30;
    if (body.includes('jndi') || body.includes('wget')) score += 35;
    if (body.includes('passwd') || body.includes('../')) score += 20;
  }
  
  // User agent
  if (userAgent) {
    if (userAgent.includes('sqlmap') || userAgent.includes('Nikto')) score += 25;
    if (userAgent.includes('Nmap') || userAgent.includes('masscan')) score += 20;
    if (userAgent.includes('Nuclei')) score += 15;
  }
  
  // Method
  if (method === 'POST' || method === 'PUT') score += 5;
  
  return Math.min(100, score);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API token from header
    const apiToken = req.headers.get("x-api-token");
    
    if (!apiToken) {
      console.log("No API token provided");
      return new Response(
        JSON.stringify({ error: "X-API-TOKEN header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Hash the token and look it up
    const tokenHash = hashToken(apiToken);
    
    const { data: tokenData, error: tokenError } = await supabase
      .from("api_tokens")
      .select("id, tenant_id, is_active, expires_at, grace_period_until")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (tokenError || !tokenData) {
      console.log("Invalid token:", tokenError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid API token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is active
    if (!tokenData.is_active) {
      // Check grace period
      if (tokenData.grace_period_until) {
        const gracePeriod = new Date(tokenData.grace_period_until);
        if (new Date() > gracePeriod) {
          return new Response(
            JSON.stringify({ error: "Token expired (grace period ended)" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: "Token has been revoked" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check expiration
    if (tokenData.expires_at) {
      const expiresAt = new Date(tokenData.expires_at);
      if (new Date() > expiresAt) {
        return new Response(
          JSON.stringify({ error: "Token expired" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update last_used_at
    await supabase
      .from("api_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    // Parse event data
    const body = await req.text();
    let eventData: any;
    
    try {
      eventData = JSON.parse(body);
    } catch {
      eventData = { body };
    }

    // Get source IP from headers (forwarded by reverse proxy)
    const sourceIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("x-real-ip") 
      || "unknown";

    // Extract headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (!key.toLowerCase().includes("authorization") && !key.toLowerCase().includes("x-api-token")) {
        headers[key] = value;
      }
    });

    // Calculate risk score
    const path = eventData.path || req.url;
    const method = eventData.method || req.method;
    const userAgent = req.headers.get("user-agent") || eventData.user_agent || "";
    const riskScore = calculateRiskScore(path, method, userAgent, body);

    // Insert event
    const { data: insertedEvent, error: insertError } = await supabase
      .from("events")
      .insert({
        tenant_id: tokenData.tenant_id,
        source_ip: sourceIp,
        service: eventData.service || "http-honeypot",
        path: path,
        method: method,
        user_agent: userAgent,
        headers: headers,
        body: body.substring(0, 10000), // Limit body size
        payload_size: body.length,
        risk_score: riskScore,
        country: eventData.country,
        asn: eventData.asn,
        org: eventData.org
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting event:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to insert event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Event ingested: ${insertedEvent.id} from ${sourceIp} risk=${riskScore}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        event_id: insertedEvent.id,
        risk_score: riskScore
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Ingest error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

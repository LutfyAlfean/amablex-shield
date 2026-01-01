import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERSION = "2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-token",
};

// Supported honeypot services
const SUPPORTED_SERVICES = [
  "http-honeypot",
  "ssh-honeypot", 
  "ftp-honeypot",
  "mysql-honeypot",
  "smtp-honeypot",
  "dns-honeypot",
  "telnet-honeypot",
  "rdp-honeypot",
  "test-honeypot",
];

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

// Risk scoring rules per service type
const RISK_RULES = {
  http: {
    paths: [
      { pattern: /admin/i, score: 30 },
      { pattern: /\.env/i, score: 35 },
      { pattern: /\.git/i, score: 30 },
      { pattern: /config/i, score: 25 },
      { pattern: /phpmyadmin/i, score: 25 },
      { pattern: /wp-admin/i, score: 20 },
      { pattern: /backup/i, score: 20 },
      { pattern: /shell/i, score: 40 },
      { pattern: /cmd/i, score: 40 },
      { pattern: /eval/i, score: 35 },
    ],
    payloads: [
      { pattern: /SELECT.*FROM/i, score: 30 },
      { pattern: /UNION.*SELECT/i, score: 35 },
      { pattern: /<script>/i, score: 35 },
      { pattern: /<\?php/i, score: 35 },
      { pattern: /wget|curl/i, score: 25 },
      { pattern: /passwd|shadow/i, score: 30 },
      { pattern: /\.\.\/|\.\.\\/, score: 25 },
      { pattern: /jndi:/i, score: 40 },
      { pattern: /\${.*}/i, score: 30 },
    ],
    userAgents: [
      { pattern: /sqlmap/i, score: 30 },
      { pattern: /nikto/i, score: 25 },
      { pattern: /nmap/i, score: 20 },
      { pattern: /masscan/i, score: 20 },
      { pattern: /nuclei/i, score: 15 },
      { pattern: /dirbuster/i, score: 20 },
      { pattern: /gobuster/i, score: 20 },
    ],
  },
  ssh: {
    users: [
      { pattern: /^root$/i, score: 35 },
      { pattern: /^admin$/i, score: 30 },
      { pattern: /^oracle$/i, score: 25 },
      { pattern: /^postgres$/i, score: 25 },
      { pattern: /^mysql$/i, score: 25 },
      { pattern: /^test$/i, score: 15 },
    ],
    patterns: [
      { pattern: /failed.*password/i, score: 20 },
      { pattern: /invalid.*user/i, score: 25 },
      { pattern: /brute/i, score: 40 },
    ],
  },
  ftp: {
    users: [
      { pattern: /^anonymous$/i, score: 15 },
      { pattern: /^root$/i, score: 35 },
      { pattern: /^admin$/i, score: 30 },
    ],
    patterns: [
      { pattern: /login.*failed/i, score: 20 },
    ],
  },
  mysql: {
    queries: [
      { pattern: /DROP/i, score: 50 },
      { pattern: /DELETE.*FROM/i, score: 35 },
      { pattern: /UPDATE.*SET/i, score: 25 },
      { pattern: /INSERT.*INTO/i, score: 15 },
      { pattern: /LOAD_FILE/i, score: 40 },
      { pattern: /INTO.*OUTFILE/i, score: 45 },
    ],
    users: [
      { pattern: /^root$/i, score: 35 },
      { pattern: /^admin$/i, score: 30 },
    ],
  },
};

// Calculate risk score based on service type and request characteristics
function calculateRiskScore(
  service: string,
  path: string, 
  method: string, 
  userAgent: string, 
  body: string
): number {
  let score = 0;
  const serviceType = service.replace("-honeypot", "");
  
  // HTTP specific rules
  if (serviceType === "http" || serviceType === "test") {
    const rules = RISK_RULES.http;
    
    // Check paths
    for (const rule of rules.paths) {
      if (rule.pattern.test(path)) {
        score += rule.score;
      }
    }
    
    // Check payloads
    for (const rule of rules.payloads) {
      if (rule.pattern.test(body)) {
        score += rule.score;
      }
    }
    
    // Check user agents
    for (const rule of rules.userAgents) {
      if (rule.pattern.test(userAgent)) {
        score += rule.score;
      }
    }
    
    // Method bonus
    if (method === "POST" || method === "PUT") score += 5;
    if (method === "DELETE") score += 10;
  }
  
  // SSH specific rules
  if (serviceType === "ssh") {
    const rules = RISK_RULES.ssh;
    
    // Extract username from body/path
    for (const rule of rules.users) {
      if (rule.pattern.test(body) || rule.pattern.test(path)) {
        score += rule.score;
      }
    }
    
    for (const rule of rules.patterns) {
      if (rule.pattern.test(body)) {
        score += rule.score;
      }
    }
    
    // Base score for SSH attempts
    score += 15;
  }
  
  // FTP specific rules
  if (serviceType === "ftp") {
    const rules = RISK_RULES.ftp;
    
    for (const rule of rules.users) {
      if (rule.pattern.test(body) || rule.pattern.test(path)) {
        score += rule.score;
      }
    }
    
    for (const rule of rules.patterns) {
      if (rule.pattern.test(body)) {
        score += rule.score;
      }
    }
    
    score += 10;
  }
  
  // MySQL specific rules
  if (serviceType === "mysql") {
    const rules = RISK_RULES.mysql;
    
    for (const rule of rules.queries) {
      if (rule.pattern.test(body)) {
        score += rule.score;
      }
    }
    
    for (const rule of rules.users) {
      if (rule.pattern.test(body)) {
        score += rule.score;
      }
    }
    
    score += 10;
  }
  
  // Other services get base score
  if (!["http", "ssh", "ftp", "mysql", "test"].includes(serviceType)) {
    score += 20;
  }
  
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
    const service = eventData.service || "http-honeypot";
    
    // Validate service type
    const validService = SUPPORTED_SERVICES.includes(service) ? service : "http-honeypot";
    
    const riskScore = calculateRiskScore(validService, path, method, userAgent, body);

    // Insert event
    const { data: insertedEvent, error: insertError } = await supabase
      .from("events")
      .insert({
        tenant_id: tokenData.tenant_id,
        source_ip: sourceIp,
        service: validService,
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

    console.log(`[v${VERSION}] Event ingested: ${insertedEvent.id} from ${sourceIp} service=${validService} risk=${riskScore}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        event_id: insertedEvent.id,
        risk_score: riskScore,
        service: validService,
        version: VERSION,
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

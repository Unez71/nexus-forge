
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // In production, authenticate the request first
    
    // Get the request body
    const { key } = await req.json();
    
    // Check which key was requested and return it if available
    let apiKey = "";
    if (key === "GOOGLE_AI_API_KEY") {
      apiKey = Deno.env.get("API_KEY") || "";
    }
    
    if (!apiKey) {
      throw new Error(`API key "${key}" not found`);
    }
    
    // Return the API key
    return new Response(
      JSON.stringify({ 
        apiKey,
        message: "API key retrieved successfully"
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error getting API key:", error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to retrieve API key" 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});

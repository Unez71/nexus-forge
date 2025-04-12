
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("API_KEY");
    
    if (!apiKey) {
      console.error("API_KEY environment variable is not set");
      throw new Error("API_KEY environment variable is not set");
    }

    console.log("API Key is available, processing request");
    
    const { prompt, model = "gemini-pro" } = await req.json();
    
    if (!prompt) {
      console.error("Prompt is missing in request");
      throw new Error("Prompt is required");
    }

    console.log(`Using model: ${model}`);
    console.log(`Processing prompt: ${prompt.substring(0, 50)}...`);

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });
    
    // Generate content
    console.log("Generating content...");
    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Successfully generated response");
    console.log(`Response preview: ${text.substring(0, 50)}...`);

    return new Response(
      JSON.stringify({ text }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating response:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

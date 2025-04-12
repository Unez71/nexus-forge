
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI client
let googleAI: GoogleGenerativeAI | null = null;

export function initGoogleAI(apiKey: string) {
  if (!apiKey) {
    throw new Error("API key is required");
  }
  googleAI = new GoogleGenerativeAI(apiKey);
  return googleAI;
}

export function getGoogleAI() {
  if (!googleAI) {
    throw new Error("Google AI client not initialized. Call initGoogleAI first.");
  }
  return googleAI;
}

export async function generateText(prompt: string, apiKey: string) {
  try {
    // Always initialize with the provided API key to ensure fresh instance
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    console.log("Generating text with prompt:", prompt.substring(0, 50) + "...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Generated text response:", text.substring(0, 50) + "...");
    
    return text;
  } catch (error) {
    console.error("Error generating text with Google AI:", error);
    throw error;
  }
}

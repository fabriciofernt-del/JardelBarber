
import { GoogleGenAI } from "@google/genai";
import { Appointment, Service, Professional, Tenant } from "../types";
import { CURRENT_TENANT } from "../constants";

export const getBusinessInsights = async (
  appointments: Appointment[],
  services: Service[],
  professionals: Professional[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As an AI business analyst specializing in the Service & Grooming Industry (Barber Shops), analyze the following business data for "${CURRENT_TENANT.name}" and provide 3 highly actionable strategic insights.
    
    Data Context:
    - Industry: Barber Shop / Men's Grooming
    - Professionals: ${JSON.stringify(professionals.map(p => ({ name: p.name, specialty: p.specialty })))}
    - Services Available: ${JSON.stringify(services.map(s => ({ name: s.name, price: s.price, duration: s.duration_min })))}
    - Current Load: ${appointments.length} confirmed appointments in the system.
    
    Goals:
    1. Increase Average Order Value (AOV)
    2. Optimize professional's schedule and reduce idle time
    3. Improve customer retention and recurring bookings

    Focus on local market trends for barber shops like combo offers (hair + beard), grooming products upselling, and peak hour management.

    Return the response ONLY as a JSON object with this structure:
    {
      "insights": [
        { "title": "string", "description": "string", "action": "string" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{\"insights\": []}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return { insights: [] };
  }
};

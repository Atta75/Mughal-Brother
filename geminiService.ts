
import { GoogleGenAI } from "@google/genai";
import { AppState } from "./types";

export const getAIInsights = async (state: AppState) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const productSummary = state.products.map(p => `${p.name} (Stock: ${p.stock})`).join(', ');
  const recentTransactions = state.transactions.slice(-5).map(t => `${t.type}: PKR ${t.total}`).join(', ');
  
  const prompt = `
    Act as a business consultant for a retail/wholesale store in Pakistan. Analyze this snapshot:
    Products: ${productSummary}
    Recent Transactions: ${recentTransactions}
    Total Products: ${state.products.length}
    Total Transactions: ${state.transactions.length}
    
    Provide 3 concise insights:
    1. A sales optimization tip based on recent data.
    2. A stock management alert for low items.
    3. A financial health comment based on PKR figures.
    Keep it professional and encouraging. Format as bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Insights failed:", error);
    return "Unable to load AI insights at this time.";
  }
};

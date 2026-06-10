import { GoogleGenAI } from '@google/genai'

export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export const GEMINI_MODEL = 'gemini-3.5-flash'

export const GEMINI_CONFIG = {
  thinkingConfig: {
    thinkingLevel: 'HIGH',
  },
  maxOutputTokens: 65536,
} as const

export async function generateGemini(prompt: string) {
  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: GEMINI_CONFIG,
  })
  return response.text
}

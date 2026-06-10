import { GoogleGenAI } from '@google/genai'

export const GEMINI_MODEL = 'gemini-3.5-flash'

export async function generateGemini(prompt: string, apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('Gemini API key is required')

  const client = new GoogleGenAI({ apiKey: key })
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      maxOutputTokens: 65536,
    } as any,
  })
  return response.text
}

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function extractTaskFromSpeech(transcript, apiKey) {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an AI assistant for a to-do list app.
      The user spoke the following sentence via voice command to add a task.
      Extract the core task action from the sentence.
      Keep it brief and actionable, typically starting with a verb if appropriate.
      Only return the extracted task text, nothing else. No quotes, no explanations.

      User said: "${transcript}"
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim();
  } catch (error) {
    console.error('Error extracting task using Gemini API:', error);
    throw error;
  }
}

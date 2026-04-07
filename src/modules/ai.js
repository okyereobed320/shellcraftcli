import Conf from 'conf';

const config = new Conf({ projectName: 'shellcraft' });

/**
 * AI Provider Configurations
 */
export const PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}',
    defaultModel: 'gemini-1.5-flash',
  },
  openai_compatible: {
    name: 'OpenAI Compatible (Groq, OpenRouter, etc.)',
    endpoint: '{baseUrl}/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
  }
};

/**
 * Get AI response based on configured provider
 */
export async function askAI(prompt, systemPrompt = 'You are Shellcraft AI, a Linux and Cloud Engineering mentor.') {
  const aiConfig = config.get('ai', {});
  
  if (!aiConfig.provider || !aiConfig.apiKey) {
    throw new Error('AI not configured. Please run AI Setup first.');
  }

  if (aiConfig.provider === 'gemini') {
    return callGemini(prompt, systemPrompt, aiConfig);
  } else {
    return callOpenAICompatible(prompt, systemPrompt, aiConfig);
  }
}

async function callGemini(prompt, systemPrompt, aiConfig) {
  const model = aiConfig.model || PROVIDERS.gemini.defaultModel;
  const url = PROVIDERS.gemini.endpoint
    .replace('{model}', model)
    .replace('{key}', aiConfig.apiKey);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }]
      }]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'Gemini API Error');
  
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
}

async function callOpenAICompatible(prompt, systemPrompt, aiConfig) {
  const baseUrl = aiConfig.baseUrl || 'https://api.groq.com/openai';
  const model = aiConfig.model || PROVIDERS.openai_compatible.defaultModel;
  const url = PROVIDERS.openai_compatible.endpoint.replace('{baseUrl}', baseUrl);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aiConfig.apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'AI API Error');
  
  return data.choices?.[0]?.message?.content || 'No response from AI.';
}

export function isAIConfigured() {
  const aiConfig = config.get('ai', {});
  return !!(aiConfig.provider && aiConfig.apiKey);
}

import { FormData, APIResponse } from '../types';
import { fetchMockResults } from './mockApi';

const API_URL = 'https://api.openai.com/v1/chat/completions';

// Check if we should use mock data (when no API key is provided)
export const shouldUseMockData = (): boolean => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  return !apiKey || apiKey === 'your_openai_api_key_here' || apiKey.trim() === '';
};

// Note: In a production app, the API key should be handled server-side
// This is a demo implementation - never expose API keys in client-side code
const getApiKey = (): string => {
  // In a real app, this would come from environment variables on a server
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
  }
  return apiKey;
};

const buildPrompt = (data: FormData): string => {
  const toneInstructions = {
    neutral: "Keep a balanced, professional tone that's neither too casual nor too formal.",
    viral: "Make it engaging, attention-grabbing, and shareable. Use hooks, emojis, and compelling language that drives engagement.",
    professional: "Use a smart, authoritative tone that demonstrates expertise and builds credibility.",
    concise: "Keep it brief and to the point. Focus on clarity and impact with minimal words."
  };

  if (data.mode === 'generate') {
    return `Generate 5 LinkedIn post ideas based on these topics: "${data.input}"

Tone: ${toneInstructions[data.tone]}

Rules:
- Each idea should be a compelling title/hook (1-2 sentences max)
- Make them engaging and LinkedIn-appropriate
- Focus on professional insights, lessons learned, or industry trends
- Return as a JSON array of strings.`;
  } else {
    return `Improve this LinkedIn post by making it more engaging and compelling:

Original post:
"${data.input}"

Tone: ${toneInstructions[data.tone]}

Rules:
- Make the hook more compelling
- Improve clarity and flow
- Keep it professional yet conversational
- Maintain the original message and key points
- Return 3 improved variations as a JSON array of strings.`;
  }
};

export const fetchResults = async (data: FormData): Promise<string[]> => {
  // Use mock data if no API key is configured
  if (shouldUseMockData()) {
    console.log('Using mock data - no OpenAI API key configured');
    return fetchMockResults(data);
  }

  try {
    const apiKey = getApiKey();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: data.mode === 'generate' 
              ? "You're PostPilot, an AI assistant specialized in LinkedIn content generation. Create engaging, professional content that drives engagement."
              : "You're PostPilot, an AI assistant specialized in LinkedIn content optimization. Help improve tone, clarity, and hooks while maintaining the original message."
          },
          {
            role: 'user',
            content: buildPrompt(data)
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const result: APIResponse = await response.json();
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error('Invalid API response format');
    }

    const content = result.choices[0].message.content.trim();
    
    try {
      const parsedResults = JSON.parse(content);
      if (!Array.isArray(parsedResults)) {
        throw new Error('API response is not an array');
      }
      return parsedResults.filter(item => typeof item === 'string' && item.trim().length > 0);
    } catch (parseError) {
      // Fallback: if JSON parsing fails, try to extract content manually
      console.warn('Failed to parse JSON, using fallback extraction');
      return [content];
    }
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('API configuration error. Please check your OpenAI API key.');
      } else if (error.message.includes('401')) {
        throw new Error('Invalid OpenAI API key. Please check your credentials.');
      } else if (error.message.includes('429')) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
    }
    
    throw new Error(`Failed to ${data.mode} post. Please try again.`);
  }
};
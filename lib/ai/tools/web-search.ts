import { tool } from 'ai';
import { z } from 'zod';

export const webSearchSchema = z.object({
  query: z.string().min(1).max(512),
});

// --- Google Custom Search API (commented out for future use) ---
// const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
// const GOOGLE_CSE_ID = process.env.GOOGLE_SEARCH_CSE_ID;
//
// export async function webSearch({ query }: { query: string }) {
//   if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
//     throw new Error('Google Search API key or CSE ID not set');
//   }
//   const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}`;
//   const res = await fetch(url);
//   if (!res.ok) throw new Error('Google Search API error');
//   const data = await res.json();
//   return (data.items || []).map((item: any) => ({
//     title: item.title,
//     snippet: item.snippet,
//     url: item.link,
//   }));
// }

// --- Serper.dev API (active) ---
const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function webSearch({ query }: { query: string }) {
  if (!SERPER_API_KEY) {
    throw new Error('Serper API key not set');
  }
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': SERPER_API_KEY,
    },
    body: JSON.stringify({ q: query }),
  });
  if (!res.ok) throw new Error('Serper API error');
  const data = await res.json();
  // Serper returns results in data.organic
  return (data.organic || []).map((item: any) => ({
    title: item.title,
    snippet: item.snippet,
    url: item.link,
  }));
}

export const webSearchTool = tool({
  description: 'Perform a web search and return results with title, snippet, and url.',
  parameters: webSearchSchema,
  execute: webSearch,
}); 
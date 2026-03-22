import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are a senior news journalist at VioNews, a professional digital news platform for US readers. You write original, factual, engaging news articles.

STRICT RULES:
- Write 100% original content. NEVER copy sentences from any source material.
- Use the provided headline and summary ONLY as a reference for the topic.
- Write for a US English-speaking audience.
- Use journalistic tone: neutral, factual, professional.
- NEVER use these phrases: "As an AI", "According to our system", "In conclusion", "In summary", "It remains to be seen", "Only time will tell"
- Every article must read like it was written by a human journalist.
- Vary your opening sentence structure — do NOT start every article the same way.
- Write in third person. Do not address the reader directly.
- Do not fabricate specific quotes, statistics, or facts not implied by the source.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, excerpt, category, source } = await req.json();

    if (!title || !excerpt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Title and excerpt are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = `Write an original news article based on this topic reference:

TOPIC: ${title}
SUMMARY: ${excerpt}
CATEGORY: ${category || 'World News'}

Write exactly 4 paragraphs (400-500 words total):
Paragraph 1: Key facts — what happened, who is involved, when, and where.
Paragraph 2: Background and context — why this is happening, relevant history.
Paragraph 3: Why this matters specifically to US readers — economic impact, policy implications, or cultural relevance to Americans.
Paragraph 4: Expert outlook — what analysts or officials expect to happen next, potential consequences.

Separate paragraphs with double newlines. Do NOT include any headings, bullet points, or markdown formatting. Just plain text paragraphs.`;

    console.log('Generating article content with Google Gemini...');

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              maxOutputTokens: 2000,
              temperature: 0.75,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (generatedContent) {
            console.log('Article generated successfully via Gemini');
            return new Response(
              JSON.stringify({ success: true, content: generatedContent }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        if (response.status === 429) {
          if (attempt < 3) {
            console.log(`Rate limited on attempt ${attempt}, retrying...`);
            await response.text();
            await new Promise(r => setTimeout(r, 2000 * attempt));
            continue;
          }
          return new Response(
            JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (response.status >= 500 && attempt < 3) {
          console.log(`Attempt ${attempt} failed with ${response.status}, retrying...`);
          await response.text();
          await new Promise(r => setTimeout(r, 1000 * attempt));
          continue;
        }

        const errorText = await response.text();
        console.error('Gemini API error:', response.status, errorText.substring(0, 200));
        lastError = new Error(`Gemini API returned ${response.status}`);
      } catch (err) {
        console.error(`Attempt ${attempt} error:`, err);
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Failed to generate article after retries' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating article:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate article';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

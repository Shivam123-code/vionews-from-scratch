import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are a senior journalist at VioNews, a professional digital news platform for US readers. You write original, factual, engaging news articles.

Write this article with:
1. An original opening line that is NOT a restatement of the headline
2. At least ONE original analysis paragraph that says "What this means:" followed by VioNews analysis
3. A "VioNews Perspective" section at the end
4. Minimum 500 words (not 400)
5. Never start with the subject's name
6. Never use passive voice in first paragraph

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

// Groq free API — fast inference, no credits needed
const AI_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

    const GEMINI_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GROQ_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'GROQ_API_KEY secret not set in Supabase' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = `Write an original news article based on this topic reference:

TOPIC: ${title}
SUMMARY: ${excerpt}
CATEGORY: ${category || 'World News'}

Assign the most accurate category from: world, technology, business, politics, sports. Base it on article content, not source category. Government/law enforcement/elections → politics. International/war/diplomacy → world. Companies/markets/economy → business. Gadgets/software/AI/science → technology. Games/matches/athletes → sports.

Write a minimum of 500 words across these paragraphs:
Paragraph 1: Original opening — do NOT restate the headline, do NOT start with the subject's name, and do NOT use passive voice. Then cover the key facts: what happened, who is involved, when, and where.
Paragraph 2: Background and context — why this is happening, relevant history.
Paragraph 3: Why this matters specifically to US readers — economic impact, policy implications, or cultural relevance to Americans.
Paragraph 4: Begin with "What this means:" and provide original VioNews analysis of the implications.
Paragraph 5: Expert outlook — what analysts or officials expect to happen next, potential consequences.
Paragraph 6: Begin with "VioNews Perspective:" and close with VioNews's independent editorial perspective on the story.

Separate paragraphs with double newlines. Do NOT include any headings, bullet points, or markdown formatting. Just plain text paragraphs.`;

    console.log('Generating article content with OpenRouter...');

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(AI_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GEMINI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 2000,
            temperature: 0.75,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedContent = data.choices?.[0]?.message?.content;

          if (generatedContent) {
            console.log('Article generated successfully via OpenRouter');
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
        console.error('OpenRouter API error:', response.status, errorText.substring(0, 200));
        lastError = new Error(`OpenRouter API returned ${response.status}`);
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

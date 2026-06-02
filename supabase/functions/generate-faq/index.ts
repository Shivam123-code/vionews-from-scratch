import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

interface FaqItem { question: string; answer: string }

function buildPrompt(title: string, excerpt: string, content: string, category: string) {
  const body = (content || excerpt || '').slice(0, 3000);
  return `You are a news editor writing a FAQ section for a news article.

TITLE: ${title}
CATEGORY: ${category}
ARTICLE CONTENT:
${body}

Generate exactly 4 frequently-asked questions a reader would have after reading this article, with concise factual answers (2-3 sentences each, max 60 words). Questions must be specific to this article — not generic.

Respond ONLY with valid JSON in this exact shape:
{"faq":[{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}]}`;
}

async function generateFaq(apiKey: string, title: string, excerpt: string, content: string, category: string): Promise<FaqItem[]> {
  const response = await fetch(AI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [{ role: 'user', content: buildPrompt(title, excerpt, content, category) }],
      max_tokens: 900,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI gateway ${response.status}: ${err.slice(0, 120)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in FAQ response');
  const parsed = JSON.parse(match[0]);
  const faq = Array.isArray(parsed.faq) ? parsed.faq : [];
  return faq
    .filter((f: any) => f && typeof f.question === 'string' && typeof f.answer === 'string')
    .slice(0, 4);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { articleId, title, excerpt, content, category } = await req.json();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'AI not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!title) {
      return new Response(JSON.stringify({ success: false, error: 'title required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const faq = await generateFaq(apiKey, title, excerpt || '', content || '', category || 'News');

    // Optionally persist
    if (articleId && faq.length > 0) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && serviceKey) {
        const supabase = createClient(supabaseUrl, serviceKey);
        await supabase.from('articles').update({ faq }).eq('id', articleId);
      }
    }

    return new Response(JSON.stringify({ success: true, faq }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
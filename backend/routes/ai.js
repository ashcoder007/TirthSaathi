// backend/routes/ai.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const HF_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_MODEL = process.env.HUGGINGFACE_MODEL || 'google/flan-t5-base';

// ------------------
// Wikipedia requires User-Agent
// ------------------
const WIKI_HEADERS = {
  headers: {
    'User-Agent': 'TirthSaathi/1.0 (https://tirthsaathi.org; contact@tirthsaathi.org)'
  }
};

// ------------------
// Simple in-memory cache
// ------------------
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cache = new Map();

function setCache(key, value) {
  cache.set(key, { ts: Date.now(), value });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * POST /api/ai/query
 * body: { q: "question", useHF: true|false }
 */
router.post('/query', async (req, res) => {
  try {
    const q = (req.body?.q || '').trim();
    const useHF = !!req.body?.useHF;

    if (!q) {
      return res.status(400).json({ error: 'Missing query' });
    }

    const cacheKey = `${q}:${useHF ? 'hf' : 'wiki'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    // ------------------
    // 1) Wikipedia Search (WITH User-Agent)
    // ------------------
    const searchRes = await axios.get(
      'https://en.wikipedia.org/w/api.php',
      {
        params: {
          action: 'query',
          list: 'search',
          srsearch: q,
          format: 'json',
          srlimit: 3
        },
        timeout: 10000,
        ...WIKI_HEADERS
      }
    );

    const results = searchRes.data?.query?.search || [];

    const summaries = await Promise.all(
      results.map(async (r) => {
        try {
          const title = encodeURIComponent(r.title);
          const summaryRes = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
            {
              timeout: 10000,
              ...WIKI_HEADERS
            }
          );

          return {
            title: summaryRes.data.title,
            extract: summaryRes.data.extract,
            url: summaryRes.data.content_urls?.desktop?.page,
            thumbnail: summaryRes.data.thumbnail?.source || null
          };
        } catch {
          return {
            title: r.title,
            extract: '',
            url: `https://en.wikipedia.org/wiki/${r.title}`
          };
        }
      })
    );

    const baseResponse = { query: q, sources: summaries };

    // ------------------
    // 2) Wikipedia-only mode
    // ------------------
    if (!useHF) {
      setCache(cacheKey, baseResponse);
      return res.json(baseResponse);
    }

    // ------------------
    // 3) Hugging Face LLM
    // ------------------
    if (!HF_KEY) {
      return res.status(500).json({ error: 'Hugging Face API key not configured' });
    }

    // Keep context SHORT for FLAN
    const contextText = summaries
      .map(s => s.extract)
      .filter(Boolean)
      .join('\n')
      .slice(0, 800);

    const prompt = `
Question:
${q}

Context:
${contextText}

Answer in 4–5 simple sentences.
`;

    const hfPayload = {
      inputs: prompt,
      parameters: {
        max_new_tokens: 120,
        temperature: 0
      },
      options: {
        wait_for_model: true
      }
    };

    const hfRes = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      hfPayload,
      {
        headers: {
          Authorization: `Bearer ${HF_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    if (hfRes.data?.error) {
      throw new Error(hfRes.data.error);
    }

    let answer = '';

    if (Array.isArray(hfRes.data) && hfRes.data[0]?.generated_text) {
      answer = hfRes.data[0].generated_text;
    } else if (typeof hfRes.data === 'string') {
      answer = hfRes.data;
    } else {
      answer = JSON.stringify(hfRes.data);
    }

    const finalResponse = {
      ...baseResponse,
      hf: {
        model: HF_MODEL,
        answer
      }
    };

    setCache(cacheKey, finalResponse);
    return res.json(finalResponse);

  } catch (err) {
    console.error('AI/HF ERROR →', err?.response?.data || err.message);
    return res.status(500).json({ error: 'AI request failed' });
  }
});

module.exports = router;
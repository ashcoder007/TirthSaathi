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

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const PILGRIMAGE_KNOWLEDGE = [
  {
    title: 'Ram Ghat, Ujjain',
    aliases: ['ram ghat ujjain', 'ramghat ujjain', 'ram ghat', 'shipra ghat', 'kshipra ghat'],
    extract:
      'Ram Ghat is one of the most important bathing ghats on the Shipra River in Ujjain. Pilgrims visit it for holy snan, evening aarti, and rituals connected with ancestors. It is close to the Mahakaleshwar temple area, so many pilgrims combine Ram Ghat darshan with Mahakal darshan. For elderly pilgrims, visit during calmer morning or early evening hours and avoid crowded festival peaks unless accompanied.',
    tips: [
      'Best for: Shipra snan, evening aarti, and peaceful riverside darshan.',
      'Nearby: Mahakaleshwar Mandir, Harsiddhi Mata Temple, and Mahakal Lok.',
      'Carry footwear carefully because ghat steps can be wet and slippery.'
    ]
  },
  {
    title: 'Shri Mahakaleshwar Mandir, Ujjain',
    aliases: ['mahakaleshwar', 'mahakal', 'mahakal mandir', 'mahakaleshwar mandir', 'mahakaleshwar jyotirlinga'],
    extract:
      'Shri Mahakaleshwar Mandir in Ujjain is one of the twelve Jyotirlingas of Lord Shiva. It is especially known for Bhasma Aarti and is one of the main reasons pilgrims visit Ujjain. The temple area can become crowded, so pilgrims should check darshan timings, carry ID if required, and keep only essential items while entering.',
    tips: [
      'Best for: Jyotirlinga darshan and Bhasma Aarti.',
      'Nearby: Ram Ghat, Mahakal Lok, Harsiddhi Mata Temple.',
      'Book or confirm special darshan and aarti rules before visiting.'
    ]
  },
  {
    title: 'Kaal Bhairav Temple, Ujjain',
    aliases: ['kaal bhairav', 'kal bhairav', 'kaal bhairav mandir', 'kal bhairav mandir', 'kaal bhairav temple ujjain', 'kal bhairav ujjain'],
    extract:
      'Kaal Bhairav Temple in Ujjain is an important temple dedicated to Lord Bhairav, a fierce form of Lord Shiva. It is part of the traditional Ujjain pilgrimage circuit and is often visited along with Mahakaleshwar Mandir, Ram Ghat, Harsiddhi Mata Temple, and Mangalnath Temple. The temple is located away from the central Mahakal area, so pilgrims should plan transport and timing before visiting.',
    tips: [
      'Best for: Bhairav darshan and the Ujjain temple circuit.',
      'Nearby: Mangalnath Temple, Ram Ghat, and Mahakaleshwar Mandir.',
      'Travel with a companion if visiting late or during crowded festival periods.'
    ]
  },
  {
    title: 'Kashi Vishwanath Temple, Varanasi',
    aliases: ['kashi vishwanath', 'vishwanath temple', 'kashi vishwanath temple', 'varanasi jyotirlinga'],
    extract:
      'Kashi Vishwanath Temple in Varanasi is one of the most sacred Shiva temples and one of the twelve Jyotirlingas. Pilgrims usually combine temple darshan with Ganga snan, Dashashwamedh Ghat, and evening Ganga Aarti. The lanes near the temple are busy, so keep belongings light and follow official queue guidance.',
    tips: [
      'Best for: Jyotirlinga darshan and Kashi pilgrimage.',
      'Nearby: Dashashwamedh Ghat, Manikarnika Ghat, Annapurna Temple.',
      'Use official entry routes and avoid carrying restricted items.'
    ]
  },
  {
    title: 'Dashashwamedh Ghat, Varanasi',
    aliases: ['dashashwamedh ghat', 'ganga aarti varanasi', 'varanasi ganga aarti'],
    extract:
      'Dashashwamedh Ghat is one of the main ghats of Varanasi and is famous for the evening Ganga Aarti. Pilgrims visit for Ganga darshan, boat rides, and rituals. It becomes very crowded before aarti, so arrive early and keep a fixed meeting point with companions.',
    tips: [
      'Best for: Evening Ganga Aarti and Ganga darshan.',
      'Nearby: Kashi Vishwanath Temple and Godowlia area.',
      'Reach early for a safer viewing place, especially with elders.'
    ]
  },
  {
    title: 'Har Ki Pauri, Haridwar',
    aliases: ['har ki pauri', 'harki pauri', 'ganga aarti haridwar', 'haridwar ghat'],
    extract:
      'Har Ki Pauri is the most famous ghat in Haridwar and a major place for Ganga snan and evening Ganga Aarti. Pilgrims consider it highly sacred, and crowds gather heavily during aarti and festival days. Hold children and elders carefully near the steps and use designated bathing areas.',
    tips: [
      'Best for: Ganga snan and evening Ganga Aarti.',
      'Nearby: Mansa Devi Temple, Chandi Devi Temple, local markets.',
      'Steps can be wet; elders should use handrails and companion support.'
    ]
  },
  {
    title: 'Triveni Ghat, Rishikesh',
    aliases: ['triveni ghat', 'triveni ghat rishikesh', 'rishikesh ganga aarti'],
    extract:
      'Triveni Ghat is a major sacred ghat in Rishikesh, visited for Ganga snan, prayers, and evening aarti. It is calmer than many larger pilgrimage ghats but still becomes crowded during aarti time. It is a good starting point for pilgrims visiting Rishikesh temples and ashrams.',
    tips: [
      'Best for: Ganga snan, evening aarti, and peaceful prayer.',
      'Nearby: Bharat Mandir, Ram Jhula, Parmarth Niketan.',
      'Arrive before aarti if travelling with elders.'
    ]
  }
];

function findKnowledge(query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  return PILGRIMAGE_KNOWLEDGE.find((entry) =>
    entry.aliases.some((alias) => {
      const normalizedAlias = normalizeText(alias);
      return normalizedQuery === normalizedAlias || normalizedQuery.includes(normalizedAlias);
    })
  );
}

function buildKnowledgeAnswer(entry, query) {
  const tipText = entry.tips.map((tip) => `- ${tip}`).join('\n');
  return {
    query,
    answer: `${entry.extract}\n\nHelpful tips:\n${tipText}`,
    sources: [
      {
        title: entry.title,
        extract: entry.extract,
        url: null,
        thumbnail: null,
        curated: true
      }
    ],
    curated: true
  };
}

const STOP_WORDS = new Set([
  'about', 'tell', 'me', 'the', 'a', 'an', 'in', 'of', 'for', 'to', 'and',
  'mandir', 'temple', 'place', 'info', 'information', 'history', 'significance'
]);

function importantTokens(query) {
  return normalizeText(query)
    .split(' ')
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function buildWikiSearchQueries(query) {
  const normalized = normalizeText(query);
  const hasPilgrimWord = /\b(temple|mandir|ghat|aarti|jyotirlinga|ashram|devi|mahadev)\b/.test(normalized);
  const suffix = hasPilgrimWord ? '' : ' temple pilgrimage India';
  return Array.from(new Set([
    `${query}${suffix}`,
    `${query} Hindu temple`,
    query
  ]));
}

async function searchWikipedia(query) {
  const searchQueries = buildWikiSearchQueries(query);
  const allResults = [];

  for (const searchQuery of searchQueries) {
    const searchRes = await axios.get(
      'https://en.wikipedia.org/w/api.php',
      {
        params: {
          action: 'query',
          list: 'search',
          srsearch: searchQuery,
          format: 'json',
          srlimit: 5
        },
        timeout: 10000,
        ...WIKI_HEADERS
      }
    );

    allResults.push(...(searchRes.data?.query?.search || []));
  }

  const seen = new Set();
  return allResults.filter((result) => {
    const key = normalizeText(result.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function getWikipediaSummaries(results) {
  return await Promise.all(
    results.slice(0, 8).map(async (r) => {
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
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title)}`
        };
      }
    })
  );
}

function scoreSummary(summary, query) {
  const tokens = importantTokens(query);
  const title = normalizeText(summary.title);
  const extract = normalizeText(summary.extract);
  const combined = `${title} ${extract}`;

  let score = 0;
  tokens.forEach((token) => {
    if (title.includes(token)) score += 5;
    if (extract.includes(token)) score += 2;
  });

  if (/\btemple|mandir|ghat|aarti|jyotirlinga|ashram|devi|mahadev|shiva|vishnu|ganga\b/.test(combined)) {
    score += 4;
  }
  if (tokens.length && tokens.every((token) => combined.includes(token))) {
    score += 8;
  }

  return score;
}

function buildAutomaticAnswer(query, summaries) {
  const ranked = summaries
    .filter((summary) => summary.extract)
    .map((summary) => ({ ...summary, score: scoreSummary(summary, query) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best || best.score < 5) {
    return {
      query,
      answer:
        'I could not find a reliable pilgrimage-specific answer for this query. Try adding the city name and place type, for example "Kal Bhairav Mandir Ujjain" or "Triveni Ghat Rishikesh".',
      sources: ranked.slice(0, 3)
    };
  }

  const related = ranked
    .slice(1, 3)
    .map((item) => item.title)
    .filter(Boolean);
  const relatedText = related.length ? `\n\nRelated places/sources: ${related.join(', ')}.` : '';

  return {
    query,
    answer: `${best.title}: ${best.extract}${relatedText}\n\nPilgrim note: Please confirm current timings, entry rules, and crowd conditions locally before visiting.`,
    sources: ranked.slice(0, 3),
    automatic: true
  };
}

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

    const knowledgeMatch = findKnowledge(q);
    if (knowledgeMatch) {
      const curatedResponse = buildKnowledgeAnswer(knowledgeMatch, q);
      setCache(`curated:${q}`, curatedResponse);
      return res.json(curatedResponse);
    }

    const cacheKey = `${q}:${useHF ? 'hf' : 'wiki'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const results = await searchWikipedia(q);
    const summaries = await getWikipediaSummaries(results);
    const baseResponse = buildAutomaticAnswer(q, summaries);

    // ------------------
    // 2) Source-grounded automatic mode
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

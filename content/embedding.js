/**
 * Embedding API client - OpenAI embeddings for semantic similarity.
 * Used by content script; requires API key from options.
 */

const EMBEDDING_API_URL = 'https://api.openai.com/v1/embeddings';
const EMBEDDING_MODEL = 'text-embedding-3-small';

/**
 * @param {string} apiKey - OpenAI API key
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
async function getEmbeddings(apiKey, texts) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is required. Set it in extension options.');
  }
  const filtered = texts.filter((t) => t && String(t).trim().length > 0);
  if (filtered.length === 0) return [];

  const response = await fetch(EMBEDDING_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: filtered,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message = err.error?.message || response.statusText || `HTTP ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const order = data.data.slice().sort((a, b) => a.index - b.index);
  return order.map((d) => d.embedding);
}

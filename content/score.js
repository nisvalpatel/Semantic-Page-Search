/**
 * Similarity scoring - cosine similarity between query and chunk embeddings.
 */

/**
 * Cosine similarity between two vectors.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Score chunks by similarity to query embedding. Higher = more relevant.
 * @param {number[]} queryEmbedding
 * @param {number[][]} chunkEmbeddings
 * @param {number} topK - max number of chunks to return
 * @returns {Array<{ index: number, score: number }>}
 */
function scoreChunks(queryEmbedding, chunkEmbeddings, topK = 15) {
  const scored = chunkEmbeddings.map((emb, index) => ({
    index,
    score: cosineSimilarity(queryEmbedding, emb),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter((s) => s.score > 0.1);
}

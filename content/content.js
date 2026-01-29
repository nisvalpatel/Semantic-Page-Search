/**
 * Semantic Find - Content script
 * Runs in the page context to extract text, score chunks, and highlight matches.
 */

(function () {
  'use strict';

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'SEMANTIC_SEARCH') {
      handleSearch(message.query, message.apiKey).then(sendResponse);
      return true; // async response
    }
    if (message.type === 'CLEAR_HIGHLIGHTS') {
      clearHighlights();
      sendResponse({ ok: true });
      return false;
    }
  });

  async function handleSearch(query, apiKey) {
    clearHighlights();

    const chunks = extractPageChunks();
    if (chunks.length === 0) {
      return { matches: 0, error: 'No text to search on this page.' };
    }

    const texts = [query, ...chunks.map((c) => c.text)];
    let queryEmb;
    let chunkEmbs;
    try {
      const allEmbs = await getEmbeddings(apiKey, texts);
      queryEmb = allEmbs[0];
      chunkEmbs = allEmbs.slice(1);
    } catch (err) {
      return { matches: 0, error: err.message || 'Embedding failed.' };
    }

    const scored = scoreChunks(queryEmb, chunkEmbs, 15);
    let matchCount = 0;
    for (const { index } of scored) {
      const chunk = chunks[index];
      if (chunk?.ranges?.length) {
        highlightRanges(chunk.ranges);
        matchCount += 1;
      }
    }

    return { matches: matchCount, error: null };
  }
})();

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
    return { matches: 0, error: null };
  }

  function clearHighlights() {}
})();

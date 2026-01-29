'use strict';

const queryEl = document.getElementById('query');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const statusEl = document.getElementById('status');

searchBtn.addEventListener('click', runSearch);
clearBtn.addEventListener('click', clearHighlights);
queryEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runSearch();
});

async function runSearch() {
  const query = (queryEl.value || '').trim();
  if (!query) {
    setStatus('Enter a search query.', 'error');
    return;
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    setStatus('Set your API key in extension options.', 'error');
    return;
  }

  setStatus('Searching…', 'loading');
  searchBtn.disabled = true;
  queryEl.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setStatus('No active tab.', 'error');
      return;
    }
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'SEMANTIC_SEARCH',
      query,
      apiKey,
    });
    if (response?.error) {
      setStatus(response.error, 'error');
    } else {
      setStatus(response?.matches != null ? `${response.matches} match(es) found.` : 'Done.', 'success');
    }
  } catch (err) {
    setStatus(err.message || 'Search failed.', 'error');
  } finally {
    searchBtn.disabled = false;
    queryEl.disabled = false;
  }
}

async function clearHighlights() {
  setStatus('', '');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, { type: 'CLEAR_HIGHLIGHTS' });
      setStatus('Highlights cleared.', 'success');
    }
  } catch {
    setStatus('Could not clear (reload page if needed).', 'error');
  }
}

function setStatus(text, type) {
  statusEl.textContent = text;
  statusEl.className = 'status' + (type ? ` ${type}` : '');
}

function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiKey'], (result) => resolve(result.apiKey || ''));
  });
}

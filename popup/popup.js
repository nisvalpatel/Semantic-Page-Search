'use strict';

const setupView = document.getElementById('setupView');
const searchView = document.getElementById('searchView');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const queryEl = document.getElementById('query');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const statusEl = document.getElementById('status');
const openSettingsEl = document.getElementById('openSettings');

(async function init() {
  const key = await getApiKey();
  if (key) {
    setupView.hidden = true;
    searchView.hidden = false;
  } else {
    setupView.hidden = false;
    searchView.hidden = true;
  }
})();

saveKeyBtn.addEventListener('click', saveKey);
apiKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveKey();
});
searchBtn.addEventListener('click', runSearch);
clearBtn.addEventListener('click', clearHighlights);
openSettingsEl.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
queryEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runSearch();
});

async function saveKey() {
  const key = (apiKeyInput.value || '').trim();
  if (!key) {
    apiKeyInput.focus();
    return;
  }
  await new Promise((resolve) => {
    chrome.storage.sync.set({ apiKey: key }, resolve);
  });
  setupView.hidden = true;
  searchView.hidden = false;
  apiKeyInput.value = '';
}

async function runSearch() {
  const query = (queryEl.value || '').trim();
  if (!query) {
    setStatus('Enter a search query.', 'error');
    return;
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    setStatus('Add your API key in Settings, then try again.', 'error');
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
    } else if (response?.matches === 0) {
      setStatus('No matching sections found.', '');
    } else {
      setStatus(response?.matches != null ? `${response.matches} section(s) highlighted.` : 'Done.', 'success');
    }
  } catch (err) {
    const msg = err.message || 'Search failed.';
    const hint = msg.includes('Receiving end') || msg.includes('Could not establish')
      ? "This page can't be searched. Try a normal webpage."
      : msg;
    setStatus(hint, 'error');
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

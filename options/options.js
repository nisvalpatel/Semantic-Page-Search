'use strict';

const apiKeyEl = document.getElementById('apiKey');
const saveBtn = document.getElementById('save');
const statusEl = document.getElementById('status');

chrome.storage.sync.get(['apiKey'], (result) => {
  if (result.apiKey) apiKeyEl.value = result.apiKey;
});

saveBtn.addEventListener('click', () => {
  const value = (apiKeyEl.value || '').trim();
  chrome.storage.sync.set({ apiKey: value }, () => {
    statusEl.textContent = value ? 'Saved.' : 'Cleared.';
    statusEl.className = 'status';
    setTimeout(() => { statusEl.textContent = ''; }, 2000);
  });
});

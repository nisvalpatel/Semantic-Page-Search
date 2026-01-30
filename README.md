# Semantic-Page-Search

**Semantic Find** is a Chrome extension that acts like a smarter Ctrl+F. Instead of searching for exact text matches, it uses embeddings to understand the meaning of your query and highlights the most relevant sections of a page, even if the wording is different.

## Features

- **Meaning-based search** – Find content by concept, not just keywords.
- **Highlighted sections** – Top matching passages are highlighted on the page.
- **Clear highlights** – One click to remove all highlights.

## Setup

1. **Load the extension in Chrome**
   - Open `chrome://extensions`
   - Turn on **Developer mode**
   - Click **Load unpacked** and select this folder

2. **Set your OpenAI API key**
   - Right-click the Semantic Find icon → **Options**
   - Enter your [OpenAI API key](https://platform.openai.com/api-keys) and click **Save**  
   The key is stored in Chrome sync storage and is only sent to OpenAI for embeddings.

## Usage

1. Open any normal webpage (not `chrome://` or the New Tab page).
2. Click the Semantic Find icon to open the popup.
3. Type what you’re looking for (e.g. “how to reset password”) and click **Find**.
4. Matching sections are highlighted in yellow. Use **Clear highlights** to remove them.

## Requirements

- Chrome (Manifest V3)
- OpenAI API key (embeddings: `text-embedding-3-small`)

## Project structure

- `manifest.json` – Extension manifest and permissions
- `popup/` – Popup UI (search input, status, clear button)
- `options/` – Options page for API key
- `content/` – Content scripts: extraction, embeddings, scoring, highlighting


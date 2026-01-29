/**
 * Page text extraction - walks the DOM and returns text chunks with DOM ranges
 * so we can highlight them later.
 */

const MIN_CHUNK_LENGTH = 40;
const MAX_CHUNK_LENGTH = 300;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG']);

/**
 * @typedef {{ text: string, ranges: Array<{ node: Text, start: number, end: number }> }} Chunk
 * @returns {Chunk[]}
 */
function extractPageChunks() {
  const chunks = [];
  const textNodes = getVisibleTextNodes(document.body);
  let currentText = '';
  let currentRanges = [];

  for (const { node, text } of textNodes) {
    const len = text.length;
    if (len === 0) continue;

    if (currentText.length + len <= MAX_CHUNK_LENGTH) {
      currentText += (currentText ? ' ' : '') + text;
      currentRanges.push({ node, start: 0, end: len });
    } else {
      if (currentText.length >= MIN_CHUNK_LENGTH) {
        chunks.push({ text: currentText.trim(), ranges: currentRanges });
      }
      currentText = text;
      currentRanges = [{ node, start: 0, end: len }];
    }
  }
  if (currentText.length >= MIN_CHUNK_LENGTH) {
    chunks.push({ text: currentText.trim(), ranges: currentRanges });
  }

  return chunks;
}

/**
 * @returns {Array<{ node: Text, text: string }>}
 */
function getVisibleTextNodes(root) {
  const result = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const el = node.parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      const tag = el.tagName;
      if (SKIP_TAGS.has(tag)) return NodeFilter.FILTER_REJECT;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return NodeFilter.FILTER_REJECT;
      const text = node.textContent.trim();
      if (text.length === 0) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let n;
  while ((n = walker.nextNode())) {
    result.push({ node: n, text: n.textContent.trim() });
  }
  return result;
}

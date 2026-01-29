/**
 * Highlight and unhighlight DOM ranges. Wraps matching text in spans.
 */

const HIGHLIGHT_CLASS = 'semantic-find-highlight';
const HIGHLIGHT_STYLE_ID = 'semantic-find-highlight-style';

/** @type {HTMLElement[]} */
let highlightedSpans = [];

function ensureHighlightStyle() {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `.${HIGHLIGHT_CLASS}{background:rgba(251,191,36,0.45);border-radius:2px;}`;
  (document.head || document.documentElement).appendChild(style);
}

/**
 * Highlight a set of ranges (each has node, start, end).
 * @param {Array<{ node: Text, start: number, end: number }>} ranges
 */
function highlightRanges(ranges) {
  ensureHighlightStyle();
  for (const { node, start, end } of ranges) {
    const text = node.textContent;
    if (start >= text.length || end > text.length) continue;
    const before = text.slice(0, start);
    const match = text.slice(start, end);
    const after = text.slice(end);
    const parent = node.parentNode;
    if (!parent) continue;
    const span = document.createElement('span');
    span.className = HIGHLIGHT_CLASS;
    span.textContent = match;
    const frag = document.createDocumentFragment();
    if (before) frag.appendChild(document.createTextNode(before));
    frag.appendChild(span);
    if (after) frag.appendChild(document.createTextNode(after));
    parent.replaceChild(frag, node);
    highlightedSpans.push(span);
  }
}

function clearHighlights() {
  for (const span of highlightedSpans) {
    const parent = span.parentNode;
    if (!parent) continue;
    const text = document.createTextNode(span.textContent);
    parent.replaceChild(text, span);
  }
  highlightedSpans = [];
}

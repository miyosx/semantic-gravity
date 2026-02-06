/**
 * Semantic Gravity v2 — Gestell → Gelassenheit
 *
 * Hold anywhere on the text. A wave radiates from the touch point,
 * transforming extraction/domination language (Gestell) into
 * care/relational language (Gelassenheit). Original words persist
 * as palimpsest underneath.
 */

// ── Configuration ──────────────────────────────────────────────
const CONFIG = {
  waveSpeed: 200,          // px/s
  morphDuration: 600,      // ms for visual morph transition
  maxConcurrentTransforms: 5,
  transformStagger: 50,    // ms between queued transforms
  grammarCheckInterval: 2000, // ms between grammar rewrites

  // LM Studio API
  lmStudioUrl: 'http://localhost:1234/v1/chat/completions',
  lmStudioModel: 'mistralai/ministral-3-3b',
};

// ── Gestell → Gelassenheit Map ─────────────────────────────────
const GESTELL_MAP = new Map([
  ['optimize', 'tend'],
  ['optimise', 'tend'],
  ['extract', 'receive'],
  ['users', 'dwellers'],
  ['user', 'dweller'],
  ['data', 'traces'],
  ['resources', 'gifts'],
  ['resource', 'gift'],
  ['scale', 'root'],
  ['scaling', 'rooting'],
  ['disrupt', 'listen'],
  ['disruption', 'listening'],
  ['disruptive', 'attentive'],
  ['leverage', 'hold'],
  ['leveraging', 'holding'],
  ['deploy', 'place'],
  ['deployment', 'placement'],
  ['capture', 'welcome'],
  ['capturing', 'welcoming'],
  ['target', 'invite'],
  ['targeting', 'inviting'],
  ['targeted', 'invited'],
  ['exploit', 'cherish'],
  ['exploiting', 'cherishing'],
  ['consume', 'savor'],
  ['consuming', 'savoring'],
  ['consumer', 'guest'],
  ['consumers', 'guests'],
  ['consumption', 'savoring'],
  ['efficiency', 'care'],
  ['efficient', 'careful'],
  ['growth', 'flourishing'],
  ['platform', 'ground'],
  ['platforms', 'grounds'],
  ['pipeline', 'path'],
  ['pipelines', 'paths'],
  ['engagement', 'presence'],
  ['content', 'speech'],
  ['network', 'web'],
  ['networks', 'webs'],
  ['monetize', 'share'],
  ['monetise', 'share'],
  ['monetization', 'sharing'],
  ['stakeholders', 'neighbors'],
  ['stakeholder', 'neighbor'],
  ['deliverables', 'offerings'],
  ['deliverable', 'offering'],
  ['assets', 'belongings'],
  ['asset', 'belonging'],
  ['bandwidth', 'attention'],
  ['interface', 'threshold'],
  ['interfaces', 'thresholds'],
  ['ecosystem', 'umwelt'],
  ['ecosystems', 'umwelten'],
  ['technology', 'craft'],
  ['maximize', 'deepen'],
  ['maximise', 'deepen'],
  ['minimize', 'soften'],
  ['minimise', 'soften'],
  ['algorithm', 'pattern'],
  ['algorithms', 'patterns'],
  ['metrics', 'qualities'],
  ['metric', 'quality'],
  ['productivity', 'attentiveness'],
  ['productive', 'attentive'],
  ['automate', 'apprentice'],
  ['automation', 'apprenticeship'],
  ['implement', 'cultivate'],
  ['implementation', 'cultivation'],
  ['execute', 'enact'],
  ['execution', 'enactment'],
  ['iterate', 'revisit'],
  ['iteration', 'return'],
  ['output', 'yield'],
  ['outputs', 'yields'],
  ['input', 'offering'],
  ['inputs', 'offerings'],
  ['performance', 'presence'],
  ['workflow', 'rhythm'],
  ['workflows', 'rhythms'],
  ['framework', 'dwelling'],
  ['frameworks', 'dwellings'],
  ['solution', 'response'],
  ['solutions', 'responses'],
  ['impact', 'touch'],
  ['impactful', 'touching'],
  ['innovation', 'renewal'],
  ['innovative', 'renewing'],
  ['strategy', 'way'],
  ['strategic', 'thoughtful'],
  ['profit', 'sustenance'],
  ['profits', 'sustenance'],
  ['revenue', 'nourishment'],
  ['brand', 'character'],
  ['brands', 'characters'],
  ['market', 'commons'],
  ['markets', 'commons'],
  ['compete', 'cooperate'],
  ['competition', 'cooperation'],
  ['competitive', 'cooperative'],
  ['demand', 'need'],
  ['demands', 'needs'],
  ['supply', 'provide'],
  ['acquisition', 'welcome'],
  ['retain', 'remember'],
  ['retention', 'memory'],
  ['convert', 'invite'],
  ['conversion', 'invitation'],
  ['funnel', 'gathering'],
  ['funnels', 'gatherings'],
  ['dashboard', 'hearth'],
  ['dashboards', 'hearths'],
  ['aggregate', 'gather'],
  ['accelerate', 'ripen'],
]);

// ── Stop Words (function words — skip for individual transform) ──
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'nor', 'so', 'yet', 'for',
  'in', 'on', 'at', 'to', 'by', 'of', 'up', 'off', 'out', 'from',
  'with', 'as', 'into', 'over', 'about', 'after', 'before', 'between',
  'through', 'during', 'without', 'within', 'along', 'across', 'behind',
  'beyond', 'under', 'above', 'below', 'near', 'around',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'has', 'have', 'had', 'do', 'does', 'did',
  'will', 'would', 'shall', 'should', 'may', 'might', 'can', 'could', 'must',
  'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'he', 'him', 'his',
  'she', 'her', 'it', 'its', 'they', 'them', 'their', 'this', 'that',
  'these', 'those', 'who', 'whom', 'which', 'what', 'whose',
  'not', 'no', 'if', 'then', 'than', 'when', 'where', 'how', 'while',
  'also', 'just', 'very', 'too', 'each', 'every', 'all', 'both',
  'some', 'any', 'few', 'more', 'most', 'other', 'such',
]);

// ── Soft Map (content words → care language, fallback when LLM unavailable) ──
const SOFT_MAP = new Map([
  ['build', 'weave'],
  ['building', 'weaving'],
  ['drive', 'guide'],
  ['driving', 'guiding'],
  ['push', 'offer'],
  ['pushing', 'offering'],
  ['force', 'invite'],
  ['forcing', 'inviting'],
  ['control', 'steward'],
  ['controlling', 'stewarding'],
  ['manage', 'tend'],
  ['managing', 'tending'],
  ['track', 'witness'],
  ['tracking', 'witnessing'],
  ['deliver', 'bring'],
  ['delivering', 'bringing'],
  ['process', 'practice'],
  ['processing', 'practicing'],
  ['system', 'ecology'],
  ['systems', 'ecologies'],
  ['power', 'strength'],
  ['powerful', 'gentle'],
  ['fast', 'patient'],
  ['faster', 'gentler'],
  ['tool', 'instrument'],
  ['tools', 'instruments'],
  ['machine', 'vessel'],
  ['machines', 'vessels'],
  ['device', 'companion'],
  ['devices', 'companions'],
  ['click', 'touch'],
  ['clicking', 'touching'],
  ['generate', 'grow'],
  ['generating', 'growing'],
  ['launch', 'begin'],
  ['launching', 'beginning'],
  ['analyze', 'contemplate'],
  ['analyzing', 'contemplating'],
  ['test', 'listen'],
  ['testing', 'listening'],
]);

// ── State ──────────────────────────────────────────────────────
const state = {
  paragraphs: [],        // [{sentences: [{words: [wordObj...], needsGrammarCheck, needsRewrite}]}]
  allWords: [],          // flat list of all word objects (for wave distance checks)

  waveOrigin: null,      // {x, y} in page coordinates
  waveStartTime: null,
  waveRadius: 0,
  isWaveActive: false,
  waveAnimFrame: null,

  transformQueue: [],
  activeTransforms: new Set(),

  grammarTimer: null,
  llmConnected: false,
};

// ── LLM ────────────────────────────────────────────────────────
async function callLLM(prompt, maxTokens = 80) {
  try {
    const response = await fetch(CONFIG.lmStudioUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CONFIG.lmStudioModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });
    if (!response.ok) throw new Error(`LLM API error: ${response.status}`);
    const data = await response.json();
    return cleanLLMResponse(data.choices[0].message.content.trim());
  } catch (err) {
    console.error('LLM call failed:', err);
    return null;
  }
}

function cleanLLMResponse(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, ' ')
    .replace(/`/g, '')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .trim();
}

// ── Input System ───────────────────────────────────────────────
function initInputOverlay() {
  const overlay = document.getElementById('input-overlay');
  const urlInput = document.getElementById('url-input');
  const urlBtn = document.getElementById('url-load-btn');
  const pasteInput = document.getElementById('paste-input');
  const pasteBtn = document.getElementById('paste-load-btn');
  const errorEl = document.getElementById('input-error');

  function showError(msg) {
    errorEl.textContent = msg;
  }

  function clearError() {
    errorEl.textContent = '';
  }

  urlBtn.addEventListener('click', async () => {
    clearError();
    const url = urlInput.value.trim();
    if (!url) { showError('Enter a URL.'); return; }

    try {
      urlBtn.textContent = 'Loading...';
      urlBtn.disabled = true;
      const resp = await fetch('/fetch?url=' + encodeURIComponent(url));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const html = data.html;
      const text = extractTextFromHTML(html);
      if (!text || text.length < 10) {
        showError('Could not extract meaningful text from that URL.');
        return;
      }
      loadText(text);
      dismissOverlay();
    } catch (err) {
      console.error('URL fetch failed:', err);
      showError('Could not fetch URL. Make sure you started the server with: python3 server.py');
    } finally {
      urlBtn.textContent = 'Load';
      urlBtn.disabled = false;
    }
  });

  pasteBtn.addEventListener('click', () => {
    clearError();
    const text = pasteInput.value.trim();
    if (!text || text.length < 10) {
      showError('Paste some text (at least a sentence or two).');
      return;
    }
    loadText(text);
    dismissOverlay();
  });

  // Allow Enter in URL field
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') urlBtn.click();
  });
}

function extractTextFromHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove non-content elements
  const removeSelectors = 'script, style, nav, footer, header, aside, [role="navigation"], [role="banner"], [role="contentinfo"]';
  doc.querySelectorAll(removeSelectors).forEach(el => el.remove());

  let text = (doc.body || doc.documentElement).innerText || '';

  // Normalize whitespace but preserve paragraph breaks
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

function dismissOverlay() {
  const overlay = document.getElementById('input-overlay');
  overlay.classList.add('fade-out');
  setTimeout(() => { overlay.style.display = 'none'; }, 800);
}

// ── Text Parsing & Rendering ───────────────────────────────────
function loadText(rawText) {
  // Parse into paragraphs → sentences → words
  const paraTexts = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  let globalWordIndex = 0;
  state.paragraphs = [];
  state.allWords = [];

  paraTexts.forEach((paraText, pIdx) => {
    // Split into sentences (simple heuristic)
    const sentenceTexts = splitSentences(paraText.trim());
    const sentences = sentenceTexts.map((sText, sIdx) => {
      const tokens = sText.split(/\s+/).filter(t => t.length > 0);
      const words = tokens.map(token => {
        const lower = token.replace(/[^a-zA-Z]/g, '').toLowerCase();
        const isGestell = GESTELL_MAP.has(lower);
        const wordObj = {
          original: token,
          current: token,
          isGestell,
          gelassenheitTarget: isGestell ? GESTELL_MAP.get(lower) : null,
          transformed: false,
          waveReached: false,
          isAnchor: false,
          element: null,
          centerX: 0,
          centerY: 0,
          globalIndex: globalWordIndex,
          sentenceIndex: sIdx,
          paragraphIndex: pIdx,
        };
        state.allWords.push(wordObj);
        globalWordIndex++;
        return wordObj;
      });
      return { words, needsGrammarCheck: false, needsRewrite: false };
    });
    state.paragraphs.push({ sentences });
  });

  renderText();
  cacheWordPositions();
  attachWaveEvents();
  startGrammarChecker();

  const gestellCount = state.allWords.filter(w => w.isGestell).length;
  updateDebug(`Loaded ${state.allWords.length} words. ${gestellCount} Gestell terms found. Hold anywhere to begin.`);
}

function splitSentences(text) {
  // Split on sentence-ending punctuation followed by space or end-of-string
  const parts = text.match(/[^.!?]+[.!?]+[\s]?|[^.!?]+$/g);
  if (!parts) return [text];
  return parts.map(s => s.trim()).filter(s => s.length > 0);
}

function renderText() {
  const display = document.getElementById('text-display');
  display.innerHTML = '';

  state.paragraphs.forEach((para) => {
    const pEl = document.createElement('p');
    para.sentences.forEach((sentence) => {
      sentence.words.forEach((word, wIdx) => {
        const span = document.createElement('span');
        span.className = 'word' + (word.isGestell ? ' gestell-marker' : '');
        span.dataset.index = word.globalIndex;
        span.innerHTML = `<span class="word-inner"><span class="word-ghost"></span><span class="word-current">${escapeHTML(word.current)}</span><span class="word-next"></span></span>`;
        word.element = span;
        pEl.appendChild(span);

        // Add space between words (text node)
        if (wIdx < sentence.words.length - 1) {
          pEl.appendChild(document.createTextNode(' '));
        }
      });
      // Space between sentences
      pEl.appendChild(document.createTextNode(' '));
    });
    display.appendChild(pEl);
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function cacheWordPositions() {
  state.allWords.forEach(word => {
    if (!word.element) return;
    const rect = word.element.getBoundingClientRect();
    word.centerX = rect.left + rect.width / 2 + window.scrollX;
    word.centerY = rect.top + rect.height / 2 + window.scrollY;
  });
}

// Recalculate on resize
window.addEventListener('resize', () => {
  if (state.allWords.length > 0) cacheWordPositions();
});

// ── Wave Mechanics ─────────────────────────────────────────────
function attachWaveEvents() {
  const display = document.getElementById('text-display');

  display.addEventListener('mousedown', handleWaveStart);
  document.addEventListener('mouseup', handleWaveEnd);

  display.addEventListener('touchstart', handleWaveStart, { passive: false });
  document.addEventListener('touchend', handleWaveEnd);
  document.addEventListener('touchcancel', handleWaveEnd);
}

function handleWaveStart(e) {
  e.preventDefault();

  // Recache all word positions (they shift after transformations cause reflow)
  cacheWordPositions();

  // Clear stale state from previous wave
  state.activeTransforms.clear();
  state.allWords.forEach(w => { w.waveReached = false; });

  // Get coordinates
  let clientX, clientY;
  if (e.touches) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  // Use page coordinates (account for scroll)
  state.waveOrigin = {
    x: clientX + window.scrollX,
    y: clientY + window.scrollY,
    clientX,
    clientY,
  };
  state.waveStartTime = performance.now();
  state.waveRadius = 0;
  state.isWaveActive = true;
  state.transformQueue = [];

  // Immediately transform the clicked word
  const clickedEl = e.target.closest('.word');
  if (clickedEl) {
    const idx = parseInt(clickedEl.dataset.index, 10);
    const clickedWord = state.allWords[idx];
    if (clickedWord && !clickedWord.transformed) {
      clickedWord.waveReached = true;
      if (clickedWord.isGestell) {
        // Gestell word: immediate map transform
        state.transformQueue.push(clickedWord);
        state.activeTransforms.add(clickedWord.globalIndex);
        transformGestellWord(clickedWord);
      } else {
        // Non-Gestell content word: LLM or SOFT_MAP transform
        const lower = clickedWord.current.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (!STOP_WORDS.has(lower) && lower.length > 0) {
          transformClickedWord(clickedWord);
        }
      }
    }
  }

  // Show wave ring
  const ring = document.getElementById('wave-ring');
  ring.classList.add('active');

  updateDebug('Wave expanding...');

  // Start animation loop
  state.waveAnimFrame = requestAnimationFrame(waveAnimLoop);
}

function waveAnimLoop(timestamp) {
  if (!state.isWaveActive) return;

  const elapsed = (timestamp - state.waveStartTime) / 1000; // seconds
  state.waveRadius = elapsed * CONFIG.waveSpeed;

  // Update wave ring visual
  const ring = document.getElementById('wave-ring');
  const diameter = state.waveRadius * 2;
  ring.style.width = diameter + 'px';
  ring.style.height = diameter + 'px';
  ring.style.left = state.waveOrigin.clientX + 'px';
  ring.style.top = state.waveOrigin.clientY + 'px';
  ring.style.borderColor = `rgba(255, 107, 107, ${Math.max(0.05, 0.3 - elapsed * 0.02)})`;

  // Check words within wave radius
  checkWaveReach();

  // Process transform queue
  processTransformQueue();

  state.waveAnimFrame = requestAnimationFrame(waveAnimLoop);
}

function handleWaveEnd() {
  if (!state.isWaveActive) return;
  state.isWaveActive = false;

  cancelAnimationFrame(state.waveAnimFrame);

  // Hide wave ring
  const ring = document.getElementById('wave-ring');
  ring.classList.remove('active');

  const transformedCount = state.allWords.filter(w => w.transformed).length;
  updateDebug(`Wave stopped. ${transformedCount} words transformed.`);
}

function checkWaveReach() {
  state.allWords.forEach(word => {
    if (word.waveReached) return;

    const dx = word.centerX - state.waveOrigin.x;
    const dy = word.centerY - state.waveOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= state.waveRadius) {
      word.waveReached = true;

      // Queue untransformed Gestell words for map transform
      if (word.isGestell && !word.transformed &&
          !state.transformQueue.includes(word) &&
          !state.activeTransforms.has(word.globalIndex)) {
        state.transformQueue.push(word);
      }

      // Mark sentence for rewrite (any word reached triggers this)
      const para = state.paragraphs[word.paragraphIndex];
      if (para) {
        const sentence = para.sentences[word.sentenceIndex];
        if (sentence) {
          sentence.needsRewrite = true;
        }
      }
    }
  });
}

function processTransformQueue() {
  while (
    state.transformQueue.length > 0 &&
    state.activeTransforms.size < CONFIG.maxConcurrentTransforms
  ) {
    const word = state.transformQueue.shift();
    if (word.transformed || state.activeTransforms.has(word.globalIndex)) continue;
    state.activeTransforms.add(word.globalIndex);

    // Stagger slightly
    setTimeout(() => {
      transformGestellWord(word);
    }, CONFIG.transformStagger * state.activeTransforms.size);
  }
}

// ── Palimpsest Transformation ──────────────────────────────────
function transformGestellWord(word) {
  if (word.transformed) {
    state.activeTransforms.delete(word.globalIndex);
    return;
  }

  const el = word.element;
  const ghostEl = el.querySelector('.word-ghost');
  const currentEl = el.querySelector('.word-current');
  const nextEl = el.querySelector('.word-next');

  // Determine target: use map, preserving original capitalization pattern
  let target = word.gelassenheitTarget;
  if (!target) {
    // Shouldn't happen for isGestell words, but fallback
    state.activeTransforms.delete(word.globalIndex);
    return;
  }

  // Preserve capitalization of original
  target = matchCase(word.current, target);

  // Set ghost to original word
  ghostEl.textContent = word.current;

  // Set next to target word
  nextEl.textContent = target;

  // Trigger morph
  el.classList.add('morphing', 'primary-change');

  setTimeout(() => {
    currentEl.textContent = target;
    word.current = target;
    word.transformed = true;
    word.isAnchor = true;
    el.classList.remove('morphing', 'primary-change');
    el.classList.add('transformed', 'anchor');
    el.classList.remove('gestell-marker');

    nextEl.textContent = '';

    state.activeTransforms.delete(word.globalIndex);

    // Mark sentence for grammar check
    const para = state.paragraphs[word.paragraphIndex];
    if (para) {
      const sentence = para.sentences[word.sentenceIndex];
      if (sentence) sentence.needsGrammarCheck = true;
    }

    // Recache position since word width may have changed
    requestAnimationFrame(() => {
      if (word.element) {
        const rect = word.element.getBoundingClientRect();
        word.centerX = rect.left + rect.width / 2 + window.scrollX;
        word.centerY = rect.top + rect.height / 2 + window.scrollY;
      }
    });
  }, CONFIG.morphDuration);
}

function matchCase(original, replacement) {
  // Strip punctuation from original for case check
  const stripped = original.replace(/[^a-zA-Z]/g, '');
  if (!stripped) return replacement;

  if (stripped === stripped.toUpperCase() && stripped.length > 1) {
    return replacement.toUpperCase();
  }
  if (stripped[0] === stripped[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement.toLowerCase();
}

// ── Clicked Word Transformation (non-Gestell) ──────────────────
async function transformClickedWord(word) {
  const el = word.element;
  if (!el || word.transformed) return;

  const lower = word.current.replace(/[^a-zA-Z]/g, '').toLowerCase();
  let target = null;

  // Try SOFT_MAP first
  if (SOFT_MAP.has(lower)) {
    target = SOFT_MAP.get(lower);
  } else {
    // Try LLM for a single-word replacement
    const result = await callLLM(
      `Does the word "${lower}" carry connotations of extraction, domination, control, or commodification? If yes, suggest one gentler word that shifts it toward care/dwelling/tenderness. If no, reply with "${lower}" unchanged. Reply with ONLY one word.`,
      10
    );
    if (result) {
      const cleaned = result.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (cleaned.length > 0 && cleaned !== lower) {
        target = cleaned;
      }
    }
  }

  if (!target) return; // No replacement found

  // Preserve capitalization
  target = matchCase(word.current, target);

  const ghostEl = el.querySelector('.word-ghost');
  const currentEl = el.querySelector('.word-current');
  const nextEl = el.querySelector('.word-next');

  ghostEl.textContent = word.current;
  nextEl.textContent = target;
  el.classList.add('morphing', 'primary-change');

  setTimeout(() => {
    currentEl.textContent = target;
    word.current = target;
    word.transformed = true;
    word.isAnchor = true;
    el.classList.remove('morphing', 'primary-change');
    el.classList.add('transformed', 'anchor');
    nextEl.textContent = '';

    // Mark sentence for grammar check
    const para = state.paragraphs[word.paragraphIndex];
    if (para) {
      const sentence = para.sentences[word.sentenceIndex];
      if (sentence) sentence.needsGrammarCheck = true;
    }

    requestAnimationFrame(() => {
      if (word.element) {
        const rect = word.element.getBoundingClientRect();
        word.centerX = rect.left + rect.width / 2 + window.scrollX;
        word.centerY = rect.top + rect.height / 2 + window.scrollY;
      }
    });
  }, CONFIG.morphDuration);
}

// ── Grammar Rewriting & Directional Rewriting ──────────────────
function startGrammarChecker() {
  if (state.grammarTimer) clearInterval(state.grammarTimer);
  state.grammarTimer = setInterval(checkPendingRewrites, CONFIG.grammarCheckInterval);
}

async function checkPendingRewrites() {
  // Don't rewrite while wave is active — wait for release
  if (state.isWaveActive) return;

  // Priority 1: Grammar checks (from anchor transforms)
  for (const para of state.paragraphs) {
    for (const sentence of para.sentences) {
      if (sentence.needsGrammarCheck) {
        sentence.needsGrammarCheck = false;

        const transformed = sentence.words.filter(w => w.transformed);
        if (transformed.length === 0) continue;

        const sentenceText = sentence.words.map(w => w.current).join(' ');
        const changes = transformed.map(w => `"${w.original}" → "${w.current}"`).join(', ');

        const prompt = `Original sentence: "${sentence.words.map(w => w.original).join(' ')}"

Current sentence: "${sentenceText}"

These words were transformed: ${changes}

Rewrite the current sentence so it is grammatically correct and coherent. Keep as close to the current sentence as possible — only adjust what's necessary for grammar (articles, verb forms, prepositions). Keep the same approximate length.

Reply with ONLY the rewritten sentence, nothing else.`;

        const result = await callLLM(prompt, 120);
        if (!result) return;

        applySentenceRewrite(sentence, result);
        return; // One sentence at a time
      }
    }
  }

  // Priority 2: Directional rewrites (from wave reach)
  for (const para of state.paragraphs) {
    for (const sentence of para.sentences) {
      if (!sentence.needsRewrite) continue;
      sentence.needsRewrite = false;

      const sentenceText = sentence.words.map(w => w.current).join(' ');

      // Collect anchor words to protect
      const anchors = sentence.words
        .filter(w => w.isAnchor)
        .map(w => w.current.replace(/[^a-zA-Z]/g, ''));
      const anchorNote = anchors.length > 0
        ? `Keep these anchor words fixed (do not change them): ${anchors.join(', ')}. `
        : '';

      const prompt = `Sentence: "${sentenceText}"

Shift this sentence from extraction/domination language toward care/dwelling/tenderness. ${anchorNote}Change other content words selectively — not every word, just the ones that carry extraction connotations. Keep grammar correct. Keep the same word count and sentence structure.

Reply with ONLY the rewritten sentence, nothing else.`;

      const result = await callLLM(prompt, 120);
      if (!result) return;

      applySentenceRewrite(sentence, result);
      return; // One sentence at a time
    }
  }
}

function applySentenceRewrite(sentence, newText) {
  const newTokens = newText.split(/\s+/).filter(t => t.length > 0);
  const minLen = Math.min(sentence.words.length, newTokens.length);

  for (let i = 0; i < minLen; i++) {
    const word = sentence.words[i];
    const newToken = newTokens[i];

    // Skip if same (case-insensitive, ignore punctuation)
    const cleanOld = word.current.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const cleanNew = newToken.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (cleanOld === cleanNew) continue;

    // Skip anchor words (Gestell map transforms + clicked-word transforms)
    if (word.isAnchor) continue;

    // Apply secondary morph (with ghost layer)
    morphWordSecondary(word, newToken);
  }
}

function morphWordSecondary(word, newToken) {
  const el = word.element;
  if (!el) return;

  const ghostEl = el.querySelector('.word-ghost');
  const currentEl = el.querySelector('.word-current');
  const nextEl = el.querySelector('.word-next');

  // Set ghost to show previous word (palimpsest)
  if (!ghostEl.textContent) {
    ghostEl.textContent = word.current;
  }

  nextEl.textContent = newToken;
  el.classList.add('morphing', 'secondary-change');

  setTimeout(() => {
    currentEl.textContent = newToken;
    word.current = newToken;
    word.transformed = true;
    el.classList.remove('morphing', 'secondary-change');
    el.classList.add('transformed');
    nextEl.textContent = '';

    // Recache position
    requestAnimationFrame(() => {
      if (word.element) {
        const rect = word.element.getBoundingClientRect();
        word.centerX = rect.left + rect.width / 2 + window.scrollX;
        word.centerY = rect.top + rect.height / 2 + window.scrollY;
      }
    });
  }, CONFIG.morphDuration);
}

// ── Debug ──────────────────────────────────────────────────────
function updateDebug(message) {
  const debugEl = document.getElementById('debug');
  if (debugEl) debugEl.textContent = message;
  console.log(message);
}

// ── Model Selector ─────────────────────────────────────────────
async function loadAvailableModels() {
  const selectEl = document.getElementById('model-select');
  const statusEl = document.getElementById('llm-status');

  try {
    const response = await fetch(CONFIG.lmStudioUrl.replace('/chat/completions', '/models'));
    if (!response.ok) throw new Error('Failed to fetch models');

    const data = await response.json();
    const models = data.data || [];
    const chatModels = models.filter(m => !m.id.includes('embedding'));

    if (chatModels.length === 0) {
      selectEl.innerHTML = '<option value="">No chat models found</option>';
      statusEl.textContent = 'no models';
      statusEl.className = 'llm-status disconnected';
      return;
    }

    selectEl.innerHTML = chatModels.map(m =>
      `<option value="${m.id}" ${m.id === CONFIG.lmStudioModel ? 'selected' : ''}>${m.id}</option>`
    ).join('');

    if (!chatModels.find(m => m.id === CONFIG.lmStudioModel)) {
      CONFIG.lmStudioModel = chatModels[0].id;
      selectEl.value = CONFIG.lmStudioModel;
    }

    selectEl.addEventListener('change', (e) => {
      CONFIG.lmStudioModel = e.target.value;
      updateDebug(`Switched to model: ${CONFIG.lmStudioModel}`);
    });

    statusEl.textContent = 'connected';
    statusEl.className = 'llm-status connected';
    state.llmConnected = true;

  } catch (e) {
    console.error('Failed to load models:', e);
    selectEl.innerHTML = '<option value="">LM Studio not available</option>';
    statusEl.textContent = 'disconnected';
    statusEl.className = 'llm-status disconnected';
    state.llmConnected = false;
  }
}

// ── Wave Speed Slider ──────────────────────────────────────────
function initWaveSpeedSlider() {
  const slider = document.getElementById('wave-speed');
  const valEl = document.getElementById('wave-speed-val');
  if (!slider) return;

  slider.addEventListener('input', () => {
    CONFIG.waveSpeed = parseInt(slider.value, 10);
    valEl.textContent = CONFIG.waveSpeed;
  });
}

// ── Init ───────────────────────────────────────────────────────
function init() {
  initInputOverlay();
  initWaveSpeedSlider();
  loadAvailableModels();
  updateDebug('Paste or load text to begin.');
}

init();

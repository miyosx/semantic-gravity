/**
 * Semantic Gravity - Proof of Concept
 *
 * Words drift toward an attractor ("love") when held.
 * Uses local LLM (LM Studio) for sentence coherence.
 */

// Configuration
const CONFIG = {
  attractor: 'love',
  holdThreshold: 500,      // ms before first transformation
  transformInterval: 1200, // ms between transformations (longer for LLM calls)
  morphDuration: 400,      // ms for visual transition

  // LM Studio API
  lmStudioUrl: 'http://localhost:1234/v1/chat/completions',
  lmStudioModel: 'mistralai/ministral-3-3b',  // default to smaller/faster model
};

// Mock semantic paths toward "love"
// In production, these will be computed from embeddings
const MOCK_PATHS = {
  'grief': ['sorrow', 'ache', 'longing', 'yearning', 'love'],
  'hatred': ['anger', 'passion', 'intensity', 'desire', 'love'],
  'darkness': ['shadow', 'depth', 'mystery', 'intimacy', 'love'],
  'fear': ['trembling', 'vulnerability', 'openness', 'trust', 'love'],
  'silence': ['stillness', 'presence', 'closeness', 'tenderness', 'love'],
  'distance': ['space', 'longing', 'reaching', 'connection', 'love'],
  'cold': ['cool', 'calm', 'gentle', 'warm', 'love'],
  'nothing': ['emptiness', 'space', 'possibility', 'fullness', 'love'],
  'end': ['finish', 'completion', 'wholeness', 'unity', 'love'],
  'the': ['a', 'one', 'this', 'my', 'love'],
  'is': ['becomes', 'feels', 'means', 'love'],
  'of': ['from', 'with', 'in', 'love'],
  'price': ['cost', 'worth', 'value', 'treasure', 'love'],
};

// Starting sentence
const INITIAL_SENTENCE = "grief is the price of love";

// LLM Integration
async function callLLM(prompt, maxTokens = 60) {
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

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    let result = data.choices[0].message.content.trim();

    // Strip markdown formatting
    result = cleanLLMResponse(result);

    return result;
  } catch (error) {
    console.error('LLM call failed:', error);
    return null;
  }
}

// Clean markdown and other formatting from LLM responses
function cleanLLMResponse(text) {
  return text
    .replace(/\*\*/g, '')      // Remove bold **
    .replace(/\*/g, '')        // Remove italic *
    .replace(/_/g, ' ')        // Replace underscores
    .replace(/`/g, '')         // Remove code backticks
    .replace(/"/g, '')         // Remove quotes
    .replace(/'/g, '')         // Remove single quotes
    .trim();
}

// Get next word on path toward attractor
async function getNextWordTowardAttractor(word) {
  if (word.toLowerCase() === CONFIG.attractor) {
    return null; // Already at attractor
  }

  // First check mock paths (fast fallback)
  const mockPath = MOCK_PATHS[word.toLowerCase()];
  if (mockPath && mockPath.length > 0) {
    // Add some randomness - occasionally skip a step or vary the path
    if (Math.random() < 0.3 && mockPath.length > 1) {
      return mockPath[1]; // Skip one step
    }
    return mockPath[0];
  }

  // Use LLM to find next word
  const prompt = `What is a single word that is semantically between "${word}" and "${CONFIG.attractor}"? The word should be closer to "${CONFIG.attractor}" than "${word}" is. Reply with ONLY that one word, nothing else.`;

  const result = await callLLM(prompt, 10);
  if (result) {
    // Clean the response - get just the first word
    const cleanWord = result.split(/\s+/)[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
    return cleanWord || CONFIG.attractor;
  }

  // Final fallback
  return CONFIG.attractor;
}

// Rewrite sentence to maintain grammatical coherence
async function rewriteSentenceWithNewWord(sentence, oldWord, newWord, wordIndex) {
  const prompt = `Original sentence: "${sentence}"

The word "${oldWord}" has changed to "${newWord}".

Rewrite the sentence so it remains grammatically correct and coherent with "${newWord}" in place of "${oldWord}". Keep the sentence as close to the original as possible - only change what's necessary for grammar. Keep approximately the same length.

Reply with ONLY the new sentence, nothing else.`;

  const result = await callLLM(prompt, 80);
  return result;
}

// Parse sentence into words (preserving structure for reconstruction)
function parseSentence(sentence) {
  return sentence.split(/\s+/).filter(w => w.length > 0);
}

// State
const state = {
  words: [],           // Array of word objects
  activeWord: null,    // Currently held word
  holdTimer: null,
  transformTimer: null,
  holdStartTime: null,
  activePath: null,    // Current transformation path
  activePathIndex: 0,  // Position in path
};

// Initialize
function init() {
  const sentenceEl = document.getElementById('sentence');
  const words = INITIAL_SENTENCE.split(' ');

  state.words = words.map((word, index) => ({
    original: word,
    current: word,
    pathIndex: 0,
    isAttractor: word.toLowerCase() === CONFIG.attractor,
    element: null,
  }));

  // Render words
  sentenceEl.innerHTML = state.words.map((word, i) => `
    <span class="word ${word.isAttractor ? 'attractor' : ''}" data-index="${i}">
      <span class="word-inner">
        <span class="word-current">${word.current}</span>
        <span class="word-next"></span>
      </span>
    </span>
  `).join(' ');

  // Store element references
  state.words.forEach((word, i) => {
    word.element = sentenceEl.querySelector(`[data-index="${i}"]`);
  });

  // Attach event listeners
  attachEvents();
  updateDebug('Ready. Hold any word to begin transformation.');
}

function attachEvents() {
  const sentenceEl = document.getElementById('sentence');

  // Mouse events
  sentenceEl.addEventListener('mousedown', handleHoldStart);
  document.addEventListener('mouseup', handleHoldEnd);
  document.addEventListener('mouseleave', handleHoldEnd);

  // Touch events
  sentenceEl.addEventListener('touchstart', handleHoldStart, { passive: false });
  document.addEventListener('touchend', handleHoldEnd);
  document.addEventListener('touchcancel', handleHoldEnd);
}

function handleHoldStart(e) {
  const wordEl = e.target.closest('.word');
  if (!wordEl) return;

  e.preventDefault();

  const index = parseInt(wordEl.dataset.index);
  const word = state.words[index];

  // Don't interact with words that have reached the attractor
  if (word.isAttractor) {
    updateDebug(`"${word.current}" is already at the attractor.`);
    return;
  }

  state.activeWord = word;
  state.holdStartTime = Date.now();
  state.activePath = getPathToAttractor(word.current.toLowerCase());
  state.activePathIndex = 0;
  wordEl.classList.add('holding');

  updateDebug(`Holding "${word.current}"... (${state.activePath.length} steps to ${CONFIG.attractor})`);

  // Start hold progress animation
  animateHoldProgress(wordEl);

  // Set timer for first transformation
  state.holdTimer = setTimeout(() => {
    runTransformationLoop();
  }, CONFIG.holdThreshold);
}

async function runTransformationLoop() {
  if (!state.activeWord || state.activeWord.isAttractor) {
    return;
  }

  await transformWord(state.activeWord);

  // Schedule next transformation if still holding
  if (state.activeWord && !state.activeWord.isAttractor) {
    state.transformTimer = setTimeout(() => {
      runTransformationLoop();
    }, CONFIG.transformInterval);
  }
}

function handleHoldEnd() {
  if (!state.activeWord) return;

  const wordEl = state.activeWord.element;
  wordEl.classList.remove('holding');
  wordEl.style.setProperty('--hold-progress', '0%');

  clearTimeout(state.holdTimer);
  clearTimeout(state.transformTimer);

  updateDebug(`Released "${state.activeWord.current}".`);
  state.activeWord = null;
  state.holdStartTime = null;
  state.activePath = null;
  state.activePathIndex = 0;
}

function animateHoldProgress(wordEl) {
  const animate = () => {
    if (!state.activeWord || !state.holdStartTime) return;

    const elapsed = Date.now() - state.holdStartTime;
    const progress = Math.min((elapsed / CONFIG.holdThreshold) * 100, 100);
    wordEl.style.setProperty('--hold-progress', `${progress}%`);

    if (state.activeWord) {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
}

async function transformWord(word) {
  // Check if already at attractor
  if (word.current.toLowerCase() === CONFIG.attractor) {
    word.isAttractor = true;
    word.element.classList.add('attractor');
    clearInterval(state.transformTimer);
    updateDebug(`"${word.current}" has reached the attractor.`);
    return;
  }

  updateDebug(`Finding next word from "${word.current}"...`);

  // Get next word toward attractor
  const nextWord = await getNextWordTowardAttractor(word.current);

  if (!nextWord || nextWord === word.current.toLowerCase()) {
    // Jump to attractor if stuck
    await transformSentenceWithWord(word, CONFIG.attractor);
    return;
  }

  await transformSentenceWithWord(word, nextWord);
}

async function transformSentenceWithWord(targetWord, newWord) {
  const wordIndex = state.words.indexOf(targetWord);
  const oldWord = targetWord.current;

  // Build current sentence
  const currentSentence = state.words.map(w => w.current).join(' ');

  updateDebug(`"${oldWord}" → "${newWord}", checking grammar...`);

  // Ask LLM to rewrite sentence for coherence
  const newSentence = await rewriteSentenceWithNewWord(
    currentSentence,
    oldWord,
    newWord,
    wordIndex
  );

  if (newSentence) {
    const newWords = parseSentence(newSentence);

    // Update all words that changed
    updateSentenceDisplay(newWords, wordIndex);
  } else {
    // Fallback: just change the target word
    morphWord(targetWord, newWord);
  }

  // Check if target word reached attractor
  if (newWord.toLowerCase() === CONFIG.attractor) {
    targetWord.isAttractor = true;
    targetWord.element.classList.add('attractor');
    clearInterval(state.transformTimer);
  }
}

function updateSentenceDisplay(newWords, primaryIndex) {
  // Handle case where sentence length changed
  const minLen = Math.min(state.words.length, newWords.length);

  for (let i = 0; i < minLen; i++) {
    const wordObj = state.words[i];
    const newWord = newWords[i];

    if (wordObj.current.toLowerCase() !== newWord.toLowerCase()) {
      const isPrimary = (i === primaryIndex);
      morphWord(wordObj, newWord, isPrimary);

      // Check if this word became the attractor
      if (newWord.toLowerCase() === CONFIG.attractor) {
        wordObj.isAttractor = true;
        setTimeout(() => {
          wordObj.element.classList.add('attractor');
        }, CONFIG.morphDuration);
      }
    }
  }

  // Log what changed
  const changes = [];
  for (let i = 0; i < minLen; i++) {
    if (state.words[i].current.toLowerCase() !== newWords[i].toLowerCase()) {
      changes.push(`${state.words[i].current}→${newWords[i]}`);
    }
  }
  if (changes.length > 0) {
    updateDebug(`Changes: ${changes.join(', ')}`);
  }
}

function getPathToAttractor(word) {
  // Check if word is already the attractor
  if (word === CONFIG.attractor) return [];

  // Check if word has a direct path
  if (MOCK_PATHS[word]) {
    return MOCK_PATHS[word];
  }

  // Check if word is an intermediate word in any path
  for (const [startWord, path] of Object.entries(MOCK_PATHS)) {
    const index = path.indexOf(word);
    if (index !== -1) {
      // Return the remainder of this path
      return path.slice(index + 1);
    }
  }

  // For unknown words, create a short random path
  // In production, this will use embedding interpolation
  const fillerWords = ['something', 'feeling', 'warmth', 'love'];
  return fillerWords;
}

function morphWord(word, newWord, isPrimary = true) {
  const el = word.element;
  const currentEl = el.querySelector('.word-current');
  const nextEl = el.querySelector('.word-next');

  // Set up next word
  nextEl.textContent = newWord;

  // Mark primary vs secondary changes visually
  if (isPrimary) {
    el.classList.add('morphing', 'primary-change');
  } else {
    el.classList.add('morphing', 'secondary-change');
  }

  // After transition, swap and reset
  setTimeout(() => {
    currentEl.textContent = newWord;
    word.current = newWord;
    el.classList.remove('morphing', 'primary-change', 'secondary-change');
    nextEl.textContent = '';
  }, CONFIG.morphDuration);
}

function updateDebug(message) {
  const debugEl = document.getElementById('debug');
  debugEl.textContent = message;
  console.log(message);
}

// Fetch available models and populate dropdown
async function loadAvailableModels() {
  const selectEl = document.getElementById('model-select');
  const statusEl = document.getElementById('llm-status');

  try {
    const response = await fetch(CONFIG.lmStudioUrl.replace('/chat/completions', '/models'));
    if (!response.ok) throw new Error('Failed to fetch models');

    const data = await response.json();
    const models = data.data || [];

    // Filter out embedding models for chat
    const chatModels = models.filter(m => !m.id.includes('embedding'));

    if (chatModels.length === 0) {
      selectEl.innerHTML = '<option value="">No chat models found</option>';
      statusEl.textContent = 'no models';
      statusEl.className = 'llm-status disconnected';
      return;
    }

    // Populate dropdown
    selectEl.innerHTML = chatModels.map(m =>
      `<option value="${m.id}" ${m.id === CONFIG.lmStudioModel ? 'selected' : ''}>${m.id}</option>`
    ).join('');

    // If current model not in list, select first one
    if (!chatModels.find(m => m.id === CONFIG.lmStudioModel)) {
      CONFIG.lmStudioModel = chatModels[0].id;
      selectEl.value = CONFIG.lmStudioModel;
    }

    // Handle model change
    selectEl.addEventListener('change', (e) => {
      CONFIG.lmStudioModel = e.target.value;
      updateDebug(`Switched to model: ${CONFIG.lmStudioModel}`);
    });

    statusEl.textContent = 'connected';
    statusEl.className = 'llm-status connected';

  } catch (e) {
    console.error('Failed to load models:', e);
    selectEl.innerHTML = '<option value="">LM Studio not available</option>';
    statusEl.textContent = 'disconnected';
    statusEl.className = 'llm-status disconnected';
  }
}

// Start
init();
loadAvailableModels();

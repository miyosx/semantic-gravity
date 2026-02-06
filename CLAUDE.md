# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Semantic Gravity v2** is an interactive web art piece exploring the Heideggerian movement from Gestell (enframing/extraction) to Gelassenheit (releasement/letting-be). Users load text (paste or URL), then hold anywhere on the text. A wave radiates from the touch point, transforming extraction/domination language into care/relational language. Original words persist as palimpsest underneath.

## Running the Project

```bash
python3 server.py
# Open http://localhost:8000
```

Requires **LM Studio** running locally at `localhost:1234` for grammar rewriting after transformations. Without it, Gestell→Gelassenheit word swaps still work (from `GESTELL_MAP`), but grammar won't be adjusted.

## Architecture

Two files, no build step:

- `index.html` — Layout, input overlay, all CSS (inline `<style>`), no framework
- `app.js` — All application logic (single file, ~730 lines)

### Interaction Flow

1. User pastes text or loads a URL via the input overlay
2. Text is parsed into `paragraphs[] → sentences[] → words[]`
3. Gestell words are identified via `GESTELL_MAP` lookup and marked with a subtle underline
4. User holds (mousedown/touch) anywhere on `#text-display`
5. A wave radiates from the touch point at `CONFIG.waveSpeed` px/s
6. When the wave reaches a Gestell word, it transforms via palimpsest morph (ghost + crossfade)
7. On release, wave stops; transformed words persist with ghost layer showing the original
8. Grammar rewriting runs via LLM every 2s on sentences with transformed words

### Key State (in `state` object)

- `paragraphs[]` — Nested: `{sentences: [{words: [wordObj...], needsGrammarCheck}]}`
- `allWords[]` — Flat list of all word objects (for wave distance checks)
- `waveOrigin` / `waveRadius` / `isWaveActive` — Wave expansion state
- `transformQueue` / `activeTransforms` — Concurrent transform management

### Word Object

```javascript
{
  original, current, isGestell, gelassenheitTarget,
  transformed, element, centerX, centerY,
  globalIndex, sentenceIndex, paragraphIndex
}
```

### GESTELL_MAP

A `Map` of ~100 term pairs mapping extraction language to care language:
```
optimize→tend, extract→receive, users→dwellers, data→traces,
resources→gifts, scale→root, disrupt→listen, leverage→hold, ...
```

### LLM Integration

- OpenAI-compatible API via LM Studio (`localhost:1234/v1/chat/completions`)
- Model selectable via dropdown (auto-populated from `/v1/models`)
- Used only for **grammar rewriting** after Gestell→Gelassenheit swaps
- Runs one sentence at a time via `setInterval(checkPendingGrammarUpdates, 2000)`

### Visual System

- **Gestell markers**: faint red underline on transformable words
- **Primary changes** (wave-transformed): red tint (`#ff6b6b`)
- **Secondary changes** (grammar adjustments by LLM): green tint (`#6bffb8`)
- **Palimpsest**: `.word-ghost` shows original at 0.2 opacity with blur after transformation
- **Wave ring**: expanding circle from touch point
- **Morphing**: blur + opacity crossfade between `.word-current` and `.word-next` spans (600ms)

## Configuration (top of app.js)

```javascript
CONFIG.waveSpeed              // px/s wave expansion (200, adjustable via slider)
CONFIG.morphDuration          // ms for visual morph transition (600)
CONFIG.maxConcurrentTransforms // max parallel transforms (5)
CONFIG.transformStagger       // ms between queued transforms (50)
CONFIG.grammarCheckInterval   // ms between grammar rewrites (2000)
CONFIG.lmStudioUrl            // API endpoint
CONFIG.lmStudioModel          // Default model ID
```

## Artistic Intent

The piece explores how language enframes (Gestell) — how words like "optimize," "extract," and "leverage" structure a world of standing-reserve. The wave of touch releases (Gelassenheit) these words, letting them become "tend," "receive," "hold." The palimpsest keeps the Gestell visible as ghost — the extraction is not erased but made visible *as* extraction.

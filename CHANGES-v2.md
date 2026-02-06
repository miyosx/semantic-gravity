# Semantic Gravity v2 — Changes from v1

## What changed

### v1: Only Gestell words transform

The wave only affected words found in `GESTELL_MAP` (~100 extraction/domination terms). Non-Gestell words were invisible to the wave. A second click did nothing because all reachable Gestell words were already transformed, and `activeTransforms` retained stale entries.

Clicking a non-Gestell word started the wave but didn't transform the word itself.

### v2: The wave touches everything

Three layers of transformation now operate:

1. **Gestell map transforms** (instant, red) — Same as v1. The wave reaches a Gestell word, it swaps via `GESTELL_MAP`. These are *anchors* — the LLM won't undo them.

2. **Clicked-word transforms** (instant, red) — Clicking any content word (not just Gestell) now transforms it. Uses `SOFT_MAP` first (~40 common content words shifted toward care), falls back to a single-word LLM query. These are also anchors.

3. **Sentence-level directional rewrites** (delayed ~2s, green) — After the wave stops, any sentence the wave touched gets rewritten by the LLM. The prompt asks it to shift the *entire sentence* from extraction/domination toward care/dwelling/tenderness, while keeping anchor words fixed. Each sentence can be rewritten up to 2 times (across multiple waves).

### Fixes

- **Second click works**: `activeTransforms` is cleared at wave start. `waveReached` (per word) resets each wave, so words can be re-processed.
- **Clicked word always transforms**: Non-Gestell content words get `transformClickedWord()`. Stop words (the, is, a...) are skipped gracefully.
- **Grammar rewrites wait for release**: `checkPendingRewrites` skips while the wave is active, preventing mid-wave reflows.

## How language is chosen

### The philosophical frame

Heidegger's *Gestell* (enframing) names the way modern technology reduces everything to standing-reserve — raw material awaiting extraction. *Gelassenheit* (releasement/letting-be) is the counter-movement: letting things be what they are, relating through care rather than control.

The piece makes this visible in language. Words like "optimize," "extract," "leverage" structure a world of extraction. The wave releases them into "tend," "receive," "hold."

### Three vocabularies

**GESTELL_MAP** (~100 pairs) — The core. Hand-curated pairs where the Gestell term and its Gelassenheit counterpart have a clear conceptual relationship:

| Direction | Examples |
|-----------|----------|
| Extraction → Reception | extract→receive, capture→welcome, consume→savor |
| Control → Care | optimize→tend, manage→tend, leverage→hold |
| Commodity → Gift | resources→gifts, assets→belongings, data→traces |
| Machine → Ecology | platform→ground, pipeline→path, algorithm→pattern |
| Competition → Cooperation | compete→cooperate, market→commons, target→invite |
| Scale → Rootedness | scale→root, growth→flourishing, accelerate→ripen |

**SOFT_MAP** (~40 pairs) — Fallback for common content words when LLM is unavailable. Looser associations, still moving in the same direction:

| Direction | Examples |
|-----------|----------|
| Force → Invitation | push→offer, force→invite, drive→guide |
| Mechanism → Living | machine→vessel, system→ecology, process→practice |
| Speed → Patience | fast→patient, launch→begin, generate→grow |
| Mastery → Witness | control→steward, track→witness, analyze→contemplate |

**LLM rewrites** — When available, the LLM handles two things:
1. Single-word replacement for clicked words not in either map (prompt: "what single word could replace X in a shift from extraction to care?")
2. Sentence-level rewrites that shift the *surrounding* grammar and non-anchor words toward care/dwelling. The prompt protects anchor words and asks for selective changes — not every word, just those carrying extraction connotations.

### STOP_WORDS (~80 words)

Function words skipped for individual transform: articles, prepositions, pronouns, auxiliary verbs, conjunctions, determiners. These carry grammatical structure, not extraction meaning. The sentence-level LLM rewrite can still adjust them if needed for coherence.

### Why anchors are protected

When the LLM rewrites a sentence, it must not undo the Gestell→Gelassenheit swaps or clicked-word transforms. These are the *anchor points* — the wave's primary gesture. The LLM's job is to shift the surrounding language to harmonize with the anchors, not to override them.

### The palimpsest

Every transformed word keeps a ghost of its original underneath (0.2 opacity, blurred). The Gestell is not erased — it's made visible *as* Gestell. The extraction remains legible beneath the care.

## Data structures (new in v2)

```
word.waveReached   — boolean, reset each wave, prevents double-processing
word.isAnchor      — boolean, protects word from LLM sentence rewrites

sentence.needsRewrite  — boolean, set when wave reaches any word in sentence
sentence.rewriteCount  — integer, max 2 rewrites per sentence
```

## Without LM Studio

Gestell map transforms and SOFT_MAP clicked-word transforms still work. Sentence-level rewrites and LLM single-word replacements silently no-op. The piece degrades to a simpler but still functional version.

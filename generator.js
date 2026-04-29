/**
 * Lorem Fistrum — generator.js
 * Pure logic module. Zero DOM dependencies. Fully testable in Node.js.
 */

// ── Word Pools ──────────────────────────────────────────────────────────────

export const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'eiusmod', 'tempor', 'incididunt', 'labore', 'dolore', 'magna', 'aliqua',
  'enim', 'minim', 'veniam', 'nostrud', 'exercitation', 'ullamco', 'laboris',
  'aliquip', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur',
  'excepteur', 'sint', 'occaecat', 'cupidatat', 'proident', 'culpa', 'officia',
  'deserunt', 'mollit', 'anim', 'laborum', 'aliquam', 'tincidunt', 'blandit',
  'viverra', 'pretium', 'vulputate', 'accumsan', 'tortor', 'posuere', 'libero',
  'nunc', 'varius', 'sapien', 'fringilla', 'porta', 'egestas', 'urna',
];

/** Chiquito expressions split into individual tokens for natural blending */
export const CHIQUITO_WORDS = [
  'fistro',
  'jarl',
  'sesuar',
  'pecador',
  'oleeee',
  'Noooor',
  'gromenauer',
  'cobarde',
  'amatoma',
  'antracita',
  'guarrerida',
  'ioputa',
  'diodeno',
  'meretérica',
  'cuidadín',
  'jorl',
  'apiticán',
  'torpedo',
  'al ataquer',
  'te das cuen',
  'can de mor',
  'grijandemore',
  'diodenar',
];

/** Multi-word Chiquito expressions used as sentence starters or endings */
export const CHIQUITO_PHRASES = [
  '¡Al ataqueeer!',
  '¡Cobarde, pecador!',
  '¿Te das cuen?',
  'Hasta luego, Lucas.',
  '¡Fistro!',
  '¡Torpedo!',
  'A can de mor.',
  'Grijandemore.',
  'Te voy a matá en Agosto',
  'Diodenar.',
  'Nací el 1 de abril, pero no de 1976.',
  'Soy automático como la Abeja Maya.',
  'Nací el día de los dolores de cabeza de mi padre.',
  '¡Siete caballos vienen de Bonanza!',
  'Eres más inútirl que el escáner de la Audiencia Nacionarl, cobarde',
  'Eres más lento que el caballo del malo.',
  'Por la gloria de mi madre, ¡qué fistro diodenal!',
  'Papa, cómprame un fistro de esos que venden en el ECI.',
  '¡No puedoor, no puedoor!',
  '¡Por la gloria de mi madre!',
  '¿Te das cuen? ¡Alrriiii!',
  'Como el sobaco de un churrero.',
  'La mate en agosto porque la caló apretaba.',
  'Te viá poner una murta que no te la va a quita ni Perry Mason.',
  'Un lago blanco, un lago negro.',
  '¡Cuidadín, cuidadín!',
  'Te das cuen... un fistro duodenal.',
  'No te digo trigo por no llamarte Rodrigo.',
  '¡Ten cuidadínnn no te hagas pupita en el fistro duodenalll!',
  'Eres más feo que el Fari comiendo limones.',
  'Eres más peligroso que un tiroteo en un ascensor.',
  '¡Ese fistro danimarl!',
  'Trabaja menos que el sastre de Tarzán.',
  'Eres más falso que el flequillo del Dioni.',
  'Ere ma violento que el entrenador de lo Pogüer Renlle.',
  'Tienes más pintura que el neceser de Marujita Díaz.',
];

// ── LoremFistrumGenerator ───────────────────────────────────────────────────

export class LoremFistrumGenerator {
  /**
   * @param {number} chiquitoRatio — 0..1, fraction of Chiquito words (default 0.18)
   * @param {number} phraseProbability — 0..1 chance of appending phrase per sentence (default 0.58)
   */
  constructor(chiquitoRatio = 0.18, phraseProbability = 0.58) {
    this.#chiquitoRatio = Math.max(0, Math.min(1, chiquitoRatio));
    this.#phraseProbability = Math.max(0, Math.min(1, phraseProbability));
  }

  #chiquitoRatio;
  #phraseProbability;

  /**
   * Pick a random element from an array.
   * @template T
   * @param {T[]} arr
   * @returns {T}
   */
  #pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Pick random element weighted by prior usage and recent recency.
   * @template T
   * @param {T[]} arr
   * @param {Map<T, number>} usage
   * @param {T[]} recent
   * @param {number} recentPenalty
   * @returns {T}
   */
  #pickWithVariety(arr, usage, recent, recentPenalty = 0.2) {
    if (arr.length === 0) {
      throw new Error('Cannot pick from empty array');
    }

    if (arr.length === 1) {
      return this.#pick(arr);
    }

    const weighted = arr.map((item) => {
      const useCount = usage.get(item) ?? 0;
      const usageWeight = 1 / (1 + useCount);
      const recencyWeight = recent.includes(item) ? recentPenalty : 1;
      return {
        item,
        weight: usageWeight * recencyWeight,
      };
    });

    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let cursor = Math.random() * total;

    for (const entry of weighted) {
      cursor -= entry.weight;
      if (cursor <= 0) {
        return entry.item;
      }
    }

    return weighted[weighted.length - 1].item;
  }

  /**
   * Pick random element avoiding the most recent sequence for smoother prose.
   * @template T
   * @param {T[]} arr
   * @param {T[]} recent
   * @returns {T}
   */
  #pickAvoidRecent(arr, recent) {
    let candidate = this.#pick(arr);
    let attempts = 0;

    while (recent.includes(candidate) && attempts < 8) {
      candidate = this.#pick(arr);
      attempts += 1;
    }

    return candidate;
  }

  /**
   * Decide how many base tokens should use Chiquito vocabulary.
   * Keeps a softer blend than per-word independent random picks.
   * @param {number} wordCount
   * @returns {number}
   */
  #targetChiquitoCount(wordCount) {
    const variance = 0.9 + Math.random() * 0.25;
    const raw = Math.round(wordCount * this.#chiquitoRatio * variance);
    const capped = Math.min(raw, Math.max(1, Math.ceil(wordCount / 6)));
    return Math.max(0, Math.min(wordCount, capped));
  }

  /**
   * Select token indexes where Chiquito words will be inserted.
   * Avoids clustering for more readable output.
   * @param {number} wordCount
   * @param {number} targetCount
   * @returns {Set<number>}
   */
  #chiquitoPositions(wordCount, targetCount) {
    const positions = new Set();

    // Keep sentence openings cleaner unless user chooses extreme ratio.
    const minIndex = this.#chiquitoRatio > 0.75 ? 0 : 2;
    const maxAvailable = Math.max(0, wordCount - minIndex);
    const finalTarget = Math.min(targetCount, maxAvailable);

    while (positions.size < finalTarget) {
      const idx = minIndex + Math.floor(Math.random() * Math.max(1, wordCount - minIndex));
      if (positions.has(idx)) {
        continue;
      }

      const hasLeft = positions.has(idx - 1);
      const hasRight = positions.has(idx + 1);

      // Prefer non-adjacent positions, but allow adjacency after a few attempts.
      if ((hasLeft || hasRight) && Math.random() < 0.75) {
        continue;
      }

      positions.add(idx);
    }

    return positions;
  }

  /**
   * Create base sentence tokens with smoother vocabulary blending.
   * @param {number} wordCount
   * @returns {Array<{text: string, isChiquito: boolean}>}
   */
  #baseSentence(wordCount, generationState) {
    const targetChiquito = this.#targetChiquitoCount(wordCount);
    const chiquitoPositions = this.#chiquitoPositions(wordCount, targetChiquito);
    const tokens = [];
    const recentTexts = [];

    for (let i = 0; i < wordCount; i++) {
      const isChiquito = chiquitoPositions.has(i);
      let text;

      if (isChiquito) {
        text = this.#pickWithVariety(
          CHIQUITO_WORDS,
          generationState.chiquitoWordUsage,
          generationState.recentChiquitoWords,
          0.14,
        );
        generationState.chiquitoWordUsage.set(text, (generationState.chiquitoWordUsage.get(text) ?? 0) + 1);
        generationState.recentChiquitoWords.push(text);
        if (generationState.recentChiquitoWords.length > 5) {
          generationState.recentChiquitoWords.shift();
        }
      } else {
        text = this.#pickAvoidRecent(LOREM_WORDS, recentTexts);
      }

      tokens.push({ text, isChiquito });
      recentTexts.push(text);
      if (recentTexts.length > 4) {
        recentTexts.shift();
      }
    }

    return tokens;
  }

  /**
   * Select a phrase length that matches sentence density.
   * @param {number} wordCount
   * @returns {string}
   */
  #pickPhrase(wordCount, generationState) {
    const short = [];
    const medium = [];

    CHIQUITO_PHRASES.forEach((phrase) => {
      const size = phrase.trim().split(/\s+/).length;
      if (size <= 3) {
        short.push(phrase);
      } else if (size <= 6) {
        medium.push(phrase);
      }
    });

    if (wordCount <= 8 && short.length > 0) {
      return this.#pickWithVariety(short, generationState.phraseUsage, generationState.recentPhrases, 0.08);
    }

    if (wordCount <= 11 && medium.length > 0 && Math.random() < 0.6) {
      return this.#pickWithVariety(medium, generationState.phraseUsage, generationState.recentPhrases, 0.08);
    }

    return this.#pickWithVariety(CHIQUITO_PHRASES, generationState.phraseUsage, generationState.recentPhrases, 0.08);
  }

  /**
   * Prepare phrase for inline use before additional words.
   * @param {string} phrase
   * @returns {string}
   */
  #inlinePhrase(phrase) {
    return phrase.replace(/[.!?…]+$/u, '').trim();
  }

  /**
   * Build a single sentence of `wordCount` base words.
   * Occasionally injects a Chiquito phrase at the end.
   * @param {number} wordCount
   * @param {{phraseUsage: Map<string, number>, recentPhrases: string[], chiquitoWordUsage: Map<string, number>, recentChiquitoWords: string[]}} generationState
   * @returns {Array<{text: string, isChiquito: boolean}>}
   */
  #sentence(wordCount, generationState, forcePhrase = false) {
    const tokens = this.#baseSentence(wordCount, generationState);

    const phraseBias = 0.8 + this.#chiquitoRatio;
    const effectivePhraseProbability = Math.min(1, this.#phraseProbability * phraseBias);

    // Place a phrase either as intro or closure, with stronger prominence.
    if (forcePhrase || Math.random() < effectivePhraseProbability) {
      const phrase = this.#pickPhrase(wordCount, generationState);
      generationState.phraseUsage.set(phrase, (generationState.phraseUsage.get(phrase) ?? 0) + 1);
      generationState.recentPhrases.push(phrase);
      if (generationState.recentPhrases.length > 5) {
        generationState.recentPhrases.shift();
      }

      if (Math.random() < 0.4) {
        const inline = this.#inlinePhrase(phrase);
        tokens.unshift({ text: `${inline},`, isChiquito: true });
      } else {
        tokens.push({ text: phrase, isChiquito: true });
      }
    }

    return tokens;
  }

  /**
   * Generate structured text data.
   * @param {number} paragraphCount
   * @param {number} sentencesPerParagraph
   * @returns {Array<Array<Array<{text:string, isChiquito:boolean}>>>}
   *   paragraphs → sentences → tokens
   */
  generate(paragraphCount, sentencesPerParagraph) {
    const paragraphs = [];
    const generationState = {
      phraseUsage: new Map(),
      recentPhrases: [],
      chiquitoWordUsage: new Map(),
      recentChiquitoWords: [],
    };

    for (let p = 0; p < paragraphCount; p++) {
      const sentences = [];
      const phraseSentenceIdx = Math.floor(Math.random() * Math.max(1, sentencesPerParagraph));

      for (let s = 0; s < sentencesPerParagraph; s++) {
        // Each sentence has 7–13 base words
        const wordCount = 7 + Math.floor(Math.random() * 7);
        const forcePhrase = s === phraseSentenceIdx;
        sentences.push(this.#sentence(wordCount, generationState, forcePhrase));
      }

      paragraphs.push(sentences);
    }

    return paragraphs;
  }

  /**
   * Render structured data to plain text (for clipboard).
   * @param {ReturnType<LoremFistrumGenerator['generate']>} data
   * @returns {string}
   */
  static toPlainText(data) {
    return data
      .map((sentences) =>
        sentences
          .map((tokens) => {
            const raw = tokens.map((t) => t.text).join(' ');
            const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
            return /[.!?…]$/.test(capitalized) ? capitalized : `${capitalized}.`;
          })
          .join(' ')
      )
      .join('\n\n');
  }
}

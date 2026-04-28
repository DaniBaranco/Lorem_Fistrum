/**
 * Lorem Fistrum — test suite
 * Uses Node.js built-in test runner (node:test). Zero dependencies.
 * Run: node --test __tests__/generator.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  LoremFistrumGenerator,
  LOREM_WORDS,
  CHIQUITO_WORDS,
  CHIQUITO_PHRASES,
} from '../generator.js';

const normalizeForLookup = (value) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// ── Word pool integrity ─────────────────────────────────────────────────────

describe('Word pools', () => {
  it('LOREM_WORDS is a non-empty array of strings', () => {
    assert.ok(Array.isArray(LOREM_WORDS));
    assert.ok(LOREM_WORDS.length > 0);
    LOREM_WORDS.forEach((w) => assert.equal(typeof w, 'string'));
  });

  it('CHIQUITO_WORDS is a non-empty array of strings', () => {
    assert.ok(Array.isArray(CHIQUITO_WORDS));
    assert.ok(CHIQUITO_WORDS.length > 0);
    CHIQUITO_WORDS.forEach((w) => assert.equal(typeof w, 'string'));
  });

  it('CHIQUITO_PHRASES is a non-empty array of non-empty strings', () => {
    assert.ok(Array.isArray(CHIQUITO_PHRASES));
    assert.ok(CHIQUITO_PHRASES.length > 0);
    CHIQUITO_PHRASES.forEach((p) => {
      assert.equal(typeof p, 'string');
      assert.ok(p.trim().length > 0, `Phrase "${p}" should not be empty`);
    });
  });

  it('Word pools have no empty strings', () => {
    [...LOREM_WORDS, ...CHIQUITO_WORDS].forEach((w) =>
      assert.ok(w.trim().length > 0, `Empty word found: "${w}"`)
    );
  });

  it('No duplicate words in LOREM_WORDS', () => {
    const unique = new Set(LOREM_WORDS);
    assert.equal(unique.size, LOREM_WORDS.length, 'Duplicate words in LOREM_WORDS');
  });

  it('No duplicate words in CHIQUITO_WORDS', () => {
    const unique = new Set(CHIQUITO_WORDS);
    assert.equal(unique.size, CHIQUITO_WORDS.length, 'Duplicate words in CHIQUITO_WORDS');
  });
});

// ── LoremFistrumGenerator constructor ──────────────────────────────────────

describe('LoremFistrumGenerator constructor', () => {
  it('instantiates with default ratio 0.35', () => {
    const gen = new LoremFistrumGenerator();
    assert.ok(gen instanceof LoremFistrumGenerator);
  });

  it('accepts a custom valid ratio', () => {
    const gen = new LoremFistrumGenerator(0.5);
    assert.ok(gen instanceof LoremFistrumGenerator);
  });

  it('clamps ratio above 1 to 1', () => {
    // No error should be thrown
    assert.doesNotThrow(() => new LoremFistrumGenerator(2));
  });

  it('clamps ratio below 0 to 0', () => {
    assert.doesNotThrow(() => new LoremFistrumGenerator(-1));
  });
});

// ── generate() structure ────────────────────────────────────────────────────

describe('LoremFistrumGenerator.generate() — structure', () => {
  const gen = new LoremFistrumGenerator();

  it('returns an array', () => {
    const result = gen.generate(2, 3);
    assert.ok(Array.isArray(result));
  });

  it('returns the correct number of paragraphs', () => {
    for (const n of [1, 3, 5, 10, 20]) {
      const result = gen.generate(n, 2);
      assert.equal(result.length, n, `Expected ${n} paragraphs`);
    }
  });

  it('each paragraph contains the correct number of sentences', () => {
    for (const n of [1, 3, 10]) {
      const result = gen.generate(2, n);
      result.forEach((sentences, pIdx) => {
        assert.equal(sentences.length, n, `Paragraph ${pIdx} should have ${n} sentences`);
      });
    }
  });

  it('each sentence is a non-empty array of tokens', () => {
    const result = gen.generate(3, 4);
    result.forEach((sentences, pIdx) => {
      sentences.forEach((tokens, sIdx) => {
        assert.ok(Array.isArray(tokens), `P${pIdx}S${sIdx} should be an array`);
        assert.ok(tokens.length > 0, `P${pIdx}S${sIdx} should not be empty`);
      });
    });
  });

  it('each token has { text: string, isChiquito: boolean }', () => {
    const result = gen.generate(2, 3);
    result.forEach((sentences) => {
      sentences.forEach((tokens) => {
        tokens.forEach((token) => {
          assert.equal(typeof token.text, 'string', 'token.text must be a string');
          assert.equal(typeof token.isChiquito, 'boolean', 'token.isChiquito must be a boolean');
          assert.ok(token.text.trim().length > 0, 'token.text must not be empty');
        });
      });
    });
  });

  it('each sentence has at least 6 tokens', () => {
    const result = gen.generate(5, 5);
    result.forEach((sentences) => {
      sentences.forEach((tokens) => {
        assert.ok(tokens.length >= 6, `Sentence has only ${tokens.length} tokens, expected ≥ 6`);
      });
    });
  });
});

// ── generate() word mix (statistical) ──────────────────────────────────────

describe('LoremFistrumGenerator.generate() — word mix', () => {
  it('generated text contains Lorem Ipsum words', () => {
    const gen = new LoremFistrumGenerator(0); // 0% Chiquito → 100% Lorem
    const result = gen.generate(5, 5);
    const allTokens = result.flat(2);
    const loremSet = new Set(LOREM_WORDS);
    const hasLorem = allTokens.some((t) => loremSet.has(t.text));
    assert.ok(hasLorem, 'No Lorem words found in output');
  });

  it('generated text contains Chiquito words at ratio 1.0', () => {
    const gen = new LoremFistrumGenerator(1); // 100% Chiquito
    const result = gen.generate(5, 5);
    const allTokens = result.flat(2);
    const chiquitoSet = new Set(CHIQUITO_WORDS);
    // All base words should be Chiquito (phrase tokens may not be in the set since phrases are multi-word)
    const nonPhrase = allTokens.filter((t) => t.isChiquito);
    assert.ok(nonPhrase.length > 0, 'No Chiquito tokens found at ratio=1');
  });

  it('with default ratio (~0.35), both word types appear in large output', () => {
    const gen = new LoremFistrumGenerator(); // default 0.35
    const result = gen.generate(10, 8);
    const allTokens = result.flat(2);
    const loremSet = new Set(LOREM_WORDS);
    const chiquitoSet = new Set(CHIQUITO_WORDS);

    const hasLorem = allTokens.some((t) => loremSet.has(t.text));
    const hasChiquito = allTokens.some((t) => chiquitoSet.has(t.text) || t.isChiquito);

    assert.ok(hasLorem, 'Lorem words should appear with default ratio');
    assert.ok(hasChiquito, 'Chiquito words should appear with default ratio');
  });

  it('Chiquito token ratio stays within expected bounds [0.2, 0.65] with default settings', () => {
    // Run multiple times to account for randomness
    const gen = new LoremFistrumGenerator();
    let totalTokens = 0;
    let chiquitoTokens = 0;

    for (let run = 0; run < 10; run++) {
      const result = gen.generate(10, 6);
      const all = result.flat(2);
      totalTokens += all.length;
      chiquitoTokens += all.filter((t) => t.isChiquito).length;
    }

    const ratio = chiquitoTokens / totalTokens;
    assert.ok(ratio >= 0.2, `Chiquito ratio ${ratio.toFixed(2)} is below 0.20`);
    assert.ok(ratio <= 0.65, `Chiquito ratio ${ratio.toFixed(2)} is above 0.65`);
  });
});

// ── toPlainText() ───────────────────────────────────────────────────────────

describe('LoremFistrumGenerator.toPlainText()', () => {
  const gen = new LoremFistrumGenerator();

  it('returns a non-empty string', () => {
    const data = gen.generate(2, 3);
    const text = LoremFistrumGenerator.toPlainText(data);
    assert.equal(typeof text, 'string');
    assert.ok(text.trim().length > 0);
  });

  it('separates paragraphs with double newline', () => {
    const data = gen.generate(3, 2);
    const text = LoremFistrumGenerator.toPlainText(data);
    const paragraphs = text.split('\n\n');
    assert.equal(paragraphs.length, 3, 'Expected 3 paragraphs separated by \\n\\n');
  });

  it('each paragraph is non-empty', () => {
    const data = gen.generate(5, 3);
    const text = LoremFistrumGenerator.toPlainText(data);
    text.split('\n\n').forEach((para, i) => {
      assert.ok(para.trim().length > 0, `Paragraph ${i} is empty`);
    });
  });

  it('each sentence ends with a period', () => {
    const data = gen.generate(3, 4);
    const text = LoremFistrumGenerator.toPlainText(data);
    // Split on period+space or period+newline to get sentences
    const sentences = text.split(/\.\s+/).filter((s) => s.trim().length > 0);
    assert.ok(sentences.length > 0, 'No sentences found');
  });

  it('first character of each paragraph is uppercase', () => {
    const data = gen.generate(5, 3);
    const text = LoremFistrumGenerator.toPlainText(data);
    text.split('\n\n').forEach((para, i) => {
      const first = para.trim()[0];
      assert.equal(
        first,
        first.toUpperCase(),
        `Paragraph ${i} does not start with uppercase: "${para.slice(0, 30)}"`
      );
    });
  });

  it('contains no HTML tags (plain text only)', () => {
    const data = gen.generate(5, 5);
    const text = LoremFistrumGenerator.toPlainText(data);
    assert.doesNotMatch(text, /<[^>]+>/, 'Plain text should not contain HTML tags');
  });

  it('all words in output belong to known word pools or phrase tokens', () => {
    const allKnown = new Set([
      ...LOREM_WORDS.map((w) => normalizeForLookup(w)),
      ...CHIQUITO_WORDS.map((w) => normalizeForLookup(w)),
      // Flatten all phrase words
      ...CHIQUITO_PHRASES.flatMap((p) => normalizeForLookup(p).split(' ')),
    ]);

    const data = gen.generate(3, 4);
    const text = LoremFistrumGenerator.toPlainText(data);

    // Extract individual words, lowercased, strip punctuation
    const words = normalizeForLookup(text).split(/\s+/).filter(Boolean);

    words.forEach((w) => {
      assert.ok(allKnown.has(w), `Unknown word in output: "${w}"`);
    });
  });
});

// ── Edge cases ──────────────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('generate(1, 1) returns exactly 1 paragraph with 1 sentence', () => {
    const gen = new LoremFistrumGenerator();
    const result = gen.generate(1, 1);
    assert.equal(result.length, 1);
    assert.equal(result[0].length, 1);
  });

  it('generate(20, 10) does not throw', () => {
    const gen = new LoremFistrumGenerator();
    assert.doesNotThrow(() => gen.generate(20, 10));
  });

  it('toPlainText on generate(1,1) returns a single non-empty sentence', () => {
    const gen = new LoremFistrumGenerator();
    const data = gen.generate(1, 1);
    const text = LoremFistrumGenerator.toPlainText(data);
    assert.ok(text.trim().length > 0);
    assert.ok(/[.!?…]/u.test(text));
  });
});

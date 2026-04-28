import { useMemo, useState } from 'react';
import { LoremFistrumGenerator } from '../generator.js';
import chiquitoNoBgImage from '../img/chiquito-sin-fondo.png';

const STORAGE_KEY = 'lorem-fistrum-prefs';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function copyFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

async function copyToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(text);
    return;
  }
  copyFallback(text);
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePrefs(paragraphs, sentences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ paragraphs, sentences }));
  } catch {
    // Ignore storage failures.
  }
}

export default function App() {
  const prefs = useMemo(() => loadPrefs(), []);
  const [paragraphs, setParagraphs] = useState(clamp(Number(prefs.paragraphs || 3), 1, 20));
  const [sentences, setSentences] = useState(clamp(Number(prefs.sentences || 4), 1, 10));
  const [data, setData] = useState(null);
  const [copyStatus, setCopyStatus] = useState('idle');

  const generator = useMemo(() => new LoremFistrumGenerator(0.18, 0.58), []);

  const hasOutput = Array.isArray(data) && data.length > 0;

  const onGenerate = () => {
    const nextParagraphs = clamp(Number(paragraphs) || 1, 1, 20);
    const nextSentences = clamp(Number(sentences) || 1, 1, 10);

    setParagraphs(nextParagraphs);
    setSentences(nextSentences);
    savePrefs(nextParagraphs, nextSentences);

    const generated = generator.generate(nextParagraphs, nextSentences);
    setData(generated);
    setCopyStatus('idle');
  };

  const onCopy = async () => {
    if (!hasOutput) return;
    try {
      const plainText = LoremFistrumGenerator.toPlainText(data);
      await copyToClipboard(plainText);
      setCopyStatus('ok');
      setTimeout(() => setCopyStatus('idle'), 2200);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2200);
    }
  };

  const copyLabel = copyStatus === 'ok' ? '¡Copiado, jarl!' : copyStatus === 'error' ? 'Error al copiar' : 'Copiar';
  const copyIcon = copyStatus === 'ok' ? '✅' : copyStatus === 'error' ? '❌' : '📋';

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div className="chiquito-badge">
            <img
              className="chiquito-illustration chiquito-dance"
              src={chiquitoNoBgImage}
              alt="Ilustracion de Chiquito en pose de baile"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="header-copy">
            <h1 className="logo">
              <span className="logo-lorem">Lorem</span>
              <span className="logo-fistrum">Fistrum</span>
            </h1>
            <p className="tagline">Generador de texto al ataquer, cobarde pecador</p>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="controls" aria-label="Opciones de generacion">
          <div className="controls-grid">
            <div className="control-group">
              <label className="control-label" htmlFor="paragraphs">Parrafos</label>
              <div className="input-row">
                <button
                  className="stepper-btn"
                  type="button"
                  aria-label="Reducir numero de parrafos"
                  onClick={() => setParagraphs((v) => clamp(Number(v) - 1, 1, 20))}
                >
                  -
                </button>
                <input
                  className="control-input"
                  id="paragraphs"
                  name="paragraphs"
                  type="number"
                  min={1}
                  max={20}
                  value={paragraphs}
                  onChange={(e) => setParagraphs(e.target.value)}
                  onBlur={() => setParagraphs((v) => clamp(Number(v) || 1, 1, 20))}
                />
                <button
                  className="stepper-btn"
                  type="button"
                  aria-label="Aumentar numero de parrafos"
                  onClick={() => setParagraphs((v) => clamp(Number(v) + 1, 1, 20))}
                >
                  +
                </button>
              </div>
              <span className="control-hint">Entre 1 y 20</span>
            </div>

            <div className="control-group">
              <label className="control-label" htmlFor="sentences">Frases por parrafo</label>
              <div className="input-row">
                <button
                  className="stepper-btn"
                  type="button"
                  aria-label="Reducir frases por parrafo"
                  onClick={() => setSentences((v) => clamp(Number(v) - 1, 1, 10))}
                >
                  -
                </button>
                <input
                  className="control-input"
                  id="sentences"
                  name="sentences"
                  type="number"
                  min={1}
                  max={10}
                  value={sentences}
                  onChange={(e) => setSentences(e.target.value)}
                  onBlur={() => setSentences((v) => clamp(Number(v) || 1, 1, 10))}
                />
                <button
                  className="stepper-btn"
                  type="button"
                  aria-label="Aumentar frases por parrafo"
                  onClick={() => setSentences((v) => clamp(Number(v) + 1, 1, 10))}
                >
                  +
                </button>
              </div>
              <span className="control-hint">Entre 1 y 10</span>
            </div>

            <div className="control-group control-group--wide">
              <button className="btn-generate" type="button" onClick={onGenerate}>
                <span className="btn-generate__label">¡Al ataquer!</span>
              </button>
            </div>
          </div>
        </section>

        <section className="output-section" aria-label="Texto generado">
          <div className="output-header">
            <h2 className="output-title">Tu texto fistrum</h2>
            <button
              className={`btn-copy ${copyStatus === 'ok' ? 'btn-copy--success' : ''}`}
              type="button"
              aria-label="Copiar texto al portapapeles"
              disabled={!hasOutput}
              onClick={onCopy}
            >
              <span className="btn-copy__icon" aria-hidden="true">{copyIcon}</span>
              <span className="btn-copy__label" aria-live="polite">{copyLabel}</span>
            </button>
          </div>

          <div className="output-area" role="region" aria-label="Texto Lorem Fistrum generado" aria-live="polite" aria-atomic="true">
            {!hasOutput && (
              <p className="output-placeholder">
                Pulsa <strong>¡Al ataquer!</strong> para generar tu texto fistrum, cobarde pecador...
              </p>
            )}

            {hasOutput &&
              data.map((sentenceGroup, paragraphIdx) => (
                <p className="output-paragraph" key={`paragraph-${paragraphIdx}`}>
                  {sentenceGroup.map((tokens, sentenceIdx) => (
                    <span key={`sentence-${paragraphIdx}-${sentenceIdx}`}>
                      {sentenceIdx > 0 ? ' ' : ''}
                      {tokens.map((token, tokenIdx) => {
                        const text = tokenIdx === 0 ? token.text.charAt(0).toUpperCase() + token.text.slice(1) : token.text;
                        const key = `token-${paragraphIdx}-${sentenceIdx}-${tokenIdx}`;
                        return <span key={key}>{text}{tokenIdx < tokens.length - 1 ? ' ' : ''}</span>;
                      })}
                      {/[.!?…]$/.test(tokens[tokens.length - 1]?.text ?? '') ? '' : '.'}
                    </span>
                  ))}
                </p>
              ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>Lorem Fistrum | Hasta luego, Lucas | No te digo trigo por no llamarte Rodrigo</p>
      </footer>
    </>
  );
}

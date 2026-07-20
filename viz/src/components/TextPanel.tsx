import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useMemo } from 'react';
import { ASTData } from '../types';

interface Props {
  data: ASTData | null;
  panelTab: 'text' | 'trace';
  onPanelTabChange: (tab: 'text' | 'trace') => void;
  activeStep: number | null;
  onSelectStep: (idx: number | null) => void;
}

function renderLatex(s: string): string {
  // Convert common patterns to LaTeX
  let tex = s
    .replace(/→/g, '\\to ')
    .replace(/λ/g, '\\lambda ')
    .replace(/Π/g, '\\Pi ')
    .replace(/Σ/g, '\\Sigma ')
    .replace(/∀/g, '\\forall ')
    .replace(/↦/g, '\\mapsto ')
    .replace(/⇒/g, '\\Rightarrow ')
    .replace(/≡/g, '\\equiv ')
    .replace(/≃/g, '\\simeq ')
    .replace(/∧/g, '\\wedge ')
    .replace(/∨/g, '\\vee ')
    .replace(/¬/g, '\\neg ')
    .replace(/⊤/g, '\\top ')
    .replace(/⊥/g, '\\bot ')
    .replace(/𝕀/g, '\\mathbb{I}')
    .replace(/@/g, '\\,{:}\\,')
    .replace(/U(\d+)/g, '\\mathcal{U}_{$1}')
    .replace(/(\w+)_(\w+)/g, '$1\\_{$2}')
    // lambda body arrow
    .replace(/\. /g, '\\,.');

  try {
    return katex.renderToString(tex, { displayMode: false, throwOnError: false });
  } catch {
    return `<code>${escHtml(s)}</code>`;
  }
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function TextPanel({ data, panelTab, onPanelTabChange, activeStep, onSelectStep }: Props) {
  const traceSteps = data?.trace ?? [];

  const textContent = useMemo(() => {
    if (!data) return null;
    const raw = data.rawText || '-';
    const nf = data.normalizedText || '-';
    const ty = data.typeText || '-';
    return { raw, nf, ty };
  }, [data]);

  if (!data) {
    return (
      <div className="right-panel">
        <div className="panel-body">
          <div className="text-section-label" style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)' }}>
            No data loaded
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="right-panel">
      <div className="panel-tabs">
        <button
          className={`panel-tab${panelTab === 'text' ? ' active' : ''}`}
          onClick={() => onPanelTabChange('text')}
        >Source</button>
        <button
          className={`panel-tab${panelTab === 'trace' ? ' active' : ''}`}
          onClick={() => onPanelTabChange('trace')}
        >
          Reduction{traceSteps.length > 0 ? ` (${traceSteps.length})` : ''}
        </button>
      </div>
      <div className="panel-body">
        {panelTab === 'text' && textContent && (
          <>
            <div className="text-section">
              <div className="text-section-label">Type</div>
              <div
                className="text-section-content"
                dangerouslySetInnerHTML={{ __html: renderLatex(textContent.ty) }}
              />
            </div>
            <div className="text-section">
              <div className="text-section-label">Raw</div>
              <div
                className="text-section-content"
                dangerouslySetInnerHTML={{ __html: renderLatex(textContent.raw) }}
              />
            </div>
            <div className="text-section">
              <div className="text-section-label">Normalized</div>
              <div
                className="text-section-content"
                dangerouslySetInnerHTML={{ __html: renderLatex(textContent.nf) }}
              />
            </div>
          </>
        )}
        {panelTab === 'trace' && (
          <TraceStepperInner
            steps={traceSteps}
            activeStep={activeStep}
            onSelectStep={onSelectStep}
          />
        )}
      </div>
    </div>
  );
}

function TraceStepperInner({ steps, activeStep, onSelectStep }: {
  steps: { rule: string; input: string; output: string }[];
  activeStep: number | null;
  onSelectStep: (idx: number | null) => void;
}) {
  if (steps.length === 0) {
    return (
      <div className="text-section">
        <div className="text-section-label">Reduction Steps</div>
        <div className="text-section-content" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          No reduction steps recorded — term is already in normal form.
        </div>
      </div>
    );
  }

  const currentIdx = activeStep ?? 0;

  return (
    <>
      <div className="trace-header">
        <div className="text-section-label" style={{ margin: 0 }}>
          {steps.length} step{steps.length !== 1 ? 's' : ''}
        </div>
        <div className="trace-nav">
          <button disabled={currentIdx <= 0} onClick={() => onSelectStep(currentIdx - 1)}>
            ◀ Prev
          </button>
          <span className="step-indicator">{currentIdx + 1} / {steps.length}</span>
          <button disabled={currentIdx >= steps.length - 1} onClick={() => onSelectStep(currentIdx + 1)}>
            Next ▶
          </button>
        </div>
      </div>
      <div className="trace-list">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`trace-step${i === currentIdx ? ' active' : ''}`}
            onClick={() => onSelectStep(i)}
          >
            <span className="step-num">{i + 1}</span>
            <div className="step-body">
              <span className={`step-rule rule-${s.rule}`}>{s.rule}</span>
              <span className="step-term input">{s.input}</span>
              <span className="step-arrow">→</span>
              <span className="step-term output">{s.output}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

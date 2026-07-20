import { ReductionStep } from '../types';

interface Props {
  steps: ReductionStep[];
  activeStep: number | null;
  onSelectStep: (idx: number | null) => void;
}

export default function TraceStepper({ steps, activeStep, onSelectStep }: Props) {
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
    <div className="text-section">
      <div className="text-section-label">
        <span>Reduction Steps ({steps.length})</span>
        <div className="trace-nav">
          <button
            disabled={currentIdx <= 0}
            onClick={() => onSelectStep(currentIdx - 1)}
          >◀ Prev</button>
          <span className="step-indicator">{currentIdx + 1} / {steps.length}</span>
          <button
            disabled={currentIdx >= steps.length - 1}
            onClick={() => onSelectStep(currentIdx + 1)}
          >Next ▶</button>
        </div>
      </div>
      <div className="trace-list" style={{ maxHeight: 340, overflowY: 'auto' }}>
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
    </div>
  );
}

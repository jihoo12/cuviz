import { ASTNode } from '../types';

interface Props {
  node: ASTNode;
}

const W = 500;
const H = 200;
const PAD = 60;
const LINE_Y = 110;
const LINE_X0 = PAD;
const LINE_X1 = W - PAD;

function renderIntervalLabel(node: ASTNode): string {
  const k = node.kind;
  if (k === 'IntervalTy') return '𝕀';
  if (k === 'Interval') return node.label || 'i';
  if (k === 'Cube') return node.label || '□';
  return node.label || k;
}

function findSubIntervals(node: ASTNode): ASTNode[] {
  const subs: ASTNode[] = [];
  if (node.kind === 'Interval' || node.kind === 'Cube') {
    subs.push(node);
  }
  for (const c of node.children || []) {
    subs.push(...findSubIntervals(c));
  }
  return subs;
}

export default function IntervalDiagram({ node }: Props) {
  const subs = findSubIntervals(node);
  const uniqueKinds = [...new Set(subs.map(s => s.label))];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="geo-diagram">
      <defs>
        <marker id="interval-dot" viewBox="0 0 10 10" refX="5" refY="5"
          markerWidth="8" markerHeight="8">
          <circle cx="5" cy="5" r="4" fill="#e0af68" />
        </marker>
        <linearGradient id="interval-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e0af68" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#7aa2f7" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#e0af68" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Background fill */}
      <rect x={LINE_X0 - 4} y={LINE_Y - 30} width={LINE_X1 - LINE_X0 + 8} height={60}
        rx="4" fill="url(#interval-grad)" />

      {/* The interval line */}
      <line x1={LINE_X0} y1={LINE_Y} x2={LINE_X1} y2={LINE_Y}
        stroke="#e0af68" strokeWidth="3" strokeLinecap="round" />

      {/* Endpoint 0 */}
      <circle cx={LINE_X0} cy={LINE_Y} r="8" fill="#0a0a0f" stroke="#e0af68" strokeWidth="2.5" />
      <text x={LINE_X0} y={LINE_Y + 30} textAnchor="middle" className="geo-label geo-label-lg">
        0
      </text>
      <text x={LINE_X0} y={LINE_Y - 20} textAnchor="middle" className="geo-label geo-label-sm">
        i₀
      </text>

      {/* Endpoint 1 */}
      <circle cx={LINE_X1} cy={LINE_Y} r="8" fill="#0a0a0f" stroke="#e0af68" strokeWidth="2.5" />
      <text x={LINE_X1} y={LINE_Y + 30} textAnchor="middle" className="geo-label geo-label-lg">
        1
      </text>
      <text x={LINE_X1} y={LINE_Y - 20} textAnchor="middle" className="geo-label geo-label-sm">
        i₁
      </text>

      {/* Middle tick marks for sub-intervals */}
      {uniqueKinds.length > 0 && uniqueKinds.slice(0, 5).map((label, i) => {
        const t = (i + 1) / (uniqueKinds.length + 1);
        const x = LINE_X0 + t * (LINE_X1 - LINE_X0);
        return (
          <g key={i}>
            <line x1={x} y1={LINE_Y - 6} x2={x} y2={LINE_Y + 6}
              stroke="#7aa2f7" strokeWidth="1.5" />
            <text x={x} y={LINE_Y + 48} textAnchor="middle" className="geo-label geo-label-sm"
              fill="#7aa2f7">
              {label}
            </text>
          </g>
        );
      })}

      {/* Type label */}
      <text x={W / 2} y={30} textAnchor="middle" className="geo-title">
        {renderIntervalLabel(node)}
      </text>

      {/* Meet/Join/Neg annotations */}
      {subs.some(s => s.label?.includes('∧')) && (
        <text x={W / 2} y={H - 20} textAnchor="middle" className="geo-annotation">
          ∧ = meet (intersection) &nbsp; ∨ = join (union) &nbsp; ¬ = negation (flip)
        </text>
      )}
    </svg>
  );
}

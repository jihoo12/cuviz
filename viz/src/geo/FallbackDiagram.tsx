import { ASTNode } from '../types';

interface Props {
  node: ASTNode;
}

const W = 520;
const H = 300;

export default function FallbackDiagram({ node }: Props) {
  const cx = W / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="geo-diagram">
      <defs>
        <linearGradient id="fb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6a6a8a" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#6a6a8a" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <rect x={40} y={40} width={W - 80} height={H - 80}
        rx="12" fill="url(#fb-grad)" stroke="#6a6a8a" strokeWidth="1" strokeDasharray="8 4" />

      <text x={cx} y={H / 2 - 30} textAnchor="middle" className="geo-title" fill="#6a6a8a">
        {node.kind || '—'}
      </text>

      <text x={cx} y={H / 2} textAnchor="middle" className="geo-label" fill="#5a5a7a">
        {node.label || 'No geometric interpretation available'}
      </text>

      <text x={cx} y={H / 2 + 24} textAnchor="middle" className="geo-annotation" fill="#5a5a7a">
        This term has no direct geometric/topological meaning.
      </text>
      <text x={cx} y={H / 2 + 42} textAnchor="middle" className="geo-annotation" fill="#5a5a7a">
        Switch to AST view to inspect its structure.
      </text>

      {/* Decorative dots */}
      {[0, 1, 2].map(i => (
        <circle key={i} cx={cx - 16 + i * 16} cy={H / 2 + 70} r="3"
          fill="#6a6a8a" fillOpacity="0.4" />
      ))}
    </svg>
  );
}

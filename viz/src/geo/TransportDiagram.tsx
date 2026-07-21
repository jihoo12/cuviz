import { ASTNode } from '../types';

interface Props {
  node: ASTNode;
}

const W = 520;
const H = 340;

function isHComp(node: ASTNode): boolean {
  return node.kind === 'HComp';
}

export default function TransportDiagram({ node }: Props) {
  const cx = W / 2;
  const hcomp = isHComp(node);

  const pathLabel = node.children?.[0]?.label || 'A';
  const baseLabel = node.children?.[1]?.label || 'x₀';
  const tubeLabel = hcomp
    ? node.children?.[2]?.label || 'u'
    : node.children?.[1]?.label || 'x';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="geo-diagram">
      <defs>
        <marker id="trans-arrow" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#73daca" />
        </marker>
        <linearGradient id="fiber-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#73daca" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#73daca" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* Title */}
      <text x={cx} y={28} textAnchor="middle" className="geo-title">
        {hcomp ? 'Homogeneous Composition (hcomp)' : 'Transport'}
      </text>
      <text x={cx} y={46} textAnchor="middle" className="geo-annotation" fill="#73daca">
        {hcomp ? node.label || 'hcomp A [φ] (u) u₀' : node.label || 'transport (λi. A) x₀'}
      </text>

      {/* Base space (interval at bottom) */}
      <line x1={80} y1={H - 80} x2={W - 80} y2={H - 80}
        stroke="#e0af68" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={80} cy={H - 80} r="7" fill="#e0af68" stroke="#0a0a0f" strokeWidth="2" />
      <circle cx={W - 80} cy={H - 80} r="7" fill="#e0af68" stroke="#0a0a0f" strokeWidth="2" />
      <text x={80} y={H - 58} textAnchor="middle" className="geo-label" fill="#e0af68">0</text>
      <text x={W - 80} y={H - 58} textAnchor="middle" className="geo-label" fill="#e0af68">1</text>
      <text x={cx} y={H - 58} textAnchor="middle" className="geo-label" fill="#e0af68">i : 𝕀</text>

      {/* Fiber at i=0 */}
      <rect x={55} y={H - 200} width={50} height={110}
        rx="4" fill="url(#fiber-grad)" stroke="#73daca" strokeWidth="1.5" />
      <text x={80} y={H - 210} textAnchor="middle" className="geo-label geo-label-sm" fill="#73daca">
        A(0)
      </text>
      <circle cx={80} cy={H - 130} r="6" fill="#9ece6a" stroke="#0a0a0f" strokeWidth="1.5" />
      <text x={80} y={H - 112} textAnchor="middle" className="geo-label geo-label-sm" fill="#9ece6a">
        {baseLabel}
      </text>

      {/* Fiber at i=1 */}
      <rect x={W - 105} y={H - 200} width={50} height={110}
        rx="4" fill="url(#fiber-grad)" stroke="#73daca" strokeWidth="1.5" />
      <text x={W - 80} y={H - 210} textAnchor="middle" className="geo-label geo-label-sm" fill="#73daca">
        A(1)
      </text>
      <circle cx={W - 80} cy={H - 130} r="6" fill="#9ece6a" stroke="#0a0a0f" strokeWidth="1.5" />
      <text x={W - 80} y={H - 112} textAnchor="middle" className="geo-label geo-label-sm" fill="#9ece6a">
        transport
      </text>

      {/* Transport arrow */}
      <path d={`M ${80 + 20} ${H - 130} Q ${cx} ${H - 170} ${W - 80 - 20} ${H - 130}`}
        fill="none" stroke="#73daca" strokeWidth="2.5"
        strokeDasharray={hcomp ? '8 4' : 'none'}
        markerEnd="url(#trans-arrow)" />
      <text x={cx} y={H - 178} textAnchor="middle" className="geo-label" fill="#73daca" fontWeight="600">
        {hcomp ? 'hcomp' : 'transport'}
      </text>

      {/* Tube visualization for hcomp */}
      {hcomp && (
        <g>
          {/* Partial tube (solid part) */}
          <rect x={cx - 60} y={H - 260} width={120} height={50}
            rx="4" fill="#73daca" fillOpacity="0.08" stroke="#73daca" strokeWidth="1"
            strokeDasharray="4 3" />
          <text x={cx} y={H - 238} textAnchor="middle" className="geo-label geo-label-sm" fill="#73daca">
            tube (partial path)
          </text>
        </g>
      )}

      {/* Annotation */}
      <text x={cx} y={H - 8} textAnchor="middle" className="geo-annotation">
        {hcomp
          ? 'Fill a partial path: given a tube and a cap, produce a complete path'
          : 'Move a value along a path in the type family'}
      </text>
    </svg>
  );
}

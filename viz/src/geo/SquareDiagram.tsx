import { ASTNode } from '../types';

interface Props {
  node: ASTNode;
}

const W = 440;
const H = 380;
const PAD = 60;

export default function SquareDiagram({ node }: Props) {
  const x0: number = PAD;
  const x1: number = W - PAD;
  const y0: number = PAD + 20;
  const y1: number = H - PAD - 20;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;

  const getFaceLabel = (idx: number): string => {
    const faces = ['p', 'q', 'r', 's'];
    const pathChildren = node.children?.[0]?.children || node.children || [];
    if (pathChildren[idx]?.label) return pathChildren[idx].label;
    return faces[idx] || `f${idx}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="geo-diagram">
      <defs>
        <marker id="sq-arrow" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#7aa2f7" />
        </marker>
      </defs>

      {/* Title */}
      <text x={mx} y={24} textAnchor="middle" className="geo-title">
        Square (2-path)
      </text>
      <text x={mx} y={44} textAnchor="middle" className="geo-annotation" fill="#7dcfff">
        {node.label || 'Path (Path A ...) ...'}
      </text>

      {/* Interior fill */}
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0}
        fill="#7aa2f7" fillOpacity="0.06" stroke="none" />

      {/* Bottom edge: p */}
      <line x1={x0} y1={y1} x2={x1} y2={y1}
        stroke="#f7768e" strokeWidth="2.5" markerEnd="url(#sq-arrow)" />
      <text x={mx} y={y1 + 24} textAnchor="middle" className="geo-label" fill="#f7768e">
        {getFaceLabel(0)}
      </text>

      {/* Top edge: r */}
      <line x1={x0} y1={y0} x2={x1} y2={y0}
        stroke="#f7768e" strokeWidth="2.5" markerEnd="url(#sq-arrow)" />
      <text x={mx} y={y0 - 10} textAnchor="middle" className="geo-label" fill="#f7768e">
        {getFaceLabel(2)}
      </text>

      {/* Left edge: q (going up) */}
      <line x1={x0} y1={y1} x2={x0} y2={y0}
        stroke="#ff9e64" strokeWidth="2.5" markerEnd="url(#sq-arrow)" />
      <text x={x0 - 16} y={my + 4} textAnchor="middle" className="geo-label" fill="#ff9e64">
        {getFaceLabel(1)}
      </text>

      {/* Right edge: s (going up) */}
      <line x1={x1} y1={y1} x2={x1} y2={y0}
        stroke="#ff9e64" strokeWidth="2.5" markerEnd="url(#sq-arrow)" />
      <text x={x1 + 16} y={my + 4} textAnchor="middle" className="geo-label" fill="#ff9e64">
        {getFaceLabel(3)}
      </text>

      {/* Vertex dots */}
      {[
        [x0, y1, 'a'],
        [x1, y1, 'b'],
        [x0, y0, 'c'],
        [x1, y0, 'd'],
      ].map(([vx, vy, lbl], i) => (
        <g key={i}>
          <circle cx={vx} cy={vy} r="7" fill="#9ece6a" stroke="#0a0a0f" strokeWidth="2" />
          <text x={vx} y={Number(vy) + 3} textAnchor="middle" className="geo-node-label">
            {lbl}
          </text>
        </g>
      ))}

      {/* Interior label */}
      <text x={mx} y={my + 4} textAnchor="middle" className="geo-annotation" fill="#7aa2f7" fontWeight="600">
        α
      </text>

      {/* Boundary annotation */}
      <text x={mx} y={H - 16} textAnchor="middle" className="geo-annotation">
        ∂α = s · r · s⁻¹ · p  (boundary of the square)
      </text>
    </svg>
  );
}

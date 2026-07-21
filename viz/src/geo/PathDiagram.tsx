import { ASTNode } from '../types';

interface Props {
  node: ASTNode;
}

const W = 520;
const H = 260;
const PAD_X = 70;
const PAD_Y = 60;

function getTypeLabel(node: ASTNode): string {
  if (node.kind === 'Path') return node.label || 'Path A a b';
  if (node.kind === 'PLam') return node.label || '⟨i⟩ ...';
  if (node.kind === 'PApp') return node.label || '_ @ _';
  return node.label || node.kind;
}

function getEndpointLabel(node: ASTNode, idx: number): string {
  if (node.kind === 'Path' && node.children?.length >= 3) {
    return node.children[1 + idx]?.label || (idx === 0 ? 'a' : 'b');
  }
  return idx === 0 ? 'a' : 'b';
}

function getTypeName(node: ASTNode): string {
  if (node.kind === 'Path' && node.children?.length >= 1) {
    return node.children[0]?.label || 'A';
  }
  return 'A';
}

function renderPathArrow(x0: number, y0: number, x1: number, y1: number,
  curveOffset: number, color: string, label: string, labelSide: 'top' | 'bottom') {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2 + (labelSide === 'top' ? -curveOffset : curveOffset);
  const ctrl1x = x0 + (mx - x0) * 0.5;
  const ctrl1y = y0 + (my - y0) * 0.8;
  const ctrl2x = x1 - (x1 - mx) * 0.5;
  const ctrl2y = y1 - (y1 - my) * 0.8;
  const pathD = `M${x0},${y0} C${ctrl1x},${ctrl1y} ${ctrl2x},${ctrl2y} ${x1},${y1}`;
  const labelY = labelSide === 'top' ? my - 14 : my + 22;

  return (
    <g key={label}>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
        markerEnd="url(#path-arrowhead)" />
      <text x={mx} y={labelY} textAnchor="middle" className="geo-label" fill={color}>
        {label}
      </text>
    </g>
  );
}

export default function PathDiagram({ node }: Props) {
  const cx = W / 2;
  const cy = H / 2 + 10;
  const typeA = getTypeName(node);
  const endpointA = getEndpointLabel(node, 0);
  const endpointB = getEndpointLabel(node, 1);
  const title = getTypeLabel(node);

  const x0 = PAD_X + 30;
  const x1 = W - PAD_X - 30;
  const y0 = cy + 10;
  const y1 = cy - 10;

  const isPLam = node.kind === 'PLam';
  const isPApp = node.kind === 'PApp';
  const isPath = node.kind === 'Path';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="geo-diagram">
      <defs>
        <marker id="path-arrowhead" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f7768e" />
        </marker>
        <marker id="path-arrowhead-rev" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff7a93" />
        </marker>
      </defs>

      {/* Type background */}
      <rect x={PAD_X - 20} y={PAD_Y - 10} width={W - 2 * PAD_X + 40} height={H - 2 * PAD_Y + 40}
        rx="8" fill="#f7768e" fillOpacity="0.04" stroke="#f7768e" strokeWidth="1"
        strokeOpacity="0.15" strokeDasharray="6 4" />

      {/* Type label */}
      <text x={cx} y={PAD_Y - 18} textAnchor="middle" className="geo-title">
        {title}
      </text>
      <text x={cx} y={PAD_Y + 2} textAnchor="middle" className="geo-annotation" fill="#f7768e">
        in type {typeA}
      </text>

      {/* Point A */}
      <circle cx={x0} cy={y0} r="10" fill="#9ece6a" stroke="#0a0a0f" strokeWidth="2" />
      <text x={x0} y={y0 + 3} textAnchor="middle" className="geo-node-label">
        {endpointA}
      </text>

      {/* Point B */}
      <circle cx={x1} cy={y1} r="10" fill="#9ece6a" stroke="#0a0a0f" strokeWidth="2" />
      <text x={x1} y={y1 + 3} textAnchor="middle" className="geo-node-label">
        {endpointB}
      </text>

      {/* The path: a curved arrow from A to B */}
      {renderPathArrow(x0, y0, x1, y1, 50, '#f7768e', 'p', 'top')}

      {/* Refl path (constant) */}
      {isPLam && (
        <text x={cx} y={H - 30} textAnchor="middle" className="geo-annotation" fill="#ff7a93">
          λi. t — constant path (refl-like)
        </text>
      )}

      {isPath && (
        <>
          {/* i=0 face */}
          <line x1={x0 - 20} y1={y0 + 18} x2={x0 + 20} y2={y0 + 18}
            stroke="#9ece6a" strokeWidth="1" strokeDasharray="3 2" />
          <text x={x0} y={y0 + 34} textAnchor="middle" className="geo-label geo-label-sm" fill="#9ece6a">
            i = 0
          </text>

          {/* i=1 face */}
          <line x1={x1 - 20} y1={y1 + 18} x2={x1 + 20} y2={y1 + 18}
            stroke="#9ece6a" strokeWidth="1" strokeDasharray="3 2" />
          <text x={x1} y={y1 + 34} textAnchor="middle" className="geo-label geo-label-sm" fill="#9ece6a">
            i = 1
          </text>
        </>
      )}

      {isPApp && (
        <text x={cx} y={H - 30} textAnchor="middle" className="geo-annotation" fill="#ff7a93">
          Evaluate path at endpoint (i₀ or i₁)
        </text>
      )}

      {/* Interval parameter bar at bottom */}
      <g>
        <line x1={x0} y1={H - 14} x2={x1} y2={H - 14}
          stroke="#e0af68" strokeWidth="1.5" strokeOpacity="0.4" />
        <text x={x0} y={H - 4} textAnchor="middle" className="geo-label geo-label-sm" fill="#e0af68">
          0
        </text>
        <text x={x1} y={H - 4} textAnchor="middle" className="geo-label geo-label-sm" fill="#e0af68">
          1
        </text>
        <text x={cx} y={H - 4} textAnchor="middle" className="geo-label geo-label-sm" fill="#e0af68">
          i : 𝕀
        </text>
      </g>
    </svg>
  );
}

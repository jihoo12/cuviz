import { ASTNode } from '../types';

interface Props {
  node: ASTNode;
}

const W = 520;
const H = 340;

function getEquivKind(node: ASTNode): 'equiv' | 'ua' | 'glue' | 'unglue' {
  if (node.kind === 'Ua') return 'ua';
  if (node.kind === 'Glue' || node.kind === 'GlueElem') return 'glue';
  if (node.kind === 'Unglue') return 'unglue';
  return 'equiv';
}

export default function EquivDiagram({ node }: Props) {
  const cx = W / 2;
  const kind = getEquivKind(node);

  const domLabel = node.children?.[0]?.label || 'A';
  const codLabel = kind === 'ua' ? node.children?.[0]?.label || 'e' : node.children?.[1]?.label || 'B';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="geo-diagram">
      <defs>
        <marker id="equiv-fwd" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#bb9af7" />
        </marker>
        <marker id="equiv-bwd" viewBox="0 0 10 10" refX="1" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 10 0 L 0 5 L 10 10 z" fill="#bb9af7" />
        </marker>
        <marker id="equiv-path" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f7768e" />
        </marker>
      </defs>

      {/* Title */}
      <text x={cx} y={28} textAnchor="middle" className="geo-title">
        {kind === 'ua' && 'Univalence (ua)'}
        {kind === 'glue' && 'Glue Type'}
        {kind === 'unglue' && 'Unglue'}
        {kind === 'equiv' && 'Equivalence'}
      </text>
      <text x={cx} y={46} textAnchor="middle" className="geo-annotation" fill="#bb9af7">
        {node.label || 'Equiv A B'}
      </text>

      {/* Type A (left) */}
      <rect x={40} y={80} width={140} height={160}
        rx="12" fill="#bb9af7" fillOpacity="0.06" stroke="#bb9af7" strokeWidth="1.5" />
      <text x={110} y={110} textAnchor="middle" className="geo-title geo-title-sm" fill="#bb9af7">
        {domLabel}
      </text>
      <circle cx={110} cy={160} r="8" fill="#9ece6a" stroke="#0a0a0f" strokeWidth="2" />
      <text x={110} y={192} textAnchor="middle" className="geo-label geo-label-sm" fill="#9ece6a">
        a
      </text>

      {/* Type B (right) */}
      <rect x={W - 180} y={80} width={140} height={160}
        rx="12" fill="#bb9af7" fillOpacity="0.06" stroke="#bb9af7" strokeWidth="1.5" />
      <text x={W - 110} y={110} textAnchor="middle" className="geo-title geo-title-sm" fill="#bb9af7">
        {codLabel}
      </text>
      <circle cx={W - 110} cy={160} r="8" fill="#9ece6a" stroke="#0a0a0f" strokeWidth="2" />
      <text x={W - 110} y={192} textAnchor="middle" className="geo-label geo-label-sm" fill="#9ece6a">
        b
      </text>

      {/* Forward map f */}
      <path d={`M ${160} ${145} L ${W - 180 - 10} ${145}`}
        fill="none" stroke="#bb9af7" strokeWidth="2.5" markerEnd="url(#equiv-fwd)" />
      <text x={cx} y={138} textAnchor="middle" className="geo-label" fill="#bb9af7" fontWeight="600">
        f (equivFwd)
      </text>

      {/* Backward map g */}
      <path d={`M ${W - 180 - 10} ${175} L ${160} ${175}`}
        fill="none" stroke="#bb9af7" strokeWidth="2" strokeDasharray="5 3"
        markerEnd="url(#equiv-bwd)" />
      <text x={cx} y={198} textAnchor="middle" className="geo-label geo-label-sm" fill="#bb9af7">
        g (section)
      </text>

      {/* Path interpretation for ua */}
      {kind === 'ua' && (
        <g>
          <path d={`M ${cx} ${H - 100} Q ${cx} ${H - 60} ${cx} ${H - 45}`}
            fill="none" stroke="#f7768e" strokeWidth="2.5"
            markerEnd="url(#equiv-path)" />
          <text x={cx} y={H - 108} textAnchor="middle" className="geo-label" fill="#f7768e">
            ua(e) : Path U A B
          </text>
          <text x={cx} y={H - 24} textAnchor="middle" className="geo-annotation">
            Equivalences induce paths between types
          </text>
        </g>
      )}

      {/* Glue annotation */}
      {kind === 'glue' && (
        <g>
          <rect x={cx - 100} y={H - 100} width={200} height={50}
            rx="6" fill="#7dcfff" fillOpacity="0.08" stroke="#7dcfff" strokeWidth="1" />
          <text x={cx} y={H - 78} textAnchor="middle" className="geo-label" fill="#7dcfff">
            Glue B [φ] (A, e)
          </text>
          <text x={cx} y={H - 24} textAnchor="middle" className="geo-annotation">
            Glue A to B along the equivalence on face φ
          </text>
        </g>
      )}

      {/* Default equiv annotation */}
      {kind === 'equiv' && (
        <text x={cx} y={H - 24} textAnchor="middle" className="geo-annotation">
          f has both a left inverse (g) and a right inverse (η, ε)
        </text>
      )}
    </svg>
  );
}

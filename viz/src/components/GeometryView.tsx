import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { ASTNode } from '../types';
import { analyzeAST } from '../geo/analyze';
import IntervalDiagram from '../geo/IntervalDiagram';
import PathDiagram from '../geo/PathDiagram';
import SquareDiagram from '../geo/SquareDiagram';
import HITDiagram from '../geo/HITDiagram';
import TransportDiagram from '../geo/TransportDiagram';
import EquivDiagram from '../geo/EquivDiagram';
import FallbackDiagram from '../geo/FallbackDiagram';

interface Props {
  data: ASTNode | null;
}

export interface GeometryViewHandle {
  fitView: () => void;
}

function renderDiagram(kind: string, node: ASTNode) {
  switch (kind) {
    case 'interval': return <IntervalDiagram node={node} />;
    case 'path': return <PathDiagram node={node} />;
    case 'square': return <SquareDiagram node={node} />;
    case 'hit': return <HITDiagram node={node} />;
    case 'transport': return <TransportDiagram node={node} />;
    case 'equiv': return <EquivDiagram node={node} />;
    default: return <FallbackDiagram node={node} />;
  }
}

function countDescendants(node: ASTNode, kind: string): number {
  let count = node.kind === kind ? 1 : 0;
  for (const c of node.children || []) {
    count += countDescendants(c, kind);
  }
  return count;
}

function getDiagramSections(node: ASTNode): { kind: string; label: string; node: ASTNode }[] {
  if (!node) return [];

  const primary = analyzeAST(node);
  const sections = [{ kind: primary.kind, label: primary.label, node }];

  const pathCount = countDescendants(node, 'Path')
    + countDescendants(node, 'PLam')
    + countDescendants(node, 'PApp');
  const intervalCount = countDescendants(node, 'Interval')
    + countDescendants(node, 'IntervalTy')
    + countDescendants(node, 'Cube');
  const hitCount = countDescendants(node, 'Data');
  const transportCount = countDescendants(node, 'Transport')
    + countDescendants(node, 'HComp');
  const equivCount = countDescendants(node, 'Equiv')
    + countDescendants(node, 'Glue')
    + countDescendants(node, 'Ua');

  if (primary.kind !== 'path' && pathCount > 0) {
    const pathNode = findFirstDescendant(node, ['Path', 'PLam', 'PApp']);
    if (pathNode) sections.push({ kind: 'path', label: 'Path component', node: pathNode });
  }
  if (primary.kind !== 'interval' && intervalCount > 0) {
    const intNode = findFirstDescendant(node, ['Interval', 'IntervalTy', 'Cube']);
    if (intNode) sections.push({ kind: 'interval', label: 'Interval expression', node: intNode });
  }
  if (primary.kind !== 'hit' && hitCount > 0) {
    const hitNode = findFirstDescendant(node, ['Data']);
    if (hitNode) sections.push({ kind: 'hit', label: 'Datatype', node: hitNode });
  }
  if (primary.kind !== 'transport' && transportCount > 0) {
    const tNode = findFirstDescendant(node, ['Transport', 'HComp']);
    if (tNode) sections.push({ kind: 'transport', label: 'Transport', node: tNode });
  }
  if (primary.kind !== 'equiv' && equivCount > 0) {
    const eNode = findFirstDescendant(node, ['Equiv', 'Glue', 'Ua']);
    if (eNode) sections.push({ kind: 'equiv', label: 'Equivalence', node: eNode });
  }

  return sections;
}

function findFirstDescendant(node: ASTNode, kinds: string[]): ASTNode | null {
  if (kinds.includes(node.kind)) return node;
  for (const c of node.children || []) {
    const found = findFirstDescendant(c, kinds);
    if (found) return found;
  }
  return null;
}

const GeometryView = forwardRef<GeometryViewHandle, Props>(({ data }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const fitView = useCallback(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;
    const bbox = svgEl.getBBox();
    if (bbox.width === 0 || bbox.height === 0) return;
    const w = container.clientWidth, h = container.clientHeight, pad = 40;
    const scale = Math.min((w - pad * 2) / bbox.width, (h - pad * 2) / bbox.height, 2);
    d3.select(svgEl).transition().duration(400).call(
      zoomRef.current!.transform,
      d3.zoomIdentity
        .translate(w / 2 - (bbox.x + bbox.width / 2) * scale, h / 2 - (bbox.y + bbox.height / 2) * scale)
        .scale(scale)
    );
  }, []);

  useImperativeHandle(ref, () => ({ fitView }), [fitView]);

  // Init D3 zoom — only once, no DOM clearing
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svg = d3.select(svgEl);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (e) => {
        const g = svg.select<SVGGElement>('g.geo-canvas');
        g.attr('transform', e.transform);
        const zi = document.getElementById('zoom-info');
        if (zi) zi.textContent = `x${e.transform.k.toFixed(2)}`;
      });
    svg.call(zoom);
    zoomRef.current = zoom;

    return () => { svg.on('.zoom', null); };
  }, []);

  // Fit view when data changes
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(fitView, 80);
    return () => clearTimeout(t);
  }, [data, fitView]);

  const sections = data ? getDiagramSections(data) : [];
  const single = sections.length === 1;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ display: 'block' }}>
        {single ? (
          <g className="geo-canvas">
            <foreignObject x="0" y="0" width="600" height="420">
              {renderDiagram(sections[0].kind, sections[0].node)}
            </foreignObject>
          </g>
        ) : sections.length > 1 ? (
          <g className="geo-canvas">
            {sections.map((sec, i) => (
              <g key={i} transform={`translate(20, ${i * 400})`}>
                <foreignObject x="0" y="0" width="560" height="400">
                  {renderDiagram(sec.kind, sec.node)}
                </foreignObject>
              </g>
            ))}
          </g>
        ) : (
          <g className="geo-canvas">
            <text x="50%" y="50%" textAnchor="middle" fill="#5a5a7a" fontSize="14">
              No data loaded
            </text>
          </g>
        )}
      </svg>
    </div>
  );
});

GeometryView.displayName = 'GeometryView';
export default GeometryView;

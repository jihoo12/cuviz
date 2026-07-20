import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { ASTNode } from '../types';

const kindColor: Record<string, string> = {
  Var: '#9ece6a', App: '#ff9e64', Abs: '#7aa2f7', Univ: '#bb9af7',
  IntervalTy: '#e0af68', Interval: '#e0af68', Cube: '#e0af68',
  Pi: '#7dcfff', Path: '#f7768e', PLam: '#ff7a93', PApp: '#ff9e64',
  HComp: '#73daca', Equiv: '#bb9af7', MkEquiv: '#bb9af7',
  EquivFwd: '#bb9af7', Ua: '#bb9af7', Transport: '#73daca',
  Glue: '#7dcfff', GlueElem: '#7dcfff', Unglue: '#7dcfff',
  Sigma: '#7dcfff', Pair: '#ff9e64', Fst: '#ff9e64', Snd: '#ff9e64',
  Data: '#c0caf5', Con: '#9ece6a', PCon: '#ff7a93', Elim: '#f7768e', Case: '#f7768e',
};

const colorOf = (k: string) => kindColor[k] || '#6a6a8a';

interface HierNode extends d3.HierarchyNode<ASTNode> {
  _children?: HierNode[];
  x0: number;
  y0: number;
}

function assertPoint(n: HierNode): { x: number; y: number } {
  return { x: n.x!, y: n.y! };
}

interface Props {
  data: ASTNode | null;
  searchQuery: string;
  onNodeHover: (d: ASTNode | null) => void;
}

export interface ASTTreeHandle {
  fitView: () => void;
  expandAll: () => void;
  collapseAll: () => void;
}

const ASTTree = forwardRef<ASTTreeHandle, Props>(({ data, searchQuery, onNodeHover }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HierNode | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const collapse = useCallback((d: HierNode) => {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = undefined;
    }
  }, []);

  const applySearch = useCallback((query: string) => {
    const root = rootRef.current;
    if (!root) return;
    const svg = d3.select(svgRef.current!);
    const allNodes = svg.selectAll<SVGGElement, HierNode>('.node');
    const allLinks = svg.selectAll<SVGPathElement, d3.HierarchyLink<ASTNode>>('.link');
    const q = query.trim().toLowerCase();
    if (!q) {
      allNodes.classed('dimmed', false).classed('highlighted', false);
      allLinks.classed('dimmed', false).classed('highlighted', false);
      return;
    }
    const matchIds = new Set<number>();
    root.descendants().forEach(d => {
      const kind = (d.data.kind || '').toLowerCase();
      const label = (d.data.label || '').toLowerCase();
      if (kind.includes(q) || label.includes(q)) matchIds.add(d.data.id);
    });
    allNodes.classed('dimmed', d => !matchIds.has(d.data.id))
      .classed('highlighted', d => matchIds.has(d.data.id));
    allLinks.classed('dimmed', d => !matchIds.has(d.target.data.id))
      .classed('highlighted', d => matchIds.has(d.target.data.id));
  }, []);

  const updateTree = useCallback((source: HierNode) => {
    const svg = d3.select(svgRef.current!);
    const container = svg.select('g');
    if (!rootRef.current) return;

    d3.tree<ASTNode>().nodeSize([28, 220]).separation((a, b) =>
      a.parent === b.parent ? 1 : 1.3
    )(rootRef.current as d3.HierarchyNode<ASTNode>);

    const nodes = rootRef.current.descendants() as HierNode[];
    const links = rootRef.current.links();

    const linkGroup = container.select<SVGGElement>('g.links');
    const nodeGroup = container.select<SVGGElement>('g.nodes');

    const diag = (s: { x: number; y: number }, d: { x: number; y: number }) =>
      `M${s.y},${s.x}C${(s.y + d.y) / 2},${s.x} ${(s.y + d.y) / 2},${d.x} ${d.y},${d.x}`;

    const sp = assertPoint(source);
    const link = linkGroup.selectAll<SVGPathElement, d3.HierarchyLink<ASTNode>>('.link')
      .data(links, d => String(d.target.data.id));

    link.enter().append('path').attr('class', 'link')
      .attr('d', () => diag(sp, sp))
      .merge(link).transition().duration(350)
      .attr('d', d => diag(
        { x: d.source.x!, y: d.source.y! },
        { x: d.target.x!, y: d.target.y! }
      ));

    link.exit().transition().duration(350)
      .attr('d', () => diag(sp, sp)).remove();

    const node = nodeGroup.selectAll<SVGGElement, HierNode>('.node')
      .data(nodes, d => String(d.data.id));

    const nodeEnter = node.enter().append('g').attr('class', 'node')
      .attr('transform', `translate(${source.y!},${source.x!})`)
      .on('click', (_e, d) => {
        if (d.children) { d._children = d.children; d.children = undefined; }
        else if (d._children) { d.children = d._children; d._children = undefined; }
        updateTree(d);
      })
      .on('mouseenter', (_e, d) => onNodeHover(d.data))
      .on('mouseleave', () => onNodeHover(null));

    nodeEnter.append('circle').attr('r', 0)
      .attr('fill', d => colorOf(d.data.kind));
    nodeEnter.append('text').attr('dy', '.35em').attr('x', 0)
      .attr('text-anchor', 'middle').text('');
    nodeEnter.append('text').attr('class', 'badge')
      .attr('dy', '-.7em').attr('x', 0).attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-muted)').attr('font-size', '9px').text('');

    const nodeMerge = nodeEnter.merge(node);
    nodeMerge.transition().duration(350)
      .attr('transform', d => `translate(${d.y!},${d.x!})`);
    nodeMerge.select('circle').transition().duration(350)
      .attr('r', d => d._children ? 9 : 6)
      .attr('fill', d => colorOf(d.data.kind))
      .attr('stroke', d => d3.color(colorOf(d.data.kind))?.darker(0.5)?.toString() ?? '');
    nodeMerge.select('text:not(.badge)')
      .attr('dy', d => d._children ? '-1.1em' : (d.children ? '1.4em' : '-1.1em'))
      .attr('text-anchor', 'middle')
      .text(d => d.data.label || d.data.kind);
    nodeMerge.select('.badge')
      .text(d => d._children ? String(d._children.length) : '');

    node.exit().transition().duration(350)
      .attr('transform', `translate(${source.y!},${source.x!})`)
      .remove().select('circle').attr('r', 0);

    if (searchQuery) applySearch(searchQuery);
  }, [searchQuery, applySearch, onNodeHover]);

  // Expose imperative methods
  const fitView = useCallback(() => {
    const el = svgRef.current;
    if (!el) return;
    const g = d3.select(el).select('g').node() as SVGGElement | null;
    if (!g) return;
    const bounds = g.getBBox();
    if (bounds.width === 0 || bounds.height === 0) return;
    const w = el.clientWidth, h = el.clientHeight, pad = 60;
    const scale = Math.min((w - pad * 2) / bounds.width, (h - pad * 2) / bounds.height, 2.5);
    d3.select(el).transition().duration(400).call(
      zoomRef.current!.transform,
      d3.zoomIdentity
        .translate(w / 2 - (bounds.x + bounds.width / 2) * scale, h / 2 - (bounds.y + bounds.height / 2) * scale)
        .scale(scale)
    );
  }, []);

  const expandAll = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    root.each(d => { const n = d as HierNode; if (n._children) { n.children = n._children; delete n._children; } });
    if (rootRef.current) updateTree(rootRef.current);
    setTimeout(fitView, 400);
  }, [updateTree, fitView]);

  const collapseAll = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    root.each(d => { const n = d as HierNode; if (n.children && n.depth > 0) { n._children = n.children; n.children = undefined; } });
    if (rootRef.current) updateTree(rootRef.current);
    setTimeout(fitView, 400);
  }, [updateTree, fitView]);

  useImperativeHandle(ref, () => ({ fitView, expandAll, collapseAll }), [fitView, expandAll, collapseAll]);

  // Init D3
  useEffect(() => {
    const svgEl = svgRef.current!;
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    const container = svg.append('g');
    container.append('g').attr('class', 'links');
    container.append('g').attr('class', 'nodes');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 5])
      .on('zoom', (e) => {
        container.attr('transform', e.transform);
        const zi = document.getElementById('zoom-info');
        if (zi) zi.textContent = `x${e.transform.k.toFixed(2)}`;
      });
    svg.call(zoom);
    zoomRef.current = zoom;

    return () => { svg.on('.zoom', null); };
  }, []);

  // Load new tree data
  useEffect(() => {
    if (!data) return;
    rootRef.current = d3.hierarchy(data) as HierNode;
    rootRef.current.x0 = 0;
    rootRef.current.y0 = 0;
    if (rootRef.current.children?.length) {
      rootRef.current.children.forEach(collapse);
    }
    updateTree(rootRef.current);
    setTimeout(fitView, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Re-apply search
  useEffect(() => {
    if (rootRef.current) applySearch(searchQuery);
  }, [searchQuery, applySearch]);

  return <svg ref={svgRef} />;
});

ASTTree.displayName = 'ASTTree';
export default ASTTree;

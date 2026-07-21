import { ASTNode, GeoDiagram } from '../types';

function childKinds(node: ASTNode): string[] {
  return (node.children || []).map(c => c.kind);
}

function findChild(node: ASTNode, kind: string): ASTNode | undefined {
  return node.children?.find(c => c.kind === kind);
}

function hasDescendant(node: ASTNode, kind: string): boolean {
  if (node.kind === kind) return true;
  return node.children?.some(c => hasDescendant(c, kind)) ?? false;
}

function countDescendants(node: ASTNode, kind: string): number {
  let count = node.kind === kind ? 1 : 0;
  for (const c of node.children || []) {
    count += countDescendants(c, kind);
  }
  return count;
}

function isIntervalExpr(node: ASTNode): boolean {
  return node.kind === 'Interval' || node.kind === 'IntervalTy' || node.kind === 'Cube';
}

function isPathType(node: ASTNode): boolean {
  return node.kind === 'Path';
}

function isPathLam(node: ASTNode): boolean {
  return node.kind === 'PLam';
}

function isPathApp(node: ASTNode): boolean {
  return node.kind === 'PApp';
}

function isSquare(node: ASTNode): boolean {
  if (node.kind === 'Path') {
    const child0 = node.children?.[0];
    if (child0?.kind === 'Path') return true;
    if (child0?.kind === 'Pi' && hasDescendant(child0, 'Path')) return true;
  }
  if (node.kind === 'Pi') {
    const body = node.children?.[1];
    if (body && isSquare(body)) return true;
  }
  return false;
}

function isHITType(node: ASTNode): boolean {
  return node.kind === 'Data';
}

function isTransport(node: ASTNode): boolean {
  return node.kind === 'Transport' || node.kind === 'HComp';
}

function isEquiv(node: ASTNode): boolean {
  return (
    node.kind === 'Equiv' ||
    node.kind === 'MkEquiv' ||
    node.kind === 'EquivFwd' ||
    node.kind === 'Ua' ||
    node.kind === 'Glue' ||
    node.kind === 'GlueElem' ||
    node.kind === 'Unglue'
  );
}

export function analyzeAST(node: ASTNode): GeoDiagram {
  if (!node || !node.kind) {
    return { kind: 'fallback', node, label: 'Empty node' };
  }

  if (isSquare(node)) {
    return { kind: 'square', node, label: 'Square (2-path)' };
  }

  if (isPathType(node) || isPathLam(node) || isPathApp(node)) {
    const desc = isPathType(node)
      ? 'Path type'
      : isPathLam(node)
        ? 'Path abstraction'
        : 'Path application';
    return { kind: 'path', node, label: desc };
  }

  if (isIntervalExpr(node)) {
    return { kind: 'interval', node, label: 'Interval expression' };
  }

  if (isTransport(node)) {
    return { kind: 'transport', node, label: 'Transport' };
  }

  if (isEquiv(node)) {
    return { kind: 'equiv', node, label: 'Equivalence / Glue' };
  }

  if (isHITType(node)) {
    const pconCount = countDescendants(node, 'PCon');
    return {
      kind: 'hit',
      node,
      label: pconCount > 0 ? 'Higher Inductive Type' : 'Datatype',
    };
  }

  const pathCount = countDescendants(node, 'Path')
    + countDescendants(node, 'PLam')
    + countDescendants(node, 'PApp');
  if (pathCount > 0) {
    return { kind: 'path', node, label: `Contains ${pathCount} path component${pathCount > 1 ? 's' : ''}` };
  }

  const intervalCount = countDescendants(node, 'Interval')
    + countDescendants(node, 'IntervalTy')
    + countDescendants(node, 'Cube');
  if (intervalCount > 0) {
    return { kind: 'interval', node, label: `Contains ${intervalCount} interval expression${intervalCount > 1 ? 's' : ''}` };
  }

  if (hasDescendant(node, 'Transport') || hasDescendant(node, 'HComp')) {
    return { kind: 'transport', node, label: 'Contains transport/hcomp' };
  }

  if (hasDescendant(node, 'Equiv') || hasDescendant(node, 'Glue') || hasDescendant(node, 'Ua')) {
    return { kind: 'equiv', node, label: 'Contains equivalence/Glue' };
  }

  return { kind: 'fallback', node, label: 'No geometric interpretation' };
}

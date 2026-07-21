export interface ASTNode {
  id: number;
  kind: string;
  label: string;
  children: ASTNode[];
}

export interface ReductionStep {
  rule: string;
  input: string;
  output: string;
}

export interface ASTData {
  definition: string;
  rawText: string;
  typeText: string;
  normalizedText: string;
  trace: ReductionStep[];
  type: ASTNode;
  raw: ASTNode;
  normalized: ASTNode;
}

export type View = 'normalized' | 'raw' | 'type' | 'geometry';

export type GeoKind =
  | 'interval'
  | 'path'
  | 'square'
  | 'hit'
  | 'transport'
  | 'equiv'
  | 'fallback';

export interface GeoDiagram {
  kind: GeoKind;
  node: ASTNode;
  label: string;
}

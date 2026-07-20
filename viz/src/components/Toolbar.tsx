import { View, ASTData } from '../types';

interface Props {
  data: ASTData | null;
  view: View;
  onViewChange: (v: View) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenFile: () => void;
  onFit: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  panelOpen: boolean;
  onTogglePanel: () => void;
}

export default function Toolbar({
  data, view, onViewChange, searchQuery, onSearchChange,
  onOpenFile, onFit, onExpand, onCollapse,
  panelOpen, onTogglePanel,
}: Props) {
  const searchCount = searchQuery.trim()
    ? document.querySelectorAll('.node.highlighted').length
    : 0;

  return (
    <header className="header">
      <span className="header-title">Cubical AST</span>

      <span className="header-sep" />

      <button className="btn" onClick={onOpenFile}>Open</button>

      {data && (
        <>
          <span className="header-sep" />

          <div className="tab-bar">
            {(['normalized', 'raw', 'type'] as View[]).map(v => (
              <button
                key={v}
                className={`tab${view === v ? ' active' : ''}`}
                onClick={() => onViewChange(v)}
              >
                {v}
              </button>
            ))}
          </div>

          <span className="header-def">{data.definition}</span>
        </>
      )}

      <div className="header-spacer" />

      {data && (
        <>
          <input
            className="search-box"
            type="text"
            placeholder="Search kind or label… (⌘K)"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') { onSearchChange(''); (e.target as HTMLInputElement).blur(); }
            }}
          />
          {searchCount > 0 && <span className="search-count">{searchCount} match{searchCount !== 1 ? 'es' : ''}</span>}

          <button className="btn btn-icon" onClick={onFit} title="Fit view (F)">⊡</button>
          <button className="btn btn-icon" onClick={onExpand} title="Expand all (E)">⊕</button>
          <button className="btn btn-icon" onClick={onCollapse} title="Collapse all (C)">⊖</button>

          <span className="header-sep" />

          <button
            className={`btn${panelOpen ? ' active' : ''}`}
            onClick={onTogglePanel}
            title="Toggle panel (T)"
          >
            Panel
          </button>
        </>
      )}
    </header>
  );
}

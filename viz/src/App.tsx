import { useState, useCallback, useRef, useEffect } from 'react';
import type { ASTData, View } from './types';
import ASTTree, { type ASTTreeHandle } from './components/ASTTree';
import GeometryView, { type GeometryViewHandle } from './components/GeometryView';
import TextPanel from './components/TextPanel';
import Toolbar from './components/Toolbar';
import DropZone from './components/DropZone';

export default function App() {
  const [data, setData] = useState<ASTData | null>(null);
  const [view, setView] = useState<View>('normalized');
  const [searchQuery, setSearchQuery] = useState('');
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelTab, setPanelTab] = useState<'text' | 'trace'>('text');
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [treeKey, setTreeKey] = useState(0);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const treeRef = useRef<ASTTreeHandle>(null);
  const geoRef = useRef<GeometryViewHandle>(null);

  const handleFile = useCallback((raw: unknown) => {
    const d = raw as ASTData;
    setData(d);
    setView(d.normalized ? 'normalized' : (d.raw ? 'raw' : 'type'));
    setActiveStep(null);
    setPanelTab('text');
    setSearchQuery('');
    setTreeKey(k => k + 1);
  }, []);

  const handleViewChange = useCallback((v: View) => {
    setView(v);
    setTreeKey(k => k + 1);
  }, []);

  // Auto-fetch /term.json if served (single-command workflow)
  useEffect(() => {
    fetch('/term.json')
      .then(r => { if (r.ok) return r.json(); throw new Error(); })
      .then(d => { if (d && (d.raw || d.normalized || d.type)) handleFile(d); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'f' || e.key === 'F') treeRef.current?.fitView();
      if (e.key === 'e' || e.key === 'E') treeRef.current?.expandAll();
      if (e.key === 'c' || e.key === 'C') treeRef.current?.collapseAll();
      if (e.key === 't' || e.key === 'T') setPanelOpen(p => !p);
      if (e.key === '1') handleViewChange('normalized');
      if (e.key === '2') handleViewChange('raw');
      if (e.key === '3') handleViewChange('type');
      if (e.key === '4') handleViewChange('geometry');
      if (e.key === 'Escape') setSearchQuery('');
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        (document.querySelector('.search-box') as HTMLInputElement)?.focus();
      }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && panelTab === 'trace' && data?.trace?.length) {
        const idx = activeStep ?? 0;
        if (e.key === 'ArrowDown' && idx < data.trace.length - 1) setActiveStep(idx + 1);
        if (e.key === 'ArrowUp' && idx > 0) setActiveStep(idx - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleViewChange, panelTab, data, activeStep]);

  // Open file dialog helper
  const openFileDialog = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          try { handleFile(JSON.parse(reader.result as string)); }
          catch (err) { alert(`Invalid JSON: ${(err as Error).message}`); }
        };
        reader.readAsText(file);
      }
    });
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }, [handleFile]);

  const treeData = data ? (view === 'geometry' ? null : data[view]) : null;
  const isGeo = view === 'geometry';

  return (
    <div className="app">
      <Toolbar
        data={data}
        view={view}
        onViewChange={handleViewChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenFile={openFileDialog}
        onFit={() => isGeo ? geoRef.current?.fitView() : treeRef.current?.fitView()}
        onExpand={() => treeRef.current?.expandAll()}
        onCollapse={() => treeRef.current?.collapseAll()}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen(p => !p)}
      />

      <div className="main-area">
        <div className="tree-container">
          {isGeo ? (
            <GeometryView
              key={treeKey}
              ref={geoRef}
              data={data?.raw ?? data?.normalized ?? data?.type ?? null}
            />
          ) : (
            <ASTTree
              key={treeKey}
              ref={treeRef}
              data={treeData}
              searchQuery={searchQuery}
              onNodeHover={node => setHoverNode(node?.label ?? null)}
            />
          )}
          <div id="zoom-info" className={`zoom-info${!panelOpen ? ' panel-collapsed' : ''}`}>x1.00</div>
        </div>

        {data && (
          <TextPanel
            data={data}
            panelTab={panelTab}
            onPanelTabChange={setPanelTab}
            activeStep={activeStep}
            onSelectStep={setActiveStep}
            panelOpen={panelOpen}
          />
        )}
      </div>

      {/* Info bar */}
      <div className="info-bar">
        {hoverNode ? (
          <>
            <div className="label">Hovered</div>
            <div className="value">{hoverNode}</div>
          </>
        ) : activeStep !== null && data?.trace?.[activeStep] ? (
          <>
            <div className="label">
              Step {activeStep + 1} / {data.trace.length}
              <span style={{ marginLeft: 8, color: 'var(--accent-teal)' }}>
                [{data.trace[activeStep].rule}]
              </span>
            </div>
            <div className="label" style={{ marginTop: 2 }}>Input</div>
            <div className="value">{data.trace[activeStep].input}</div>
            <div className="label" style={{ marginTop: 2 }}>Output</div>
            <div className="value">{data.trace[activeStep].output}</div>
          </>
        ) : (
          <div className="label">Hover a node or select a reduction step</div>
        )}
      </div>

      <DropZone onFile={handleFile} visible={!data} />
    </div>
  );
}

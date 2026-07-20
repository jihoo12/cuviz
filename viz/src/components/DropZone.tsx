import { useRef, useCallback } from 'react';

interface Props {
  onFile: (data: unknown) => void;
  visible: boolean;
}

export default function DropZone({ onFile, visible }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCount = useRef(0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCount.current = 0;
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) readFile(file, onFile);
  }, [onFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file, onFile);
  }, [onFile]);

  if (!visible) return null;

  return (
    <div
      className="drop-zone"
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onDrop={handleDrop}
    >
      <div className="drop-hint">
        <div className="icon">⬡</div>
        Drop a <code>.json</code> AST file here<br />
        or <strong style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => inputRef.current?.click()}>click to browse</strong>
        <div className="sub">
          cargo run --bin cubical-viz -- file.uwuc &gt; term.json
        </div>
      </div>
      <input ref={inputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileInput} />
    </div>
  );
}

function readFile(file: File, onFile: (data: unknown) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    try { onFile(JSON.parse(reader.result as string)); }
    catch (err) { alert(`Invalid JSON: ${(err as Error).message}`); }
  };
  reader.readAsText(file);
}

# cuviz

A cubical type theory visualizer. Parses and typechecks cubical lambda terms (`.uwuc` files), normalizes them via NbE, and renders the AST as an interactive tree with step-by-step reduction traces and geometric/topological diagrams.

## Architecture

```
uwuc source ──► Rust backend ──► JSON ──► React/D3 frontend
                 ├─ parser              ├─ AST tree (collapsible, searchable)
                 ├─ typechecker         ├─ geometry view (path, HIT, transport diagrams)
                 ├─ NbE evaluator       ├─ text panel (KaTeX-rendered)
                 └─ JSON exporter       └─ reduction trace stepper
```

## Quick Start

### Prerequisites

- Rust (edition 2024)
- Node.js >= 18

### 1. Export and visualize in one step

```sh
./serve.sh examples/examples.uwuc
```

This exports the AST to `viz/public/term.json`, starts the dev server, and auto-loads the data in the browser — no drag-and-drop needed.

Optionally specify a definition name:

```sh
./serve.sh examples/examples.uwuc main
```

### 2. Manual workflow

```sh
# Export only
cargo run --bin cubical-viz -- examples/examples.uwuc main > term.json

# Open the visualizer and drag-and-drop term.json
cd viz && npm install && npm run dev
```

## Language

The `.uwuc` surface syntax supports:

- **Datatypes** with ordinary and path constructors (Higher Inductive Types)
- **Dependent types**: Pi, Sigma, universes (`U0`, `U1`, ...)
- **Cubical primitives**: interval type `I`, path abstraction `<i>`, path application `@`, `hcomp`, `transport`, `Glue`/`unglue`, equivalences (`ua`)
- **Pattern matching** and dependent eliminators (`elim`)
- **Imports** (`import "file.uwuc"`)

### Example

```
data S1 =
  | base : S1
  | loop : S1 [ base , base ]

def flipLoop : S1 -> S1 =
  \x. match x return S1 with
    | base => base
    | loop i => <i> loop @ (~ i)
```

## Frontend

- **Four views**: raw AST, normalized form, type, geometry
- **Collapsible tree** with zoom/pan (D3)
- **Geometry view** with topological diagrams:
  - **Interval** — abstract interval `𝕀` with endpoints, meet/join/negation
  - **Path types** — curves between points, path abstraction/application
  - **Squares** — 2-dimensional path diagrams (path algebra)
  - **Higher Inductive Types** — S¹ circle, torus, generic HIT boundaries
  - **Transport** — fiber bundle diagrams for transport/hcomp
  - **Equivalences** — Glue types, univalence, ua
- **KaTeX** rendering of type-theoretic notation
- **Reduction trace** stepper showing each β-reduction step
- **Search** across AST nodes
- **Collapsible side panel** (press `T` or click "Panel")
- Keyboard shortcuts: `F` fit view, `E` expand, `C` collapse, `1/2/3/4` switch views, `T` toggle panel, `Ctrl+K` focus search

## FFI

The Rust crate exposes a C FFI for embedding in other languages:

| Function | Signature | Description |
|----------|-----------|-------------|
| `cubical_eval` | `(source: *const c_char) -> *mut c_char` | Evaluate source, return `"name = result"` |
| `cubical_eval_json` | `(source: *const c_char) -> *mut c_char` | Evaluate source, return JSON |
| `cubical_eval_int` | `(source: *const c_char) -> i64` | Evaluate source, return integer (Nat only) |
| `cubical_free_string` | `(s: *mut c_char)` | Free a returned string |
| `cubical_get_last_error` | `() -> *mut c_char` | Get last error message |

## Project Structure

```
cuviz/
├── src/
│   ├── bin/cubical-viz.rs   # CLI: exports AST + trace as JSON
│   ├── lib.rs               # Library root
│   └── cubical/
│       ├── syntax.rs         # Core term syntax (de Bruijn)
│       ├── parser/           # Lexer + grammar parser
│       ├── typechecker.rs    # Bidirectional type checking
│       ├── nbe.rs            # Normalization by evaluation
│       ├── equality.rs       # Definitional equality
│       ├── interval.rs       # Cubical interval + DNF faces
│       ├── env.rs            # Typing environment
│       ├── json.rs           # JSON/AST export
│       └── ffi.rs            # C FFI bindings
├── viz/                      # React + D3 visualization
│   └── src/
│       ├── App.tsx           # Main app shell
│       ├── types.ts          # TypeScript interfaces
│       ├── components/
│       │   ├── ASTTree.tsx       # D3 collapsible tree
│       │   ├── GeometryView.tsx  # Geometry/topology diagrams
│       │   ├── TextPanel.tsx     # KaTeX type/trace display
│       │   ├── Toolbar.tsx       # Header controls
│       │   └── DropZone.tsx      # File drop target
│       └── geo/              # Diagram renderers
│           ├── analyze.ts        # AST → diagram classifier
│           ├── IntervalDiagram.tsx
│           ├── PathDiagram.tsx
│           ├── SquareDiagram.tsx
│           ├── HITDiagram.tsx
│           ├── TransportDiagram.tsx
│           ├── EquivDiagram.tsx
│           └── FallbackDiagram.tsx
├── examples/                 # Sample .uwuc programs
└── Cargo.toml
```

## License

Apache 2.0

# cuviz

A cubical type theory visualizer. Parses and typechecks cubical lambda terms (`.uwuc` files), normalizes them via NbE, and renders the AST as an interactive tree with step-by-step reduction traces.

## Architecture

```
uwuc source ──► Rust backend ──► JSON ──► React/D3 frontend
                 ├─ parser              ├─ AST tree (collapsible, searchable)
                 ├─ typechecker         ├─ text panel (KaTeX-rendered)
                 ├─ NbE evaluator       └─ reduction trace stepper
                 └─ JSON exporter
```

## Quick Start

### Prerequisites

- Rust (edition 2024)
- Node.js >= 18

### 1. Export an AST

```sh
cargo run --bin cubical-viz -- examples/examples.uwuc main > term.json
```

### 2. Visualize

```sh
cd viz && npm install && npm run dev
```

Open `http://localhost:5173` and drop `term.json` onto the page, or use the file picker.

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

- **Three views**: raw AST, normalized form, type
- **Collapsible tree** with zoom/pan (D3)
- **KaTeX** rendering of type-theoretic notation
- **Reduction trace** stepper showing each β-reduction step
- **Search** across AST nodes
- Keyboard shortcuts: `F` fit view, `E` expand, `C` collapse, `1/2/3` switch views, `T` toggle panel, `Ctrl+K` focus search

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
│       └── components/
│           ├── ASTTree.tsx   # D3 collapsible tree
│           ├── TextPanel.tsx # KaTeX type/trace display
│           ├── Toolbar.tsx   # Header controls
│           ├── DropZone.tsx  # File drop target
│           └── TraceStepper.tsx
├── examples/                 # Sample .uwuc programs
└── Cargo.toml
```

## License

Apache 2.0

# Proof Visualizer

A tool to visualize large tree-like data structures. Load S-expression files (from upload or URL), parse them into trees, and explore the structure with expandable nodes. Uses lazy rendering so large files stay manageable.

## Features

- **File input**: Upload S-EXPR files or load from a URL (with optional CORS proxy)
- **Multiple S-expressions**: Parses files containing multiple S-expressions; each is shown as a separate tree
- **Lazy rendering**: Child nodes are rendered only when expanded, reducing memory use for huge trees
- **S-EXPR parsing**: Custom parser for S-expressions (lists, atoms, quoted strings, `|quoted atoms|`, comments)
- **let / let-proof**: Bindings are added to a leaf map so references resolve to the bound nodes

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production (output in `dist/`, with relative asset paths for deployment):

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

Load an S-EXPR file by uploading it or entering a URL. If the server blocks cross-origin requests, enable “Use CORS proxy”. The parser accepts:

- Lists: `(a b c)`
- Quoted strings: `"text"`
- Quoted atoms: `|text with spaces|`
- Line comments: `; comment`

The visualizer shows each top-level S-expression as a tree. Click “Show children” on a root or click a child box to expand and render that node’s children on demand.

## Project Structure

```
proofvisualizer/
├── src/
│   ├── main.ts              # Entry point; wires up FileInputUI and ProofVisualizer
│   ├── ProofVisualizer.ts   # Tree visualization with lazy-expand nodes
│   ├── FileInputUI.ts       # File upload and URL input UI
│   ├── FileLoader.ts        # Load from File or URL; parse and convert to TreeNode[]
│   ├── SExprParser.ts       # S-expression parser (parse / parseAll)
│   ├── SExprToTree.ts       # S-EXPR → TreeNode; leafMap; let/let-proof handling
│   ├── types.ts             # TreeNode and related type definitions
│   └── styles.css            # Styles for tree, file input, and UI
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite config (base: './' for relative asset URLs)
├── .gitignore
└── README.md                # This file
```

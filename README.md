# Proof Visualizer

A tool to visualize large tree-like data structures. The visualizer shows the root node and provides expandable boxes for child nodes, allowing you to explore the tree structure incrementally.

## Features

- Displays the root node of the tree
- Shows collapsible boxes for child nodes
- Displays node names when available
- Expandable/collapsible nodes for efficient navigation of large trees

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

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

The visualizer accepts a `TreeNode` structure. Each node can have:
- An optional `name` property
- A `children` array containing child nodes

Example:

```typescript
const tree: TreeNode = {
    name: "Root",
    children: [
        { name: "Child 1", children: [] },
        { children: [{ name: "Grandchild", children: [] }] }
    ]
};
```

## Project Structure

```
proofvisualizer/
├── src/
│   ├── main.ts              # Entry point
│   ├── ProofVisualizer.ts   # Main visualizer class
│   ├── types.ts             # TypeScript type definitions
│   └── styles.css           # Styles (if needed)
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md               # This file
```

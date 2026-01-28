import { ProofVisualizer } from './ProofVisualizer';
import { FileInputUI } from './FileInputUI';
import { TreeNode } from './types';

// Initialize the visualizer
const treeContainer = document.getElementById('tree-container');
const inputContainer = document.getElementById('input-container');

if (!treeContainer || !inputContainer) {
    throw new Error('Required DOM elements not found');
}

const visualizer = new ProofVisualizer(treeContainer);

// Create file input UI (no reference needed; it sets up the DOM and event handlers)
new FileInputUI(
    inputContainer,
    (trees: TreeNode[]) => {
        console.log(`[main] ${trees.length} tree(s) loaded successfully, rendering...`);
        visualizer.renderAll(trees);
    },
    (error: Error) => {
        console.error('[main] Error callback triggered:', error);
        console.error('[main] Error name:', error.name);
        console.error('[main] Error message:', error.message);
        console.error('[main] Error stack:', error.stack);
    }
);

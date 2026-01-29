import { TreeNode } from './types';

/**
 * Visualizes a tree structure with expandable nodes.
 * Shows the root node and collapsible boxes for children.
 * Uses lazy rendering to handle large trees efficiently.
 */
export class ProofVisualizer {
    private container: HTMLElement;
    // Map to store TreeNode data for each DOM element
    private nodeDataMap = new WeakMap<HTMLElement, TreeNode>();

    constructor(container: HTMLElement) {
        this.container = container;
    }

    /**
     * Renders a single tree structure starting from the root node.
     */
    render(root: TreeNode): void {
        this.renderAll([root]);
    }

    /**
     * Renders multiple tree structures.
     * Each tree is displayed as a separate root node.
     */
    renderAll(roots: TreeNode[]): void {
        this.container.innerHTML = '';
        
        if (roots.length === 0) {
            const message = document.createElement('div');
            message.textContent = 'No S-expressions found in file';
            message.className = 'empty-message';
            this.container.appendChild(message);
            return;
        }

        roots.forEach((root) => {
            const section = document.createElement('div');
            section.className = 'tree-section';

            const rootElement = this.createNodeElement(root, true);
            section.appendChild(rootElement);
            this.container.appendChild(section);
        });
    }

    /**
     * Creates a DOM element for a tree node.
     * Children are NOT rendered immediately - they are rendered on-demand when expanded.
     * @param node - The tree node to render
     * @param isRoot - Whether this is the root node
     */
    private createNodeElement(node: TreeNode, isRoot: boolean = false): HTMLElement {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';
        if (isRoot) {
            nodeDiv.classList.add('root-node');
        }

        // Store the TreeNode data in a WeakMap for later access
        this.nodeDataMap.set(nodeDiv, node);

        // Create the node content: all nodes use a box with the name inside
        const contentDiv = document.createElement('div');
        contentDiv.className = 'node-content';

        const box = document.createElement('div');
        box.className = 'node-box';
        if (isRoot) {
            box.classList.add('root-box');
        }

        if (node.name) {
            box.textContent = node.name;
        } else {
            box.textContent = isRoot ? 'Root' : '';
            if (!isRoot) {
                box.classList.add('empty-box');
            }
        }

        if (node.children && node.children.length > 0) {
            box.classList.add('has-children');
        }

        contentDiv.appendChild(box);

        // Create children container (empty initially, will be populated on expansion)
        const hasChildren = node.children && node.children.length > 0;
        if (hasChildren) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = isRoot ? 'root-children' : 'node-children';
            childrenContainer.style.display = 'none';

            childrenContainer.setAttribute('data-rendered', 'false');

            let isExpanded = false;
            box.addEventListener('click', () => {
                isExpanded = !isExpanded;
                childrenContainer.style.display = isExpanded ? 'block' : 'none';
                box.classList.toggle('expanded', isExpanded);

                if (isExpanded && childrenContainer.getAttribute('data-rendered') === 'false') {
                    this.renderChildren(node, childrenContainer);
                    childrenContainer.setAttribute('data-rendered', 'true');
                }
            });

            contentDiv.appendChild(childrenContainer);
        }

        nodeDiv.appendChild(contentDiv);
        return nodeDiv;
    }

    /**
     * Renders children of a node on-demand.
     * This is called when a node is expanded for the first time.
     */
    private renderChildren(node: TreeNode, container: HTMLElement): void {
        if (!node.children || node.children.length === 0) {
            return;
        }

        // Clear any placeholder
        container.innerHTML = '';

        // Render each child
        node.children.forEach(child => {
            const childElement = this.createNodeElement(child, false);
            container.appendChild(childElement);
        });
    }
}

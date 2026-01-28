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

        roots.forEach((root, index) => {
            const section = document.createElement('div');
            section.className = 'tree-section';
            
            // Add a header if there are multiple trees
            if (roots.length > 1) {
                const header = document.createElement('div');
                header.className = 'tree-section-header';
                header.textContent = `S-expression ${index + 1}${root.name ? `: ${root.name}` : ''}`;
                section.appendChild(header);
            }
            
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

        // Create the node content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'node-content';
        
        if (isRoot) {
            // Root node is always visible
            const label = document.createElement('div');
            label.className = 'node-label';
            label.textContent = node.name || 'Root';
            contentDiv.appendChild(label);
        } else {
            // Child nodes are collapsible boxes
            const box = document.createElement('div');
            box.className = 'node-box';
            
            if (node.name) {
                box.textContent = node.name;
            } else {
                // Add a placeholder for empty boxes
                box.classList.add('empty-box');
            }
            
            // Add indicator if node has children
            if (node.children && node.children.length > 0) {
                box.classList.add('has-children');
            }
            
            contentDiv.appendChild(box);
        }

        // Create children container (empty initially, will be populated on expansion)
        const hasChildren = node.children && node.children.length > 0;
        if (hasChildren) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = isRoot ? 'root-children' : 'node-children';
            childrenContainer.style.display = 'none'; // Hidden by default, even for root
            
            // Mark as not yet rendered
            childrenContainer.setAttribute('data-rendered', 'false');
            
            if (isRoot) {
                // Root node: add expandable indicator and click handler
                const expandButton = document.createElement('button');
                expandButton.className = 'expand-root-btn';
                expandButton.textContent = `Show children (${node.children.length})`;
                expandButton.addEventListener('click', () => {
                    const isExpanded = childrenContainer.style.display !== 'none';
                    if (!isExpanded) {
                        // Render children on first expansion
                        if (childrenContainer.getAttribute('data-rendered') === 'false') {
                            this.renderChildren(node, childrenContainer);
                            childrenContainer.setAttribute('data-rendered', 'true');
                        }
                        childrenContainer.style.display = 'block';
                        expandButton.textContent = `Hide children (${node.children.length})`;
                        expandButton.classList.add('expanded');
                    } else {
                        childrenContainer.style.display = 'none';
                        expandButton.textContent = `Show children (${node.children.length})`;
                        expandButton.classList.remove('expanded');
                    }
                });
                contentDiv.appendChild(expandButton);
            } else {
                // Non-root nodes: add click handler to the box
                const box = contentDiv.querySelector('.node-box') as HTMLElement;
                let isExpanded = false;
                
                box.addEventListener('click', () => {
                    isExpanded = !isExpanded;
                    childrenContainer.style.display = isExpanded ? 'block' : 'none';
                    box.classList.toggle('expanded', isExpanded);
                    
                    // Render children on first expansion
                    if (isExpanded && childrenContainer.getAttribute('data-rendered') === 'false') {
                        this.renderChildren(node, childrenContainer);
                        childrenContainer.setAttribute('data-rendered', 'true');
                    }
                });
            }
            
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

/**
 * Represents a node in the tree structure.
 * Nodes may have an optional name and zero or more children.
 */
export interface TreeNode {
    name?: string;
    children: TreeNode[];
}

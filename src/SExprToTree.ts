import { SExpr } from './SExprParser';
import { TreeNode } from './types';

/**
 * Converts an S-expression structure to a TreeNode structure.
 * This is a flexible converter that adapts to different S-EXPR formats.
 */
export class SExprToTree {
    /**
     * Converts an S-expression to a TreeNode.
     * 
     * Assumes the S-EXPR structure represents a tree where:
     * - Lists represent nodes with children
     * - The first element of a list may be a name/label
     * - Strings represent node names or content
     */
    static convert(expr: SExpr): TreeNode {
        if (typeof expr === 'string') {
            // A string is a leaf node with a name
            return {
                name: expr,
                children: []
            };
        }

        if (Array.isArray(expr)) {
            if (expr.length === 0) {
                // Empty list is an unnamed node with no children
                return {
                    children: []
                };
            }

            // Check if first element is a string (potential name)
            const first = expr[0];
            const rest = expr.slice(1);

            let name: string | undefined;
            let childrenStart = 0;

            if (typeof first === 'string') {
                // First element is a name
                name = first;
                childrenStart = 1;
            }

            // Convert remaining elements to children
            const children: TreeNode[] = [];
            for (let i = childrenStart; i < expr.length; i++) {
                children.push(this.convert(expr[i]));
            }

            return {
                name,
                children
            };
        }

        // Fallback: create an unnamed node
        return {
            children: []
        };
    }

    /**
     * Alternative conversion strategy for SMT-specific formats.
     * Override this if your S-EXPR format has specific conventions.
     */
    static convertSMT(expr: SExpr): TreeNode {
        // This can be customized based on your specific SMT format
        // For now, use the default conversion
        return this.convert(expr);
    }
}

import { SExpr } from './SExprParser';
import { TreeNode } from './types';

/**
 * Converts an S-expression structure to a TreeNode structure.
 * This is a flexible converter that adapts to different S-EXPR formats.
 */
export class SExprToTree {
    /**
     * Map from string to TreeNode. When converting a string (leaf) S-expression,
     * if the string is in this map, the mapped TreeNode is returned instead of a new leaf.
     */
    static leafMap = new Map<string, TreeNode>();

    /**
     * Handles let and let-proof expressions: converts each binding (name, value)
     * to a TreeNode, adds it to leafMap so later occurrences of the name resolve
     * to that node, then recursively converts and returns the body.
     */
    static convertLet(bindings: SExpr[], body: SExpr): TreeNode {
        for (const binding of bindings) {
            if (!Array.isArray(binding) || binding.length !== 2) {
                throw new Error(`Expected tuple for binding, got ${typeof binding}`);
            }
            const [name, value] = binding as [string, SExpr];
            if (typeof name !== 'string') {
                throw new Error(`Expected string for binding name, got ${typeof name}`);
            }
            const valueNode = {
                name: name,
                children: [ this.convert(value) ]
            };
            this.leafMap.set(name, valueNode);
        }
        return this.convert(body);
    }

    /**
     * Returns true if expr is a string that starts with ':' (a keyword).
     */
    static isKeyword(expr: SExpr): expr is string {
        return typeof expr === 'string' && expr[0] === ':';
    }

    /** Converts an S-expression to a string.
     * 
     * @param expr - The S-expression to convert.
     * @returns The string representation of the S-expression.
     */
    static makeString(expr: SExpr): string {
        if (typeof expr === 'string') {
            return expr;
        }
        return "(" + expr.map((e) => this.makeString(e)).join(' ') + ")";
    }


    /**
     * Converts an S-expression to an array of TreeNodes.
     * @param expr - The S-expression to convert.
     * @returns The array of TreeNodes.
     */
    static convertToArray(expr: SExpr): TreeNode[] {
        if (typeof expr === 'string') {
            return [ { name : expr, children: [] }];
        } else {
            return expr.map((x) => this.convert(x));
        }
    }

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
            // If the string is in the map, return the mapped TreeNode
            const mapped = this.leafMap.get(expr);
            if (mapped !== undefined) {
                return mapped;
            }
            // Otherwise create a leaf node with this name
            return {
                name: expr,
                children: []
            };
        }

        if (Array.isArray(expr)) {
            if (expr.length === 0) {
                // Empty list is an unnamed node with no children
                return {
                    name: "()", // empty list
                    children: []
                };
            }

            if (expr.length === 3 && (expr[0] === "let" || expr[0] === "let-proof")) {
                const [_, bindings, body] = expr;
                if (!Array.isArray(bindings)) {
                    throw new Error(`Expected list of bindings for let/let-proof, got ${typeof bindings}`);
                }
                return this.convertLet(bindings, body);
            }

            // Check if first element is a string (potential name)
            const first = expr[0];

            let name: string | undefined;

            if (typeof first === 'string') {
                // First element is a name
                name = first;
            } else {
                name = this.makeString(first);
            }

            // Convert remaining elements to children
            const children: TreeNode[] = [];
            for (let i = 1; i < expr.length; i++) {
                if (i < expr.length - 1 && this.isKeyword(expr[i])
                 && !this.isKeyword(expr[i + 1])) {
                    const keywordNode = {
                        name: expr[i] as string,
                        children: this.convertToArray(expr[i+1])
                    };
                    children.push(keywordNode);
                    i++;
                } else {
                    children.push(this.convert(expr[i]));
                }
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

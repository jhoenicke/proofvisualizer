import { SExprParser } from './SExprParser';
import { SExprToTree } from './SExprToTree';
import { TreeNode } from './types';

/**
 * Handles loading and parsing files from various sources.
 */
export class FileLoader {
    /**
     * Loads and parses a file from a File object (file upload).
     * Returns an array of TreeNode (one for each S-expression in the file).
     */
    static async loadFromFile(file: File): Promise<TreeNode[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const trees = this.parseContent(content);
                    resolve(trees);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Loads and parses a file from a URL.
     * Returns an array of TreeNode (one for each S-expression in the file).
     * @param url - The URL to load from
     * @param useProxy - Whether to use a CORS proxy
     */
    static async loadFromURL(url: string, useProxy: boolean = false): Promise<TreeNode[]> {
        const fetchUrl = useProxy ? this.getProxyUrl(url) : url;
        try {
            console.log(`[FileLoader] Attempting to fetch URL: ${fetchUrl}${useProxy ? ' (via CORS proxy)' : ''}`);
            const response = await fetch(fetchUrl);
            
            console.log(`[FileLoader] Response status: ${response.status} ${response.statusText}`);
            console.log(`[FileLoader] Response headers:`, Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unable to read error response');
                console.error(`[FileLoader] HTTP error response body:`, errorText);
                throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText.substring(0, 200)}`);
            }
            
            const content = await response.text();
            console.log(`[FileLoader] Successfully fetched ${content.length} characters`);
            console.log(`[FileLoader] Content preview (first 200 chars):`, content.substring(0, 200));
            
            return this.parseContent(content);
        } catch (error) {
            // Enhanced error reporting
            if (error instanceof TypeError && error.message.includes('fetch')) {
                // Likely a CORS or network error
                console.error('[FileLoader] Network/CORS error:', error);
                throw new Error(`Network error: ${error.message}. This might be a CORS issue. Check the browser console for details.`);
            }
            
            console.error('[FileLoader] Error loading from URL:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            
            if (errorStack) {
                console.error('[FileLoader] Error stack:', errorStack);
            }
            
            throw new Error(`Failed to load from URL: ${errorMessage}`);
        }
    }

    /**
     * Parses S-EXPR content and converts it to an array of TreeNode.
     * Handles files with multiple S-expressions.
     */
    private static parseContent(content: string): TreeNode[] {
        try {
            console.log('[FileLoader] Starting S-EXPR parsing...');
            const parser = new SExprParser(content);
            const sExprs = parser.parseAll();
            console.log(`[FileLoader] Parsed ${sExprs.length} S-expression(s)`);
            
            const trees = sExprs.map((sExpr, index) => {
                const tree = SExprToTree.convert(sExpr);
                console.log(`[FileLoader] Converted S-expression ${index + 1} to tree:`, tree);
                return tree;
            });
            
            console.log('[FileLoader] Tree conversion successful for all expressions');
            return trees;
        } catch (error) {
            console.error('[FileLoader] Parsing error:', error);
            if (error instanceof Error) {
                console.error('[FileLoader] Error message:', error.message);
                console.error('[FileLoader] Error stack:', error.stack);
            }
            throw error;
        }
    }

    /**
     * Gets a CORS proxy URL for the given URL.
     * Uses allorigins.win as a free, reliable CORS proxy.
     */
    private static getProxyUrl(url: string): string {
        // Using allorigins.win as a free CORS proxy
        // Alternative: you could use your own proxy server
        return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    }
}

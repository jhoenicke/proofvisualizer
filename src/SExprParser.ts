/**
 * Efficient S-EXPR parser for large files.
 * Parses S-expressions incrementally to handle very large files.
 */

export type SExpr = string | SExpr[];

/**
 * Parses an S-expression string into a tree structure.
 * Handles large files efficiently by parsing incrementally.
 */
export class SExprParser {
    private input: string;
    private pos: number;
    private length: number;

    constructor(input: string) {
        this.input = input;
        this.pos = 0;
        this.length = input.length;
    }

    /**
     * Parses the entire input as an S-expression.
     */
    parse(): SExpr {
        this.skipWhitespace();
        const result = this.parseExpr();
        this.skipWhitespace();
        if (this.pos < this.length) {
            throw new Error(`Unexpected characters at position ${this.pos}`);
        }
        return result;
    }

    /**
     * Parses all S-expressions from the input until the end.
     * Returns an array of S-expressions.
     */
    parseAll(): SExpr[] {
        const results: SExpr[] = [];
        this.skipWhitespace();
        
        while (this.pos < this.length) {
            try {
                const expr = this.parseExpr();
                results.push(expr);
                this.skipWhitespace();
            } catch (error) {
                // If we hit an error, check if we're at the end (which is OK)
                this.skipWhitespace();
                if (this.pos >= this.length) {
                    break;
                }
                // Otherwise, rethrow the error
                throw error;
            }
        }
        
        return results;
    }

    /**
     * Parses a single S-expression (atom or list).
     */
    private parseExpr(): SExpr {
        this.skipWhitespace();
        
        if (this.pos >= this.length) {
            throw new Error('Unexpected end of input');
        }

        const char = this.input[this.pos];

        if (char === '(') {
            return this.parseList();
        } else if (char === ')') {
            throw new Error(`Unexpected ')' at position ${this.pos}`);
        } else {
            return this.parseAtom();
        }
    }

    /**
     * Parses a list: (expr1 expr2 ...)
     */
    private parseList(): SExpr[] {
        if (this.input[this.pos] !== '(') {
            throw new Error(`Expected '(' at position ${this.pos}`);
        }
        this.pos++; // consume '('

        const list: SExpr[] = [];
        this.skipWhitespace();

        while (this.pos < this.length && this.input[this.pos] !== ')') {
            list.push(this.parseExpr());
            this.skipWhitespace();
        }

        if (this.pos >= this.length) {
            throw new Error('Unclosed list: missing closing parenthesis');
        }

        this.pos++; // consume ')'
        return list;
    }

    /**
     * Parses an atom (string, number, symbol, etc.).
     * Handles quoted strings and unquoted symbols.
     */
    private parseAtom(): string {
        this.skipWhitespace();
        
        if (this.pos >= this.length) {
            throw new Error('Unexpected end of input while parsing atom');
        }

        const char = this.input[this.pos];

        // Handle quoted strings
        if (char === '"') {
            return this.parseString();
        }

        // Handle quoted atoms
        if (char === '|') {
            return this.parseQuotedAtom();
        }

        // Handle unquoted atoms (symbols, numbers, etc.)
        const start = this.pos;
        while (this.pos < this.length) {
            const c = this.input[this.pos];
            if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || 
                c === '(' || c === ')') {
                break;
            }
            this.pos++;
        }

        return this.input.substring(start, this.pos);
    }

    /**
     * Parses a quoted string: "text"
     */
    private parseString(): string {
        if (this.input[this.pos] !== '"') {
            throw new Error(`Expected '"' at position ${this.pos}`);
        }
        this.pos++; // consume opening quote

        let result = '';
        let escaped = false;

        while (this.pos < this.length) {
            const char = this.input[this.pos];

            if (escaped) {
                if (char === 'n') {
                    result += '\n';
                } else if (char === 't') {
                    result += '\t';
                } else if (char === 'r') {
                    result += '\r';
                } else if (char === '\\') {
                    result += '\\';
                } else if (char === '"') {
                    result += '"';
                } else {
                    result += char;
                }
                escaped = false;
            } else if (char === '\\') {
                escaped = true;
            } else if (char === '"') {
                this.pos++; // consume closing quote
                return result;
            } else {
                result += char;
            }

            this.pos++;
        }

        throw new Error('Unclosed string literal');
    }

    /**
     * Parses a quoted atom: |text|
     * Collects all characters until the next occurrence of '|'.
     */
    private parseQuotedAtom(): string {
        if (this.input[this.pos] !== '|') {
            throw new Error(`Expected '|' at position ${this.pos}`);
        }
        this.pos++; // consume opening '|'

        const start = this.pos;
        while (this.pos < this.length && this.input[this.pos] !== '|') {
            this.pos++;
        }

        if (this.pos >= this.length) {
            throw new Error('Unclosed quoted atom: missing closing |');
        }

        const result = this.input.substring(start, this.pos);
        this.pos++; // consume closing '|'
        return result;
    }

    /**
     * Skips whitespace characters.
     */
    private skipWhitespace(): void {
        while (this.pos < this.length) {
            const char = this.input[this.pos];
            if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
                this.pos++;
            } else if (char === ';') {
                // Skip comments (from ; to end of line)
                while (this.pos < this.length && this.input[this.pos] !== '\n') {
                    this.pos++;
                }
            } else {
                break;
            }
        }
    }
}

import { FileLoader } from './FileLoader';
import { TreeNode } from './types';

/**
 * UI component for file upload and URL input.
 */
export class FileInputUI {
    private container: HTMLElement;
    private onTreeLoaded: (trees: TreeNode[]) => void;
    private onError: (error: Error) => void;

    constructor(
        container: HTMLElement,
        onTreeLoaded: (trees: TreeNode[]) => void,
        onError: (error: Error) => void
    ) {
        this.container = container;
        this.onTreeLoaded = onTreeLoaded;
        this.onError = onError;
        this.render();
    }

    private render(): void {
        this.container.innerHTML = `
            <div class="file-input-container">
                <div class="input-section">
                    <h2>Load S-EXPR File</h2>
                    <div class="input-group">
                        <label for="file-input">Upload File:</label>
                        <input type="file" id="file-input" />
                        <button id="upload-btn" class="btn btn-primary">Load File</button>
                    </div>
                    <div class="input-group">
                        <label for="url-input">Or Load from URL:</label>
                        <input type="url" id="url-input" placeholder="https://example.com/file.sexpr" />
                        <div class="checkbox-group">
                            <input type="checkbox" id="use-cors-proxy" />
                            <label for="use-cors-proxy">Use CORS proxy (if blocked by CORS)</label>
                        </div>
                        <button id="url-btn" class="btn btn-primary">Load URL</button>
                    </div>
                    <div id="status-message" class="status-message"></div>
                    <div id="error-details" class="error-details" style="display: none;">
                        <details>
                            <summary>Error Details (click to expand)</summary>
                            <pre id="error-details-content"></pre>
                        </details>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement;
        const urlInput = document.getElementById('url-input') as HTMLInputElement;
        const urlBtn = document.getElementById('url-btn') as HTMLButtonElement;

        uploadBtn.addEventListener('click', () => {
            const file = fileInput.files?.[0];
            if (!file) {
                this.showError('Please select a file');
                return;
            }
            this.loadFile(file);
        });

        urlBtn.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (!url) {
                this.showError('Please enter a URL');
                return;
            }
            this.loadURL(url);
        });

        // Allow Enter key on URL input
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                urlBtn.click();
            }
        });
    }

    private async loadFile(file: File): Promise<void> {
        this.showStatus(`Loading file: ${file.name}...`);
        this.hideErrorDetails();
        console.log('[FileInputUI] Starting file load:', file.name, `(${file.size} bytes)`);
        
        try {
            const trees = await FileLoader.loadFromFile(file);
            console.log(`[FileInputUI] Successfully loaded ${trees.length} tree(s):`, trees);
            this.showStatus(`Successfully loaded ${file.name} (${trees.length} S-expression${trees.length !== 1 ? 's' : ''})`);
            this.hideErrorDetails();
            this.onTreeLoaded(trees);
        } catch (error) {
            console.error('[FileInputUI] Error loading file:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.showError(`Failed to load file: ${message}`);
            this.showErrorDetails(error);
            this.onError(error instanceof Error ? error : new Error(message));
        }
    }

    private async loadURL(url: string): Promise<void> {
        this.showStatus(`Loading from URL: ${url}...`);
        this.hideErrorDetails();
        console.log('[FileInputUI] Starting URL load:', url);
        
        const useProxy = (document.getElementById('use-cors-proxy') as HTMLInputElement)?.checked || false;
        
        try {
            const trees = await FileLoader.loadFromURL(url, useProxy);
            console.log(`[FileInputUI] Successfully loaded ${trees.length} tree(s):`, trees);
            this.showStatus(`Successfully loaded from URL (${trees.length} S-expression${trees.length !== 1 ? 's' : ''})`);
            this.hideErrorDetails();
            this.onTreeLoaded(trees);
        } catch (error) {
            console.error('[FileInputUI] Error loading URL:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            
            // Suggest using proxy if CORS error
            if (message.includes('CORS') || message.includes('Access-Control')) {
                const errorMsg = `${message}\n\nTip: Try enabling "Use CORS proxy" checkbox and try again.`;
                this.showError(`Failed to load from URL: ${errorMsg}`);
            } else {
                this.showError(`Failed to load from URL: ${message}`);
            }
            
            this.showErrorDetails(error);
            this.onError(error instanceof Error ? error : new Error(message));
        }
    }

    private showStatus(message: string): void {
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = 'status-message status-info';
        }
    }

    private showError(message: string): void {
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = 'status-message status-error';
        }
    }

    private showErrorDetails(error: unknown): void {
        const detailsEl = document.getElementById('error-details');
        const contentEl = document.getElementById('error-details-content');
        
        if (detailsEl && contentEl) {
            let details = '';
            
            if (error instanceof Error) {
                details += `Error: ${error.name}\n`;
                details += `Message: ${error.message}\n`;
                if (error.stack) {
                    details += `\nStack trace:\n${error.stack}`;
                }
            } else {
                details += `Error: ${String(error)}`;
            }
            
            contentEl.textContent = details;
            detailsEl.style.display = 'block';
        }
    }

    private hideErrorDetails(): void {
        const detailsEl = document.getElementById('error-details');
        if (detailsEl) {
            detailsEl.style.display = 'none';
        }
    }
}

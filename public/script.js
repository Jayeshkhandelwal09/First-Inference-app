class AIWriter {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
    }

    initializeElements() {
        this.elements = {
            contentType: document.getElementById('contentType'),
            prompt: document.getElementById('prompt'),
            model: document.getElementById('model'),
            temperature: document.getElementById('temperature'),
            tempValue: document.getElementById('tempValue'),
            generateBtn: document.getElementById('generateBtn'),
            output: document.getElementById('output'),
            outputInfo: document.getElementById('outputInfo'),
            copyBtn: document.getElementById('copyBtn'),
            clearBtn: document.getElementById('clearBtn'),
            history: document.getElementById('history'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            toast: document.getElementById('toast')
        };
    }

    bindEvents() {
        // Temperature slider
        this.elements.temperature.addEventListener('input', (e) => {
            this.elements.tempValue.textContent = e.target.value;
        });

        // Generate button
        this.elements.generateBtn.addEventListener('click', () => {
            this.generateContent();
        });

        // Copy button
        this.elements.copyBtn.addEventListener('click', () => {
            this.copyToClipboard();
        });

        // Clear button
        this.elements.clearBtn.addEventListener('click', () => {
            this.clearOutput();
        });

        // Enter key in prompt
        this.elements.prompt.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.generateContent();
            }
        });
    }

    async generateContent() {
        const prompt = this.elements.prompt.value.trim();
        if (!prompt) {
            this.showToast('Please enter a topic or prompt', 'error');
            return;
        }

        const requestData = {
            prompt: prompt,
            type: this.elements.contentType.value,
            model: this.elements.model.value,
            temperature: parseFloat(this.elements.temperature.value)
        };

        this.setLoading(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate content');
            }

            this.displayOutput(data);
            this.showToast('Content generated successfully!');
            this.loadHistory(); // Refresh history

        } catch (error) {
            console.error('Generation error:', error);
            this.showToast(error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    displayOutput(data) {
        const outputElement = this.elements.output;
        const outputInfoElement = this.elements.outputInfo;

        // Clear placeholder
        outputElement.innerHTML = '';
        outputElement.classList.add('has-content');

        // Display the generated content
        outputElement.textContent = data.output;

        // Show output info
        const wordCount = data.output.split(/\s+/).length;
        const charCount = data.output.length;
        outputInfoElement.innerHTML = `
            <strong>Model:</strong> ${data.model} | 
            <strong>Temperature:</strong> ${data.temperature} | 
            <strong>Type:</strong> ${this.getTypeLabel(data.type)} | 
            <strong>Words:</strong> ${wordCount} | 
            <strong>Characters:</strong> ${charCount}
        `;
        outputInfoElement.style.display = 'block';
    }

    getTypeLabel(type) {
        const labels = {
            'blog-intro': 'Blog Introduction',
            'tweet': 'Tweet',
            'story': 'Short Story'
        };
        return labels[type] || type;
    }

    async copyToClipboard() {
        const outputText = this.elements.output.textContent;
        if (!outputText || outputText.includes('Your generated content will appear here')) {
            this.showToast('No content to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(outputText);
            this.showToast('Content copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = outputText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Content copied to clipboard!');
        }
    }

    clearOutput() {
        const outputElement = this.elements.output;
        const outputInfoElement = this.elements.outputInfo;

        outputElement.classList.remove('has-content');
        outputElement.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-lightbulb"></i>
                <p>Your generated content will appear here...</p>
            </div>
        `;
        outputInfoElement.style.display = 'none';
    }

    async loadHistory() {
        try {
            const response = await fetch('/api/outputs');
            const data = await response.json();

            if (data.outputs && data.outputs.length > 0) {
                this.displayHistory(data.outputs);
            } else {
                this.displayEmptyHistory();
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            this.displayEmptyHistory();
        }
    }

    displayHistory(outputs) {
        const historyElement = this.elements.history;
        historyElement.innerHTML = '';

        outputs.forEach(output => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const date = new Date(output.timestamp).toLocaleString();
            const truncatedOutput = output.output.length > 150 
                ? output.output.substring(0, 150) + '...' 
                : output.output;

            historyItem.innerHTML = `
                <div class="history-header">
                    <span class="history-type">${this.getTypeLabel(output.type)}</span>
                    <span>${date}</span>
                </div>
                <div class="history-prompt"><strong>Prompt:</strong> ${output.prompt}</div>
                <div class="history-output">${truncatedOutput}</div>
            `;

            // Click to copy functionality
            historyItem.addEventListener('click', () => {
                navigator.clipboard.writeText(output.output).then(() => {
                    this.showToast('Historical content copied!');
                }).catch(() => {
                    this.showToast('Failed to copy content', 'error');
                });
            });

            historyElement.appendChild(historyItem);
        });
    }

    displayEmptyHistory() {
        this.elements.history.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-history"></i>
                <p>Your generation history will appear here...</p>
            </div>
        `;
    }

    setLoading(isLoading) {
        const loadingOverlay = this.elements.loadingOverlay;
        const generateBtn = this.elements.generateBtn;

        if (isLoading) {
            loadingOverlay.style.display = 'flex';
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        } else {
            loadingOverlay.style.display = 'none';
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Content';
        }
    }

    showToast(message, type = 'success') {
        const toast = this.elements.toast;
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIWriter();
});

// Add some helpful keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const generateBtn = document.getElementById('generateBtn');
        if (!generateBtn.disabled) {
            generateBtn.click();
        }
    }
    
    // Escape to clear output
    if (e.key === 'Escape') {
        const clearBtn = document.getElementById('clearBtn');
        clearBtn.click();
    }
}); 
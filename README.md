# AI Writer App 🚀

A beautiful, modern AI Writer application that generates blog introductions, tweets, and short stories using your local LLM models. Built with Node.js and designed to work with Ollama for local AI inference.

## App Type Selected ✍️
**AI Writer** - Generate engaging content including:
- 📝 Blog Introductions
- 🐦 Tweets  
- 📚 Short Stories

## Features
- 🎨 Modern, responsive UI 
- 🤖 Support for multiple local LLM models (Phi, TinyLlama)
- 🌡️ Adjustable temperature settings for creativity control
- 📊 Real-time output statistics (word count, character count)
- 📋 One-click copy to clipboard
- 📚 Generation history with local logging
- ⚡ Loading animations and toast notifications
- ⌨️ Keyboard shortcuts (Ctrl+Enter to generate, Escape to clear)

## Models Used
- **Phi** (Microsoft's efficient language model)
- **TinyLlama** (Compact but capable model)

## Prerequisites

### 1. Install Ollama
First, install Ollama on your system:

**macOS:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai/download)

### 2. Pull the Required Models
Since you mentioned you already have phi and tinyllama installed, verify they're available:

```bash
ollama list
```

If you need to install them:
```bash
ollama pull phi
ollama pull tinyllama
```

### 3. Start Ollama Service
```bash
ollama serve
```
Keep this running in a separate terminal. Ollama will run on `http://localhost:11434`

## Setup Instructions

### 1. Clone and Navigate
```bash
cd /path/to/your/First-Inference-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

### 4. Open in Browser
Navigate to: `http://localhost:3000`

## How to Use

1. **Select Content Type**: Choose between Blog Introduction, Tweet, or Short Story
2. **Enter Your Prompt**: Describe what you want to write about
3. **Choose Model**: Select between Phi or TinyLlama
4. **Adjust Temperature**: Control creativity (0.0 = focused, 1.0 = creative)
5. **Generate**: Click the generate button or press Ctrl+Enter
6. **Copy & Use**: Copy the generated content to your clipboard

## Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: Generate content
- `Escape`: Clear output
- `Ctrl + Enter` in prompt field: Generate content

## Output Logging
All generated content is automatically logged to `outputs.log` in the project root. Each entry includes:
- Timestamp
- Content type
- Model used
- Temperature setting
- Original prompt
- Generated output
- Content statistics

## API Endpoints

### Generate Content
```
POST /api/generate
Content-Type: application/json

{
  "prompt": "Your topic here",
  "type": "blog-intro|tweet|story",
  "model": "phi|tinyllama",
  "temperature": 0.7
}
```

### Get Recent Outputs
```
GET /api/outputs
```

### Get Available Models
```
GET /api/models
```

## Troubleshooting

### "Cannot connect to Ollama" Error
1. Make sure Ollama is running: `ollama serve`
2. Verify Ollama is accessible: `curl http://localhost:11434/api/tags`
3. Check if your models are installed: `ollama list`

### Models Not Working
1. Pull the models: `ollama pull phi` and `ollama pull tinyllama`
2. Test manually: `ollama run phi "Hello world"`

### Port Already in Use
Change the port in `server.js` or set environment variable:
```bash
PORT=3001 npm start
```

## Project Structure
```
First-Inference-app/
├── server.js              # Express server and API endpoints
├── package.json           # Dependencies and scripts
├── outputs.log           # Generated content log (created automatically)
├── public/
│   ├── index.html        # Main HTML interface
│   ├── style.css         # Modern CSS styling
│   └── script.js         # Frontend JavaScript logic
└── README.md             # This file
```

## Dependencies
- **express**: Web server framework
- **axios**: HTTP client for Ollama API calls
- **cors**: Cross-origin resource sharing
- **fs**: File system operations for logging

## Development
To modify the available models, edit the `AVAILABLE_MODELS` array in `server.js`:
```javascript
const AVAILABLE_MODELS = ['phi', 'tinyllama', 'your-model-here'];
```

## License
MIT License - Feel free to modify and distribute!

---

**Enjoy creating amazing content with your local AI! 🎉**
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        // Allow file:// protocol for local development
        null
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser support
};

// Middleware
app.use(cors(corsOptions));

// Additional CORS headers for extra compatibility
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    
    next();
});

app.use(express.json());
app.use(express.static('public'));

// Logging function
function logOutput(prompt, output, model, temperature, type) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        type,
        model,
        temperature,
        prompt,
        output,
        length: output.length
    };
    
    const logFile = path.join(__dirname, 'outputs.log');
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

// Available models (you can modify this based on your installed models)
const AVAILABLE_MODELS = ['phi', 'tinyllama'];

// API endpoint to get available models
app.get('/api/models', (req, res) => {
    res.json({ models: AVAILABLE_MODELS });
});

// Main generation endpoint
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, type, model = 'phi', temperature = 0.7 } = req.body;
        
        if (!prompt || !type) {
            return res.status(400).json({ error: 'Prompt and type are required' });
        }

        // Create type-specific prompts
        let systemPrompt = '';
        let fullPrompt = '';

        switch (type) {
            case 'blog-intro':
                systemPrompt = 'You are a professional blog writer. Write engaging, informative blog introductions that hook readers and clearly introduce the topic.';
                fullPrompt = `Write a compelling blog introduction about: ${prompt}\n\nMake it engaging, informative, and around 2-3 paragraphs.`;
                break;
            case 'tweet':
                systemPrompt = 'You are a social media expert. Write engaging, concise tweets that are informative and shareable.';
                fullPrompt = `Write a tweet about: ${prompt}\n\nKeep it under 280 characters, make it engaging and include relevant hashtags.`;
                break;
            case 'story':
                systemPrompt = 'You are a creative storyteller. Write engaging short stories with vivid descriptions and compelling narratives.';
                fullPrompt = `Write a short story about: ${prompt}\n\nMake it creative, engaging, and around 3-4 paragraphs.`;
                break;
            default:
                return res.status(400).json({ error: 'Invalid type. Use: blog-intro, tweet, or story' });
        }

        // Call Ollama API
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: model,
            prompt: `${systemPrompt}\n\n${fullPrompt}`,
            stream: false,
            options: {
                temperature: temperature,
                top_p: 0.9,
                top_k: 40
            }
        });

        const generatedText = response.data.response;
        
        // Log the output
        logOutput(prompt, generatedText, model, temperature, type);
        
        res.json({
            success: true,
            output: generatedText,
            model: model,
            temperature: temperature,
            type: type
        });

    } catch (error) {
        console.error('Generation error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ 
                error: 'Cannot connect to Ollama. Make sure Ollama is running on localhost:11434' 
            });
        } else {
            res.status(500).json({ 
                error: 'Failed to generate content: ' + error.message 
            });
        }
    }
});

// Get recent outputs
app.get('/api/outputs', (req, res) => {
    try {
        const logFile = path.join(__dirname, 'outputs.log');
        if (!fs.existsSync(logFile)) {
            return res.json({ outputs: [] });
        }
        
        const logs = fs.readFileSync(logFile, 'utf8')
            .split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line))
            .slice(-10) // Get last 10 entries
            .reverse(); // Most recent first
            
        res.json({ outputs: logs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read outputs' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 AI Writer App running on http://localhost:${PORT}`);
    console.log(`📝 Make sure Ollama is running with: ollama serve`);
    console.log(`🤖 Available models: ${AVAILABLE_MODELS.join(', ')}`);
}); 
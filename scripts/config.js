// API Configuration
// For local development: Create a .env file with your API keys
// For GitHub Pages: You'll need to use a different approach (see README)

const CONFIG = {
    // These will be empty for GitHub Pages - see README for setup instructions
    GEMINI_API_KEY: '',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
    GEMINI_MODEL: 'gemini-2.5-flash',

    // Unsplash API for real location photos
    UNSPLASH_ACCESS_KEY: ''
};

// For local development with a simple server that injects env vars,
// you can override these values. For production, consider using
// a backend proxy to keep your API keys secure.

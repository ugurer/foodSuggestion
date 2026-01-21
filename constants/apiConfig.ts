/**
 * API Configuration
 * 
 * Backend proxy URL for secure API access.
 * API keys are stored on the Cloudflare Worker, not in the app.
 */

// TODO: Replace with your actual Cloudflare Worker URL after deployment
// Format: https://food-suggestion-api.<your-subdomain>.workers.dev
export const API_CONFIG = {
    // Backend proxy URL
    baseUrl: 'https://food-suggestion-api.ugurer.workers.dev',

    // Rate limits (per user per day) - enforced client-side for UX
    limits: {
        aiRecommendations: 20,
        placesSearches: 20,
    },

    // Endpoints
    endpoints: {
        recommend: '/api/recommend',
        placesSearch: '/api/places/search',
        placesNearby: '/api/places/nearby',
        health: '/health',
    },
};

// Rate limiting storage keys
export const RATE_LIMIT_KEYS = {
    AI_COUNT: '@rate_limit_ai_count',
    AI_DATE: '@rate_limit_ai_date',
    PLACES_COUNT: '@rate_limit_places_count',
    PLACES_DATE: '@rate_limit_places_date',
};

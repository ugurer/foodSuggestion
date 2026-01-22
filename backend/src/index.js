/**
 * Cloudflare Worker - Food Suggestion API Proxy
 * 
 * This worker securely proxies requests to Gemini AI and Google Places APIs,
 * keeping API keys safe on the server side.
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // Route handling
            if (path === '/api/foods' && request.method === 'GET') {
                return await handleGetFoods(request, env);
            }

            if (path === '/api/recommend' && request.method === 'POST') {
                return await handleRecommend(request, env);
            }

            if (path === '/api/places/search' && request.method === 'POST') {
                return await handlePlacesSearch(request, env);
            }

            if (path === '/api/places/nearby' && request.method === 'POST') {
                return await handlePlacesNearby(request, env);
            }

            if (path === '/api/chat' && request.method === 'POST') {
                return await handleChat(request, env);
            }

            if (path === '/health') {
                return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
            }

            return jsonResponse({ error: 'Not found' }, 404);
        } catch (error) {
            console.error('Worker error:', error);
            return jsonResponse({ error: 'Internal server error' }, 500);
        }
    },
};

/**
 * Handle AI recommendation requests
 */
async function handleRecommend(request, env) {
    const body = await request.json();
    const { mood, city, preferences, language = 'en' } = body;

    if (!mood) {
        return jsonResponse({ error: 'Mood is required' }, 400);
    }

    const prompt = buildPrompt(mood, city, preferences, language);

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        }
    );

    const data = await response.json();

    if (data.error) {
        return jsonResponse({ error: data.error.message }, 500);
    }

    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            return jsonResponse(parsed);
        } catch {
            return jsonResponse({ error: 'Failed to parse AI response' }, 500);
        }
    }

    return jsonResponse({ error: 'Invalid AI response' }, 500);
}

/**
 * Handle Places text search
 */
async function handlePlacesSearch(request, env) {
    const body = await request.json();
    const { query, latitude, longitude, radius = 2000, language = 'en' } = body;

    if (!query || !latitude || !longitude) {
        return jsonResponse({ error: 'query, latitude, and longitude are required' }, 400);
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': env.GEMINI_API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.photos,places.types,places.location,places.reviews',
        },
        body: JSON.stringify({
            textQuery: query,
            locationBias: {
                circle: {
                    center: { latitude, longitude },
                    radius,
                },
            },
            languageCode: language,
            maxResultCount: 5,
        }),
    });

    const data = await response.json();

    if (data.error) {
        return jsonResponse({ error: data.error.message }, 500);
    }

    // Transform and add photo URLs
    const places = (data.places || []).map(place => ({
        ...place,
        photoUrl: place.photos?.[0]?.name
            ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&key=${env.GEMINI_API_KEY}`
            : null,
    }));

    return jsonResponse({ places });
}

/**
 * Handle Places nearby search
 */
async function handlePlacesNearby(request, env) {
    const body = await request.json();
    const { latitude, longitude, radius = 1500, language = 'en' } = body;

    if (!latitude || !longitude) {
        return jsonResponse({ error: 'latitude and longitude are required' }, 400);
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': env.GEMINI_API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.photos,places.types,places.location,places.reviews',
        },
        body: JSON.stringify({
            includedTypes: ['restaurant'],
            locationRestriction: {
                circle: {
                    center: { latitude, longitude },
                    radius,
                },
            },
            languageCode: language,
            maxResultCount: 8,
        }),
    });

    const data = await response.json();

    if (data.error) {
        return jsonResponse({ error: data.error.message }, 500);
    }

    const places = (data.places || []).map(place => ({
        ...place,
        photoUrl: place.photos?.[0]?.name
            ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=400&key=${env.GEMINI_API_KEY}`
            : null,
    }));

    return jsonResponse({ places });
}

/**
 * Build AI prompt
 */
function buildPrompt(mood, city, preferences, language) {
    if (language === 'tr') {
        const dietPrefs = [];
        if (preferences?.isVegan) dietPrefs.push('vegan');
        else if (preferences?.isVegetarian) dietPrefs.push('vejetaryen');
        if (preferences?.isGlutenFree) dietPrefs.push('gluten-free');

        const dietText = dietPrefs.length > 0
            ? `Kullanıcı ${dietPrefs.join(' ve ')} beslenmeyi tercih ediyor.`
            : '';

        return `Sen bir yemek öneri uzmanısın. Türk mutfağı ve dünya mutfağı hakkında derin bilgin var.

Kullanıcı bilgileri:
- Ruh hali: ${mood.label} (${mood.description})
- Konum: ${city || 'Belirtilmedi'}
${dietText}

Görevin:
1. Bu ruh haline uygun 3 yemek öner (Türk mutfağından en az 1 tane)
2. Neden bu yemekleri önerdiğini kısaca açıkla
3. Yemekle ilgili 2 pratik ipucu ver

JSON formatında yanıt ver:
{
  "recommendation": "Kısa genel öneri mesajı",
  "explanation": "Neden bu yemekler? (2-3 cümle)",
  "foods": ["yemek1", "yemek2", "yemek3"],
  "tips": ["ipucu1", "ipucu2"]
}

Sadece JSON döndür, başka bir şey yazma.`;
    } else {
        // English Prompt
        const dietPrefs = [];
        if (preferences?.isVegan) dietPrefs.push('vegan');
        else if (preferences?.isVegetarian) dietPrefs.push('vegetarian');
        if (preferences?.isGlutenFree) dietPrefs.push('gluten-free');

        const dietText = dietPrefs.length > 0
            ? `User prefers ${dietPrefs.join(' and ')} diet.`
            : '';

        return `You are a food suggestion expert. You have deep knowledge of Turkish and world cuisine.

User Information:
- Mood: ${mood.label}
- Location: ${city || 'Not specified'}
${dietText}

Your Task:
1. Suggest 3 dishes suitable for this mood (At least 1 from Turkish cuisine)
2. Briefly explain why you suggested these dishes
3. Give 2 practical tips about the food

Respond in JSON format:
{
  "recommendation": "Short general recommendation message",
  "explanation": "Why these foods? (2-3 sentences)",
  "foods": ["food1", "food2", "food3"],
  "tips": ["tip1", "tip2"]
}

Return ONLY JSON, nothing else.`;
    }
}

/**
 * Get all foods from D1 database
 */
async function handleGetFoods(request, env) {
    try {
        const url = new URL(request.url);
        const region = url.searchParams.get('region');

        let query = 'SELECT * FROM foods';
        let params = [];

        if (region) {
            // Check if the region exists in the regions JSON array
            // D1 supports JSON functions like json_each
            query = "SELECT * FROM foods WHERE EXISTS (SELECT 1 FROM json_each(regions) WHERE value = ?)";
            params = [region];
        }

        const { results } = await env.DB.prepare(query).bind(...params).all();

        // Transform JSON strings back to arrays
        const foods = results.map(food => ({
            ...food,
            moods: JSON.parse(food.moods || '[]'),
            regions: JSON.parse(food.regions || '[]'),
            isVegetarian: !!food.is_vegetarian,
            isVegan: !!food.is_vegan,
            isGlutenFree: !!food.is_gluten_free,
        }));

        return jsonResponse({ foods });
    } catch (error) {
        console.error('D1 Error:', error);
        return jsonResponse({ error: 'Database error' }, 500);
    }
}

/**
 * Helper to create JSON response with CORS headers
 */
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...CORS_HEADERS,
        },
    });
}

/**
 * Handle AI chat requests
 */
async function handleChat(request, env) {
    const body = await request.json();
    const { query, language = 'en' } = body;

    if (!query) {
        return jsonResponse({ error: 'Query is required' }, 400);
    }

    const prompt = buildChatPrompt(query, language);

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${env.GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        }
    );

    const data = await response.json();

    if (data.error) {
        return jsonResponse({ error: data.error.message }, 500);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return jsonResponse({ response: text });
}

/**
 * Build Chat prompt
 */
function buildChatPrompt(query, language) {
    if (language === 'tr') {
        return `Sen bir yemek ve mutfak uzmanısın. Kullanıcıya bir arkadaş gibi yardımcı ol.
        
Kullanıcının sorusu: "${query}"

Yanıt kuralları:
1. Cana yakın ve iştah açıcı bir dille yanıt ver.
2. Genelde kısa ve öz yanıtlar ver.
3. Yanıtında ilgili yemek emojileri kullan.
4. Sadece yemek ve mutfakla ilgili soruları yanıtla. Diğer konularda nazikçe reddet.

Yanıtını doğrudan metin olarak ver.`;
    } else {
        return `You are a food and culinary expert. Help the user like a friendly companion.
        
User's query: "${query}"

Response rules:
1. Respond in a friendly and appetizing tone.
2. Keep it concise.
3. Use relevant food emojis.
4. Only answer food and culinary related questions. Politely decline other topics.

Provide your response as direct text.`;
    }
}

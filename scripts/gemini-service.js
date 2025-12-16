/**
 * Gemini AI Service for TripCraft
 * Handles all AI-powered features
 */

const GeminiService = {
    /**
     * Call Gemini API
     */
    async callGemini(prompt, systemInstruction = '') {
        const url = `${CONFIG.GEMINI_API_URL}/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

        // Combine system instruction with prompt since v1 API doesn't support systemInstruction field
        const fullPrompt = systemInstruction
            ? `${systemInstruction}\n\n${prompt}`
            : prompt;

        const requestBody = {
            contents: [{
                parts: [{ text: fullPrompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Gemini API Error:', error);
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini Service Error:', error);
            throw error;
        }
    },

    /**
     * Generate a travel itinerary based on user preferences
     */
    async generateItinerary(preferences) {
        console.log('📋 Preferences received:', preferences);

        const travelMonth = preferences.startDate ? new Date(preferences.startDate).toLocaleDateString('en-US', { month: 'long' }) : 'upcoming months';

        const systemInstruction = `You are TripCraft AI. Generate BRIEF travel itineraries as valid JSON.
RULES:
- Generate EXACTLY ${preferences.days} days
- Only 2 activities per day
- Include travelTime (e.g. "15 min drive") between activities
- Generate 3 hotel options with different price points
- Generate 3 flight options with different airlines
- Include visa info based on nationality
- All descriptions under 15 words
- Keep total response under 6000 characters`;

        const prompt = `Create ${preferences.days}-day trip to ${preferences.destination}.
Traveler nationality: ${preferences.nationality || 'US'}.
Travel dates: ${travelMonth}.
Budget: $${preferences.budget}. Styles: ${preferences.styles?.join(', ') || 'general'}.

Return JSON with 3 hotels, 3 flights. IMPORTANT: Include accurate lat/lng coordinates for each activity and hotel.
{"title":"Trip","summary":"Brief","days":[{"name":"Day 1","description":"Brief","activities":[{"id":"1","time":"9AM","title":"Name","description":"10 words","duration":"2h","cost":10,"type":"sightseeing","location":"place","coordinates":{"lat":35.0116,"lng":135.7681},"travelTime":""},{"id":"2","time":"2PM","title":"Name2","description":"10 words","duration":"2h","cost":15,"type":"food","location":"place","coordinates":{"lat":35.0094,"lng":135.7688},"travelTime":"20 min walk"}]}],"estimatedCosts":{"flights":800,"hotels":450,"activities":150,"meals":200,"transport":100,"total":1700},"hotels":[{"id":"h1","name":"Budget Hotel","type":"Budget","location":"Area","pricePerNight":80,"rating":3.8,"features":["Clean","Central"],"coordinates":{"lat":35.0116,"lng":135.7681}},{"id":"h2","name":"Mid Hotel","type":"Boutique","location":"Area","pricePerNight":150,"rating":4.3,"features":["Stylish","Breakfast"],"coordinates":{"lat":35.0120,"lng":135.7690}},{"id":"h3","name":"Luxury Hotel","type":"Luxury","location":"Area","pricePerNight":280,"rating":4.8,"features":["Spa","Views"],"coordinates":{"lat":35.0100,"lng":135.7700}}],"flights":[{"id":"f1","airline":"Budget Air","price":450,"duration":"14h","stops":"1 stop","departure":"06:00","arrival":"20:00"},{"id":"f2","airline":"Main Carrier","price":750,"duration":"11h","stops":"Direct","departure":"10:00","arrival":"21:00"},{"id":"f3","airline":"Premium Air","price":1200,"duration":"10h","stops":"Direct","departure":"08:00","arrival":"18:00"}],"weatherInfo":{"temp":"15-22C","note":"Seasonal note for ${travelMonth}"},"visaInfo":{"cost":0,"note":"Visa status","required":false},"specialEvents":[{"id":"e1","icon":"🎉","title":"Event","description":"Brief"}]}`;

        try {
            const response = await this.callGemini(prompt, systemInstruction);
            console.log('🤖 Raw AI Response length:', response.length);

            // Extract JSON from response (handle markdown code blocks)
            let jsonStr = response;
            if (response.includes('```json')) {
                jsonStr = response.split('```json')[1].split('```')[0];
            } else if (response.includes('```')) {
                jsonStr = response.split('```')[1].split('```')[0];
            }

            // Try to repair truncated JSON
            jsonStr = jsonStr.trim();

            // Count braces to check if JSON is complete
            const openBraces = (jsonStr.match(/\{/g) || []).length;
            const closeBraces = (jsonStr.match(/\}/g) || []).length;
            const openBrackets = (jsonStr.match(/\[/g) || []).length;
            const closeBrackets = (jsonStr.match(/\]/g) || []).length;

            // Add missing closing brackets/braces
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
                jsonStr += ']';
            }
            for (let i = 0; i < openBraces - closeBraces; i++) {
                jsonStr += '}';
            }

            // Fix common JSON issues
            jsonStr = jsonStr
                .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
                .replace(/,\s*}/g, '}')  // Remove trailing commas before }
                .replace(/\n/g, ' ')      // Remove newlines that might break strings
                .replace(/\t/g, ' ');     // Remove tabs

            console.log('📄 JSON to parse (first 500 chars):', jsonStr.substring(0, 500));

            let parsed;
            try {
                parsed = JSON.parse(jsonStr);
            } catch (parseError) {
                console.warn('⚠️ JSON parse failed, attempting recovery...');
                // Try to extract just the essential parts
                const titleMatch = jsonStr.match(/"title"\s*:\s*"([^"]+)"/);
                const summaryMatch = jsonStr.match(/"summary"\s*:\s*"([^"]+)"/);

                if (titleMatch) {
                    // Build a minimal valid response
                    parsed = {
                        title: titleMatch[1],
                        summary: summaryMatch ? summaryMatch[1] : 'Your personalized trip',
                        days: [],
                        estimatedCosts: { flights: 800, hotels: 450, activities: 150, meals: 200, transport: 100 },
                        hotels: [],
                        flights: [],
                        weatherInfo: { temp: "Varies", note: "Check local weather" },
                        specialEvents: []
                    };
                    console.log('🔧 Recovered minimal itinerary from truncated response');
                } else {
                    throw parseError;
                }
            }

            console.log('✅ Parsed itinerary with', parsed.days?.length || 0, 'days');
            return parsed;
        } catch (error) {
            console.error('❌ Failed to generate itinerary:', error);
            throw error;
        }
    },

    /**
     * Refine itinerary based on chat message
     */
    async refineItinerary(currentItinerary, userMessage, chatHistory = []) {
        const systemInstruction = `You are TripCraft, a helpful travel assistant. The user has an existing itinerary and wants to modify it.
Understand their request and provide helpful suggestions or modifications.
If they want specific changes, describe what would change.
Be conversational but concise. Use emojis sparingly for friendliness.`;

        const historyContext = chatHistory.length > 0
            ? `\nRecent conversation:\n${chatHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}`
            : '';

        const prompt = `Current trip: ${currentItinerary.title}
Duration: ${currentItinerary.days?.length || 3} days
${historyContext}

User request: "${userMessage}"

Respond helpfully. If they're asking for changes, explain what you would modify.
If it's a question, answer it based on the trip context.
Keep response under 100 words unless detail is needed.`;

        try {
            return await this.callGemini(prompt, systemInstruction);
        } catch (error) {
            console.error('Failed to refine itinerary:', error);
            return "I'm having trouble connecting right now. Please try again in a moment! 🙏";
        }
    },

    /**
     * Get activity suggestions for a specific context
     */
    async getActivitySuggestions(destination, context, preferences) {
        const prompt = `Suggest 3 activities for ${destination} that would be good for: ${context}
Consider: ${preferences.styles?.join(', ') || 'general interests'}
Budget level: ${preferences.budget > 2000 ? 'luxury' : preferences.budget > 1000 ? 'mid-range' : 'budget'}

Respond with JSON array:
[{"title": "Activity", "description": "Brief description", "estimatedCost": 25, "duration": "2 hours"}]`;

        try {
            const response = await this.callGemini(prompt);
            let jsonStr = response;
            if (response.includes('```')) {
                jsonStr = response.split('```json')[1]?.split('```')[0] || response.split('```')[1].split('```')[0];
            }
            return JSON.parse(jsonStr.trim());
        } catch (error) {
            console.error('Failed to get suggestions:', error);
            return [];
        }
    }
};

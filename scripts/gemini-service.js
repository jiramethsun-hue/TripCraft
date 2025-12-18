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

        // Build preference context for the AI
        const travelMonth = preferences.startDate ? new Date(preferences.startDate).toLocaleDateString('en-US', { month: 'long' }) : 'upcoming months';
        const tripType = preferences.tripType || 'general';
        const travelStyles = Array.isArray(preferences.styles) ? preferences.styles.join(', ') : (preferences.styles || 'balanced');
        const pace = preferences.pace || 'normal';
        const cuisine = Array.isArray(preferences.cuisines) ? preferences.cuisines.join(', ') : (preferences.cuisines || 'local');
        const diet = preferences.dietary?.length ? `Dietary restrictions: ${preferences.dietary.join(', ')}` : '';
        const mustHave = preferences.mustHave?.length ? `MUST include: ${preferences.mustHave.join(', ')}` : '';
        const avoid = preferences.avoid?.length ? `AVOID: ${preferences.avoid.join(', ')}` : '';

        const systemInstruction = `You are an experienced local guide creating personalized travel itineraries. 
Match activities to client preferences. Use REAL place names. Return ONLY valid JSON.

CLIENT WANTS: ${travelStyles}. Pace: ${pace}. ${diet} ${mustHave} ${avoid}

RULES:
- Generate ${preferences.days} days with 4-5 activities each
- Include 3 hotels (budget/mid/luxury) with real names
- Include 3 flights with real airlines
- Use real coordinates for ${preferences.destination}
- Add travelTime between activities`;

        const prompt = `${preferences.days}-day trip to ${preferences.destination}.
Budget: $${preferences.budget}. Travelers: ${preferences.adults || 2}. Nationality: ${preferences.nationality || 'US'}.
Styles: ${travelStyles}. Cuisine: ${cuisine}. Pace: ${pace}.
${diet} ${mustHave} ${avoid}

Return JSON:
{"title":"Trip Title","summary":"Brief summary","days":[{"name":"Day 1 - Theme","description":"Overview","activities":[{"id":"d1a1","time":"9AM","title":"Place Name","description":"Tip","duration":"2h","cost":10,"type":"sightseeing","location":"Area","coordinates":{"lat":35.0,"lng":135.0},"travelTime":""},{"id":"d1a2","time":"11AM","title":"Place 2","description":"Tip","duration":"1.5h","cost":0,"type":"culture","location":"Area","coordinates":{"lat":35.0,"lng":135.0},"travelTime":"15 min walk"},{"id":"d1a3","time":"1PM","title":"Lunch Spot","description":"Local food","duration":"1h","cost":15,"type":"food","location":"Area","coordinates":{"lat":35.0,"lng":135.0},"travelTime":"5 min walk"},{"id":"d1a4","time":"3PM","title":"Afternoon Place","description":"Tip","duration":"2h","cost":5,"type":"nature","location":"Area","coordinates":{"lat":35.0,"lng":135.0},"travelTime":"20 min bus"}]}],"estimatedCosts":{"flights":800,"hotels":500,"activities":200,"meals":250,"transport":100},"hotels":[{"id":"h1","name":"Budget Hotel Name","type":"Budget","location":"Near Station","pricePerNight":80,"rating":4.0,"features":["Central","Clean"],"coordinates":{"lat":35.0,"lng":135.0}},{"id":"h2","name":"Mid-range Hotel Name","type":"Boutique","location":"Downtown","pricePerNight":150,"rating":4.4,"features":["Stylish","Breakfast"],"coordinates":{"lat":35.0,"lng":135.0}},{"id":"h3","name":"Luxury Hotel Name","type":"Luxury","location":"Prime Area","pricePerNight":300,"rating":4.8,"features":["Spa","Views"],"coordinates":{"lat":35.0,"lng":135.0}}],"flights":[{"id":"f1","airline":"Budget Airline","price":500,"duration":"15h","stops":"1 stop","departure":"08:00","arrival":"23:00"},{"id":"f2","airline":"Major Airline","price":800,"duration":"12h","stops":"Direct","departure":"10:00","arrival":"22:00"},{"id":"f3","airline":"Premium Airline","price":1200,"duration":"11h","stops":"Direct","departure":"09:00","arrival":"20:00"}],"weatherInfo":{"temp":"15-22°C","note":"Pack layers"},"visaInfo":{"cost":0,"note":"Visa-free 90 days","required":false},"specialEvents":[{"id":"e1","icon":"🎉","title":"Local Festival","description":"Happening during your visit"}]}`;

        try {
            const response = await this.callGemini(prompt, systemInstruction);
            console.log('🤖 Raw AI Response length:', response.length);
            console.log('🤖 Raw AI Response (first 1000 chars):', response.substring(0, 1000));

            // Extract JSON from response (handle markdown code blocks)
            let jsonStr = response;
            if (response.includes('```json')) {
                jsonStr = response.split('```json')[1].split('```')[0];
                console.log('📦 Extracted from ```json block');
            } else if (response.includes('```')) {
                jsonStr = response.split('```')[1].split('```')[0];
                console.log('📦 Extracted from ``` block');
            }

            // Try to repair truncated JSON
            jsonStr = jsonStr.trim();

            // Count braces to check if JSON is complete
            const openBraces = (jsonStr.match(/\{/g) || []).length;
            const closeBraces = (jsonStr.match(/\}/g) || []).length;
            const openBrackets = (jsonStr.match(/\[/g) || []).length;
            const closeBrackets = (jsonStr.match(/\]/g) || []).length;

            console.log('🔢 Brace count - Open: {', openBraces, '} Close: }', closeBraces, ' [ ', openBrackets, ' ] ', closeBrackets);

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
                console.log('✅ JSON parsed successfully!');
                console.log('📊 Parsed data - days:', parsed.days?.length, 'hotels:', parsed.hotels?.length, 'flights:', parsed.flights?.length);
            } catch (parseError) {
                console.warn('⚠️ JSON parse failed:', parseError.message);
                console.log('⚠️ Failed JSON string:', jsonStr.substring(0, 300));

                // Try to extract just the essential parts
                const titleMatch = jsonStr.match(/"title"\s*:\s*"([^"]+)"/);
                const summaryMatch = jsonStr.match(/"summary"\s*:\s*"([^"]+)"/);

                if (titleMatch) {
                    // Build a minimal valid response with fallback data
                    const dest = preferences.destination || 'Japan';
                    parsed = {
                        title: titleMatch[1],
                        summary: summaryMatch ? summaryMatch[1] : 'Your personalized trip',
                        days: [{
                            name: 'Day 1 - Exploration',
                            description: `Discover ${dest}`,
                            activities: [
                                { id: 'a1', time: '9AM', title: 'Morning Exploration', description: 'Start your adventure', duration: '3h', cost: 0, type: 'sightseeing', location: dest, coordinates: { lat: 35.0, lng: 135.0 }, travelTime: '' },
                                { id: 'a2', time: '1PM', title: 'Local Lunch', description: 'Try local cuisine', duration: '1h', cost: 20, type: 'food', location: dest, coordinates: { lat: 35.0, lng: 135.0 }, travelTime: '15 min walk' },
                                { id: 'a3', time: '3PM', title: 'Afternoon Activity', description: 'Continue exploring', duration: '2h', cost: 10, type: 'culture', location: dest, coordinates: { lat: 35.0, lng: 135.0 }, travelTime: '10 min walk' }
                            ]
                        }],
                        estimatedCosts: { flights: 800, hotels: 450, activities: 150, meals: 200, transport: 100 },
                        hotels: [
                            { id: 'h1', name: 'Budget Stay', type: 'Budget', location: 'City Center', pricePerNight: 80, rating: 4.0, features: ['Central', 'Clean'] },
                            { id: 'h2', name: 'Boutique Hotel', type: 'Boutique', location: 'Downtown', pricePerNight: 150, rating: 4.4, features: ['Stylish', 'Breakfast'] },
                            { id: 'h3', name: 'Luxury Resort', type: 'Luxury', location: 'Prime Area', pricePerNight: 300, rating: 4.8, features: ['Spa', 'Views'] }
                        ],
                        flights: [
                            { id: 'f1', airline: 'Budget Air', price: 500, duration: '15h', stops: '1 stop', departure: '08:00', arrival: '23:00' },
                            { id: 'f2', airline: 'Major Carrier', price: 800, duration: '12h', stops: 'Direct', departure: '10:00', arrival: '22:00' },
                            { id: 'f3', airline: 'Premium Air', price: 1200, duration: '11h', stops: 'Direct', departure: '09:00', arrival: '20:00' }
                        ],
                        weatherInfo: { temp: "Varies", note: "Check local weather" },
                        visaInfo: { cost: 0, note: 'Check requirements', required: false },
                        specialEvents: []
                    };
                    console.log('🔧 Recovered minimal itinerary from truncated response');
                } else {
                    throw parseError;
                }
            }

            console.log('✅ Final parsed itinerary - days:', parsed.days?.length || 0, 'hotels:', parsed.hotels?.length || 0, 'flights:', parsed.flights?.length || 0);
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
     * Modify itinerary based on chat message - returns structured changes
     */
    async modifyItinerary(currentItinerary, userMessage, chatHistory = []) {
        const systemInstruction = `You are TripCraft AI. Modify the user's travel itinerary based on their request.
RESPOND WITH JSON ONLY - no markdown, no explanation text.

Format:
{"response": "Friendly confirmation under 50 words", "updatedItinerary": {COMPLETE itinerary object}}

The updatedItinerary must have this structure:
{
  "title": "Trip Title",
  "summary": "Brief summary",
  "days": [{
    "name": "Day 1 - Theme",
    "description": "Brief description",
    "slots": {
      "morning": [{"id": "unique_id", "name": "Activity Name", "description": "What to do", "duration": "2 hours", "tags": ["Food", "Culture"], "category": "Restaurant", "area": "Neighborhood"}],
      "afternoon": [...],
      "evening": [...]
    }
  }]
}

RULES:
- Return the COMPLETE modified itinerary, not just changes
- If user asks for "more food", add restaurant/food activities
- If user asks for "more relaxing", replace intense activities with parks/cafes
- Keep 1-2 activities per time slot
- Generate unique IDs like "food_1", "relax_1" for new activities`;

        // Simplify itinerary for prompt
        const simplifiedItinerary = {
            title: currentItinerary.title,
            summary: currentItinerary.summary || '',
            days: currentItinerary.days?.map(day => ({
                name: day.name,
                description: day.description,
                slots: {
                    morning: (day.slots?.morning || []).map(a => ({
                        id: a.id, name: a.name, description: a.description?.substring(0, 30),
                        duration: a.duration, tags: a.tags?.slice(0, 2), category: a.category, area: a.area
                    })),
                    afternoon: (day.slots?.afternoon || []).map(a => ({
                        id: a.id, name: a.name, description: a.description?.substring(0, 30),
                        duration: a.duration, tags: a.tags?.slice(0, 2), category: a.category, area: a.area
                    })),
                    evening: (day.slots?.evening || []).map(a => ({
                        id: a.id, name: a.name, description: a.description?.substring(0, 30),
                        duration: a.duration, tags: a.tags?.slice(0, 2), category: a.category, area: a.area
                    }))
                }
            })) || []
        };

        const prompt = `Current itinerary:
${JSON.stringify(simplifiedItinerary)}

User request: "${userMessage}"

Respond with ONLY valid JSON, no markdown:`;

        try {
            const response = await this.callGemini(prompt, systemInstruction);
            console.log('🔄 Raw modification response:', response.substring(0, 500));

            // Extract JSON from response - try multiple patterns
            let jsonStr = response.trim();

            // EARLY CHECK: If response doesn't contain any JSON structure, use fallback immediately
            if (!jsonStr.includes('{') || !jsonStr.includes('"response"')) {
                console.log('⚠️ AI returned conversational text, using local modification');
                return this.localModifyItinerary(currentItinerary, userMessage, response);
            }

            // Remove markdown code blocks if present
            if (jsonStr.includes('```json')) {
                jsonStr = jsonStr.split('```json')[1].split('```')[0];
            } else if (jsonStr.includes('```')) {
                jsonStr = jsonStr.split('```')[1].split('```')[0];
            }

            jsonStr = jsonStr.trim();

            // Fix common JSON issues
            jsonStr = jsonStr
                .replace(/,\s*]/g, ']')
                .replace(/,\s*}/g, '}')
                .replace(/[\r\n]+/g, ' ')
                .replace(/\t/g, ' ');

            // Balance braces
            const openBraces = (jsonStr.match(/\{/g) || []).length;
            const closeBraces = (jsonStr.match(/\}/g) || []).length;
            const openBrackets = (jsonStr.match(/\[/g) || []).length;
            const closeBrackets = (jsonStr.match(/\]/g) || []).length;

            for (let i = 0; i < openBrackets - closeBrackets; i++) jsonStr += ']';
            for (let i = 0; i < openBraces - closeBraces; i++) jsonStr += '}';

            console.log('📄 Cleaned JSON (first 300):', jsonStr.substring(0, 300));

            const parsed = JSON.parse(jsonStr);
            console.log('✅ Parsed modification - has updatedItinerary:', !!parsed.updatedItinerary);

            if (parsed.updatedItinerary) {
                return {
                    response: parsed.response || "I've updated your itinerary! ✨",
                    updatedItinerary: parsed.updatedItinerary
                };
            } else {
                // AI responded but didn't include updatedItinerary - use fallback
                console.log('⚠️ No updatedItinerary in response, using local modification');
                return this.localModifyItinerary(currentItinerary, userMessage, parsed.response);
            }
        } catch (error) {
            console.error('❌ Failed to parse AI response:', error);
            // Fallback to local modification
            return this.localModifyItinerary(currentItinerary, userMessage, null);
        }
    },

    /**
     * Local fallback modification when AI parsing fails
     */
    localModifyItinerary(currentItinerary, userMessage, aiResponse) {
        const msg = userMessage.toLowerCase();
        const updatedItinerary = JSON.parse(JSON.stringify(currentItinerary)); // Deep clone
        let response = aiResponse || '';
        let madeChanges = false;

        // Food-related requests
        if (msg.includes('food') || msg.includes('restaurant') || msg.includes('eat') || msg.includes('dining')) {
            const foodActivities = [
                { id: 'food_1', name: 'Local Food Tour', description: 'Explore authentic local cuisine and hidden gems', duration: '2 hours', tags: ['Food', 'Local'], category: 'Food', area: 'Downtown' },
                { id: 'food_2', name: 'Traditional Market Visit', description: 'Fresh ingredients and street food experience', duration: '1.5 hours', tags: ['Food', 'Culture'], category: 'Market', area: 'Old Town' },
                { id: 'food_3', name: 'Fine Dining Experience', description: 'Upscale restaurant with local specialties', duration: '2 hours', tags: ['Food', 'Fine Dining'], category: 'Restaurant', area: 'Central' }
            ];

            // Add food to evening slot of first day
            if (updatedItinerary.days && updatedItinerary.days[0]) {
                if (!updatedItinerary.days[0].slots.evening) {
                    updatedItinerary.days[0].slots.evening = [];
                }
                updatedItinerary.days[0].slots.evening.push(foodActivities[0]);
                madeChanges = true;
            }

            // Add food to afternoon slot of second day if exists
            if (updatedItinerary.days && updatedItinerary.days[1]) {
                if (!updatedItinerary.days[1].slots.afternoon) {
                    updatedItinerary.days[1].slots.afternoon = [];
                }
                updatedItinerary.days[1].slots.afternoon.push(foodActivities[1]);
            }

            response = response || "🍽️ I've added more food experiences to your trip! Check the evening and afternoon slots.";
        }

        // Relaxation requests
        else if (msg.includes('relax') || msg.includes('chill') || msg.includes('slow') || msg.includes('less busy') || msg.includes('lighter')) {
            const relaxActivities = [
                { id: 'relax_1', name: 'Peaceful Garden Stroll', description: 'Tranquil gardens perfect for unwinding', duration: '1.5 hours', tags: ['Relaxation', 'Nature'], category: 'Park', area: 'Garden District' },
                { id: 'relax_2', name: 'Café & People Watching', description: 'Cozy local café with great atmosphere', duration: '1 hour', tags: ['Relaxation', 'Café'], category: 'Café', area: 'Downtown' }
            ];

            // Replace afternoon activities with relaxing ones
            if (updatedItinerary.days && updatedItinerary.days[0]) {
                updatedItinerary.days[0].slots.afternoon = [relaxActivities[0]];
                madeChanges = true;
            }
            if (updatedItinerary.days && updatedItinerary.days[1]) {
                updatedItinerary.days[1].slots.afternoon = [relaxActivities[1]];
            }

            response = response || "🧘 I've made your itinerary more relaxed! Replaced busy activities with peaceful ones.";
        }

        // Culture/temple requests
        else if (msg.includes('culture') || msg.includes('temple') || msg.includes('museum') || msg.includes('history')) {
            const cultureActivities = [
                { id: 'culture_1', name: 'Historic Temple Visit', description: 'Ancient temple with beautiful architecture', duration: '2 hours', tags: ['Culture', 'Temple'], category: 'Temple', area: 'Historic District' },
                { id: 'culture_2', name: 'Local Museum Tour', description: 'Learn about local history and art', duration: '2 hours', tags: ['Culture', 'Museum'], category: 'Museum', area: 'Cultural Quarter' }
            ];

            if (updatedItinerary.days && updatedItinerary.days[0]) {
                if (!updatedItinerary.days[0].slots.morning) {
                    updatedItinerary.days[0].slots.morning = [];
                }
                updatedItinerary.days[0].slots.morning.push(cultureActivities[0]);
                madeChanges = true;
            }

            response = response || "🏛️ I've added more cultural experiences to your itinerary!";
        }

        // Default fallback
        else {
            response = response || `I've noted your request: "${userMessage}". Try being more specific like "add more food" or "make it more relaxing"! 💡`;
        }

        return {
            response: response,
            updatedItinerary: madeChanges ? updatedItinerary : null
        };
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

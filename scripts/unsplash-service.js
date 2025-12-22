/**
 * Unsplash Photo Service for TripCraft
 * Fetches real photos for activities and hotels
 * 
 * Setup: Get your free API key from https://unsplash.com/developers
 * Add to config.js: UNSPLASH_ACCESS_KEY: 'your_key_here'
 */

const UnsplashService = {
    // Cache to avoid duplicate API calls
    photoCache: new Map(),

    // Rate limiting (50 requests/hour for demo apps)
    requestCount: 0,
    lastResetTime: Date.now(),

    /**
     * Get photo URL for a location/activity
     * @param {string} query - Search query (e.g., "Kiyomizu Temple Kyoto")
     * @param {string} fallbackUrl - Fallback URL if API fails
     * @returns {Promise<string>} Photo URL
     */
    async getPhoto(query, fallbackUrl = '') {
        // Check cache first
        const cacheKey = query.toLowerCase().trim();
        if (this.photoCache.has(cacheKey)) {
            return this.photoCache.get(cacheKey);
        }

        // Check if API key is configured
        if (!CONFIG.UNSPLASH_ACCESS_KEY || CONFIG.UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_KEY_HERE') {
            console.log('Unsplash API key not configured, using fallback');
            return fallbackUrl;
        }

        // Rate limit check (reset every hour)
        const now = Date.now();
        if (now - this.lastResetTime > 3600000) {
            this.requestCount = 0;
            this.lastResetTime = now;
        }
        if (this.requestCount >= 45) { // Leave buffer for rate limit
            console.warn('Unsplash rate limit approaching, using fallback');
            return fallbackUrl;
        }

        try {
            const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Client-ID ${CONFIG.UNSPLASH_ACCESS_KEY}`
                }
            });

            this.requestCount++;

            if (!response.ok) {
                console.error('Unsplash API error:', response.status);
                return fallbackUrl;
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                // Use small size for thumbnails (400px wide)
                const photoUrl = data.results[0].urls.small;
                this.photoCache.set(cacheKey, photoUrl);
                return photoUrl;
            }

            return fallbackUrl;
        } catch (error) {
            console.error('Unsplash fetch error:', error);
            return fallbackUrl;
        }
    },

    /**
     * Get photos for multiple queries in batch (with delay to respect rate limits)
     * @param {Array} queries - Array of {id, query, fallback} objects
     * @returns {Promise<Map>} Map of id -> photoUrl
     */
    async getBatchPhotos(queries) {
        const results = new Map();

        // Process in sequence with small delay to avoid rate limiting
        for (const item of queries) {
            const photoUrl = await this.getPhoto(item.query, item.fallback);
            results.set(item.id, photoUrl);

            // Small delay between requests (100ms)
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return results;
    },

    /**
     * Build optimized search query for an activity
     * @param {Object} activity - Activity object with name, area, category
     * @param {string} destination - Trip destination
     * @returns {string} Optimized search query
     */
    buildActivityQuery(activity, destination) {
        const city = destination?.split(',')[0]?.trim() || '';
        const name = activity.name || activity.title || '';
        const location = activity.location || activity.area || '';

        // Clean up common prefixes/suffixes for better search
        const cleanName = name
            .replace(/^(Visit|Explore|Tour|See|Experience|Morning in|Afternoon at|Evening at|Lunch at|Dinner at)\s+/i, '')
            .replace(/\s+(Visit|Tour|Experience)$/i, '')
            .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical notes
            .trim();

        // Country mapping for better search context
        const countryMap = {
            'tokyo': 'Japan', 'osaka': 'Japan', 'kyoto': 'Japan', 'nara': 'Japan',
            'paris': 'France', 'lyon': 'France', 'nice': 'France',
            'london': 'UK', 'manchester': 'UK', 'edinburgh': 'Scotland',
            'rome': 'Italy', 'milan': 'Italy', 'venice': 'Italy', 'florence': 'Italy',
            'barcelona': 'Spain', 'madrid': 'Spain',
            'bangkok': 'Thailand', 'phuket': 'Thailand', 'chiang mai': 'Thailand',
            'seoul': 'Korea', 'busan': 'Korea',
            'singapore': 'Singapore',
            'bali': 'Indonesia', 'jakarta': 'Indonesia',
            'copenhagen': 'Denmark', 'stockholm': 'Sweden', 'oslo': 'Norway',
            'amsterdam': 'Netherlands', 'berlin': 'Germany', 'munich': 'Germany',
            'vienna': 'Austria', 'zurich': 'Switzerland', 'prague': 'Czech Republic',
            'lisbon': 'Portugal', 'dublin': 'Ireland', 'athens': 'Greece',
            'new york': 'USA', 'los angeles': 'USA', 'san francisco': 'USA'
        };
        const country = countryMap[city.toLowerCase()] || '';

        // For specific place names (temples, shrines, landmarks), search directly with city
        const landmarkKeywords = ['temple', 'shrine', 'tower', 'palace', 'castle', 'museum', 'garden',
            'park', 'market', 'station', 'bridge', 'street', 'district', 'square', 'cathedral',
            'mosque', 'church', 'monument', 'statue', 'beach', 'hill', 'mountain', 'lake', 'river'];
        const isLandmark = landmarkKeywords.some(l => cleanName.toLowerCase().includes(l));

        // If it's a specific landmark or proper noun, search for it directly
        if (isLandmark || /^[A-Z]/.test(cleanName)) {
            // Use the actual name + city for landmarks
            return `${cleanName} ${city} ${country}`.trim();
        }

        // Handle food/restaurant activities
        const category = (activity.category || activity.type || '').toLowerCase();
        if (category.includes('food') || category.includes('restaurant') ||
            cleanName.toLowerCase().includes('lunch') || cleanName.toLowerCase().includes('dinner') ||
            cleanName.toLowerCase().includes('breakfast')) {
            return `${city} ${country} local food restaurant cuisine`.trim();
        }

        // Handle shopping
        if (category.includes('shopping') || cleanName.toLowerCase().includes('shopping')) {
            return `${city} ${country} shopping street market`.trim();
        }

        // Handle nature/outdoor
        if (category.includes('nature') || category.includes('outdoor')) {
            return `${city} ${country} nature scenery landscape`.trim();
        }

        // Default: use the actual name from AI with city and country
        return `${cleanName} ${city} ${country}`.trim();
    },

    /**
     * Build search query for a hotel
     * @param {Object} hotel - Hotel object
     * @param {string} destination - Trip destination
     * @returns {string} Search query
     */
    buildHotelQuery(hotel, destination) {
        const city = destination?.split(',')[0]?.trim() || '';
        const hotelName = hotel.name || '';
        const type = hotel.type || 'hotel';

        // Country mapping for context
        const countryMap = {
            'tokyo': 'Japan', 'osaka': 'Japan', 'kyoto': 'Japan', 'nara': 'Japan',
            'paris': 'France', 'london': 'UK', 'rome': 'Italy', 'barcelona': 'Spain',
            'bangkok': 'Thailand', 'seoul': 'Korea', 'singapore': 'Singapore',
            'copenhagen': 'Denmark', 'amsterdam': 'Netherlands', 'berlin': 'Germany',
            'new york': 'USA', 'los angeles': 'USA'
        };
        const country = countryMap[city.toLowerCase()] || '';

        // If hotel name looks like a real hotel (has multiple words, not just "Budget Stay")
        if (hotelName && !hotelName.includes('Budget Stay') && !hotelName.includes('Boutique Hotel') && !hotelName.includes('Luxury Resort')) {
            // Search by actual hotel name - this works best for real hotels
            return `${hotelName} hotel ${country}`.trim();
        }

        // For specific hotel types, search for that style with location
        if (type.toLowerCase().includes('ryokan') || type.toLowerCase().includes('traditional')) {
            return `japanese ryokan interior ${city}`;
        }
        if (type.toLowerCase().includes('hostel')) {
            return `hostel room interior ${city} ${country}`.trim();
        }
        if (type.toLowerCase().includes('luxury')) {
            return `luxury hotel lobby ${city} ${country}`.trim();
        }
        if (type.toLowerCase().includes('boutique')) {
            return `boutique hotel room ${city} ${country}`.trim();
        }

        // Default with location context
        return `hotel room interior ${city} ${country}`.trim();
    },

    /**
     * Update activity images in the DOM after fetching
     * Also stores the URL in the activity object so it persists across re-renders
     * @param {Array} activities - Array of activity objects
     * @param {string} destination - Trip destination
     */
    async updateActivityImages(activities, destination) {
        const queries = activities.map(a => ({
            id: a.id,
            activity: a, // Keep reference to update imageUrl
            query: this.buildActivityQuery(a, destination),
            fallback: a.imageUrl || activityTypeImages[a.category?.toLowerCase()] || activityTypeImages.default
        }));

        const photos = await this.getBatchPhotos(queries);

        // Update DOM AND save to activity object for persistence
        photos.forEach((url, id) => {
            // Find the activity and save the URL to it
            const activity = activities.find(a => a.id === id);
            if (activity && url) {
                activity.imageUrl = url; // Save to activity object for re-renders
            }

            // Update DOM
            const card = document.querySelector(`.activity-card[data-id="${id}"] .activity-image img`);
            if (card && url) {
                card.src = url;
            }
        });
    },

    /**
     * Update hotel images in the DOM after fetching
     * Also stores the URL in the hotel object so it persists across re-renders
     * @param {Array} hotels - Array of hotel objects  
     * @param {string} destination - Trip destination
     */
    async updateHotelImages(hotels, destination) {
        const queries = hotels.map(h => ({
            id: h.id,
            query: this.buildHotelQuery(h, destination),
            fallback: h.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
        }));

        const photos = await this.getBatchPhotos(queries);

        // Update DOM AND save to hotel object for persistence
        photos.forEach((url, id) => {
            // Find the hotel and save the URL to it
            const hotel = hotels.find(h => h.id === id);
            if (hotel && url) {
                hotel.image = url; // Save to hotel object for re-renders
            }

            // Update DOM
            const card = document.querySelector(`.hotel-card[data-id="${id}"] .hotel-image img`);
            if (card && url) {
                card.src = url;
            }
        });
    }
};

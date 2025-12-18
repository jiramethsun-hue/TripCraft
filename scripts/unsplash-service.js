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

        // Clean up common prefixes/suffixes for better search
        const cleanName = name
            .replace(/^(Visit|Explore|Tour|See|Experience)\s+/i, '')
            .replace(/\s+(Visit|Tour|Experience)$/i, '')
            .trim();

        // For specific place names (temples, shrines, landmarks), search directly
        const landmarkKeywords = ['temple', 'shrine', 'tower', 'palace', 'castle', 'museum', 'garden',
            'park', 'market', 'station', 'bridge', 'street', 'district'];
        const isLandmark = landmarkKeywords.some(l => cleanName.toLowerCase().includes(l));

        // If it looks like a specific place, search for it directly
        if (isLandmark || cleanName.includes('-') || /[A-Z]/.test(cleanName.charAt(0))) {
            return `${cleanName} ${city}`.trim();
        }

        // For generic activities (food, shopping), combine category with city
        const category = activity.category || activity.type || '';
        if (category.toLowerCase().includes('food') || category.toLowerCase().includes('restaurant')) {
            return `${city} local cuisine food`;
        }
        if (category.toLowerCase().includes('shopping')) {
            return `${city} shopping street`;
        }

        // Default: use name with city
        return `${cleanName} ${city}`.trim();
    },

    /**
     * Build search query for a hotel
     * @param {Object} hotel - Hotel object
     * @param {string} destination - Trip destination
     * @returns {string} Search query
     */
    buildHotelQuery(hotel, destination) {
        const city = destination?.split(',')[0]?.trim() || '';
        const type = hotel.type || 'hotel';

        // For specific hotel types, search for that style
        if (type.toLowerCase().includes('ryokan') || type.toLowerCase().includes('traditional')) {
            return `traditional japanese ryokan ${city}`;
        }
        if (type.toLowerCase().includes('hostel')) {
            return `modern hostel interior`;
        }
        if (type.toLowerCase().includes('luxury')) {
            return `luxury hotel room ${city}`;
        }

        return `${type} hotel ${city}`;
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

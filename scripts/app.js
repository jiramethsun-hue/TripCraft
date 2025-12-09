/**
 * TripCraft - AI Trip Planner
 * Application Logic with Hotels, Images, and Chat History
 */

// ========================================
// State
// ========================================

const state = {
    destination: '',
    tripDescription: '',
    tripDays: 3,
    adults: 2,
    tripType: [],
    budget: 1000, // Now numeric
    nationality: '',
    travelStyle: [],
    pace: 'normal',
    cuisine: [],
    diet: [],
    accomType: [],
    accomLoc: [],
    mustHave: [],
    avoid: [],

    currentItinerary: null,
    selectedDay: -1, // -1 = Total Trip
    selectedActivity: null,
    selectedHotel: null,
    selectedFlight: null,

    // Cost tracking
    costs: {
        flight: 650,
        hotel: 540,
        activities: 180,
        meals: 300,
        transport: 180,
        visa: 0
    },

    chatHistory: [],
    tripHistory: [],
    currentChatTab: 'chat'
};

// ========================================
// Hotel Data
// ========================================

const hotelData = {
    'kyoto': [
        {
            id: 'hotel1',
            name: 'The Mitsui Kyoto',
            type: 'Luxury Hotel',
            location: 'Nijojo-mae',
            price: '$450/night',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
            features: ['Traditional garden', 'Onsen spa', 'Central location']
        },
        {
            id: 'hotel2',
            name: 'Hotel Kanra Kyoto',
            type: 'Boutique Hotel',
            location: 'Gojo',
            price: '$180/night',
            rating: 4.6,
            image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop',
            features: ['Modern Japanese', 'Near station', 'Great value']
        },
        {
            id: 'hotel3',
            name: 'Piece Hostel Kyoto',
            type: 'Design Hostel',
            location: 'Kyoto Station',
            price: '$45/night',
            rating: 4.4,
            image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
            features: ['Social atmosphere', 'Café bar', 'Budget friendly']
        }
    ],
    'tokyo': [
        {
            id: 'hotel1',
            name: 'Aman Tokyo',
            type: 'Luxury Hotel',
            location: 'Otemachi',
            price: '$800/night',
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
            features: ['Sky lobby', 'Panoramic views', 'Michelin restaurant']
        },
        {
            id: 'hotel2',
            name: 'Hotel Gracery Shinjuku',
            type: 'Mid-range Hotel',
            location: 'Shinjuku',
            price: '$120/night',
            rating: 4.5,
            image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
            features: ['Godzilla head!', 'Great location', 'Modern rooms']
        },
        {
            id: 'hotel3',
            name: 'Nui. Hostel & Bar',
            type: 'Design Hostel',
            location: 'Kuramae',
            price: '$35/night',
            rating: 4.3,
            image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
            features: ['Trendy area', 'Bar lounge', 'Art vibes']
        }
    ],
    'default': [
        {
            id: 'hotel1',
            name: 'Premium City Hotel',
            type: 'Luxury',
            location: 'City Center',
            price: '$300/night',
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
            features: ['Central', 'Spa', 'Restaurant']
        },
        {
            id: 'hotel2',
            name: 'Comfort Inn Central',
            type: 'Mid-range',
            location: 'Downtown',
            price: '$100/night',
            rating: 4.4,
            image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
            features: ['Good value', 'Near transit', 'Breakfast included']
        }
    ]
};

// ========================================
// Flight Data
// ========================================

const flightData = {
    'kyoto': [
        {
            id: 'flight1',
            airline: 'Japan Airlines',
            price: 850,
            duration: '14h 30m',
            stops: 'Direct',
            departure: '10:30 AM',
            arrival: '3:00 PM +1',
            pros: ['Direct flight', 'Premium service', 'Good meal'],
            cons: ['Higher price']
        },
        {
            id: 'flight2',
            airline: 'ANA',
            price: 720,
            duration: '16h 15m',
            stops: '1 stop (Tokyo)',
            departure: '11:45 AM',
            arrival: '6:00 PM +1',
            pros: ['Good value', 'Comfortable seats'],
            cons: ['1 layover', 'Longer travel time']
        },
        {
            id: 'flight3',
            airline: 'Singapore Airlines',
            price: 650,
            duration: '18h 45m',
            stops: '1 stop (Singapore)',
            departure: '9:00 PM',
            arrival: '5:45 PM +1',
            pros: ['Best price', 'Great entertainment'],
            cons: ['Overnight flight', 'Long layover']
        }
    ],
    'tokyo': [
        {
            id: 'flight1',
            airline: 'ANA',
            price: 780,
            duration: '13h 45m',
            stops: 'Direct',
            departure: '11:00 AM',
            arrival: '2:45 PM +1',
            pros: ['Direct flight', 'Excellent service'],
            cons: ['Premium pricing']
        },
        {
            id: 'flight2',
            airline: 'Cathay Pacific',
            price: 580,
            duration: '17h 30m',
            stops: '1 stop (Hong Kong)',
            departure: '3:30 PM',
            arrival: '9:00 AM +1',
            pros: ['Great price', 'Good food'],
            cons: ['1 layover']
        }
    ],
    'default': [
        {
            id: 'flight1',
            airline: 'Major Carrier',
            price: 600,
            duration: '12h',
            stops: 'Direct',
            departure: '10:00 AM',
            arrival: '10:00 PM',
            pros: ['Direct flight'],
            cons: ['Basic amenities']
        }
    ]
};

// ========================================
// Visa Data by Nationality
// ========================================

const visaData = {
    'JP': { 'kyoto': { cost: 0, note: 'Domestic travel' }, 'tokyo': { cost: 0, note: 'Domestic travel' } },
    'US': { 'kyoto': { cost: 0, note: 'Visa-free (90 days)' }, 'tokyo': { cost: 0, note: 'Visa-free (90 days)' } },
    'UK': { 'kyoto': { cost: 0, note: 'Visa-free (90 days)' }, 'tokyo': { cost: 0, note: 'Visa-free (90 days)' } },
    'AU': { 'kyoto': { cost: 0, note: 'Visa-free (90 days)' }, 'tokyo': { cost: 0, note: 'Visa-free (90 days)' } },
    'SG': { 'kyoto': { cost: 0, note: 'Visa-free (90 days)' }, 'tokyo': { cost: 0, note: 'Visa-free (90 days)' } },
    'CN': { 'kyoto': { cost: 25, note: 'Single-entry visa required' }, 'tokyo': { cost: 25, note: 'Single-entry visa required' } },
    'IN': { 'kyoto': { cost: 25, note: 'Visa required' }, 'tokyo': { cost: 25, note: 'Visa required' } },
    'default': { cost: 25, note: 'Visa may be required' }
};

// ========================================
// Special Events Data
// ========================================

const eventsData = {
    'kyoto': [
        {
            id: 'event1',
            icon: '🎄',
            title: 'Arashiyama Hanatouro',
            description: 'Illumination festival in Arashiyama (Dec 8-17)',
            type: 'festival'
        },
        {
            id: 'event2',
            icon: '🎎',
            title: 'Geisha Winter Dance',
            description: 'Traditional Miyako Odori performance',
            type: 'cultural'
        }
    ],
    'tokyo': [
        {
            id: 'event1',
            icon: '🎄',
            title: 'Tokyo Winter Illuminations',
            description: 'Marunouchi & Roppongi light displays',
            type: 'festival'
        },
        {
            id: 'event2',
            icon: '🎵',
            title: 'Winter Sonic Concert',
            description: 'Major music festival at Tokyo Dome',
            type: 'concert'
        }
    ],
    'default': []
};

// ========================================
// Weather Data
// ========================================

const weatherData = {
    'kyoto': { temp: '8-15°C', note: 'Cool, mostly clear. Pack layers.' },
    'tokyo': { temp: '10-18°C', note: 'Mild winter, occasional rain.' },
    'default': { temp: '15-22°C', note: 'Pleasant weather expected.' }
};

// ========================================
// Activity Images by Type
// ========================================

const activityImages = {
    'kiyomizu': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
    'gion': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=300&fit=crop',
    'lunch-gion': 'https://images.unsplash.com/photo-1580442151529-343f2f6e0e27?w=400&h=300&fit=crop',
    'pontocho': 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=400&h=300&fit=crop',
    'bamboo': 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop',
    'tenryuji': 'https://images.unsplash.com/photo-1576675784201-0e142b423952?w=400&h=300&fit=crop',
    'monkey-park': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    'kinkakuji': 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=300&fit=crop',
    'nishiki': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
    'fushimi': 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=300&fit=crop',
    'inari-cafe': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop',
    'souvenir': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=300&fit=crop',
    'departure': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    'sensoji': 'https://images.unsplash.com/photo-1570521462033-3015e76e7432?w=400&h=300&fit=crop',
    'skytree': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    'ramen-lunch': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    'shibuya': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=300&fit=crop',
    'meiji': 'https://images.unsplash.com/photo-1583766395091-2eb9994ed094?w=400&h=300&fit=crop',
    'harajuku': 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&h=300&fit=crop',
    'omotesando': 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400&h=300&fit=crop',
    'shinjuku': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=400&h=300&fit=crop',
    'tsukiji': 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
    'ginza': 'https://images.unsplash.com/photo-1549693578-d683be217e58?w=400&h=300&fit=crop',
    'tokyo-station': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    'default': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop'
};

// ========================================
// Sample Itinerary Data
// ========================================

const sampleItineraries = {
    'kyoto': {
        title: 'Your Kyoto Adventure',
        days: [
            {
                name: 'Day 1 – Historic Higashiyama',
                description: 'Immerse yourself in the traditional charm of eastern Kyoto',
                slots: {
                    morning: [
                        {
                            id: 'kiyomizu',
                            name: 'Kiyomizu-dera Temple',
                            description: 'UNESCO World Heritage site with stunning wooden stage and panoramic city views.',
                            duration: '2 hours',
                            tags: ['Temple', 'UNESCO', 'Views'],
                            area: 'Higashiyama',
                            category: 'Historic Site',
                            priceLevel: '$$',
                            hours: '6:00 AM - 6:00 PM',
                            goodFor: ['Couples', 'Families'],
                            rating: 4.7,
                            reviews: { positive: ['Breathtaking views', 'Beautiful architecture'], negative: ['Crowded mid-day'] }
                        }
                    ],
                    afternoon: [
                        {
                            id: 'gion',
                            name: 'Gion District Walk',
                            description: 'Stroll through Kyoto\'s famous geisha district with traditional machiya houses.',
                            duration: '2 hours',
                            tags: ['Culture', 'Walking', 'Photo'],
                            area: 'Gion',
                            category: 'Historic District',
                            priceLevel: '$',
                            hours: 'Open 24h',
                            goodFor: ['Everyone'],
                            rating: 4.5,
                            reviews: { positive: ['Authentic atmosphere', 'Great for photos'], negative: ['Touristy areas'] }
                        },
                        {
                            id: 'lunch-gion',
                            name: 'Gion Kappa Restaurant',
                            description: 'Traditional Kyoto kaiseki cuisine with seasonal ingredients.',
                            duration: '1 hour',
                            tags: ['Food', 'Local'],
                            area: 'Gion',
                            category: 'Restaurant',
                            priceLevel: '$$',
                            hours: '11:30 AM - 2:00 PM',
                            goodFor: ['Foodies'],
                            rating: 4.4,
                            reviews: { positive: ['Authentic flavors', 'Beautiful presentation'], negative: ['Small portions'] }
                        }
                    ],
                    evening: [
                        {
                            id: 'pontocho',
                            name: 'Pontocho Alley Dinner',
                            description: 'Atmospheric alley with riverside restaurants perfect for romantic dinners.',
                            duration: '2 hours',
                            tags: ['Food', 'Nightlife', 'Scenic'],
                            area: 'Pontocho',
                            category: 'Dining',
                            priceLevel: '$$$',
                            hours: '5:00 PM - 11:00 PM',
                            goodFor: ['Couples'],
                            rating: 4.6,
                            reviews: { positive: ['Magical atmosphere', 'River views'], negative: ['Expensive'] },
                            note: 'Book riverside seating ahead'
                        }
                    ]
                }
            },
            {
                name: 'Day 2 – Arashiyama & Golden Temple',
                description: 'Bamboo groves and the iconic golden pavilion',
                slots: {
                    morning: [
                        {
                            id: 'bamboo',
                            name: 'Arashiyama Bamboo Grove',
                            description: 'Walk through the otherworldly bamboo forest - arrive early for best experience.',
                            duration: '1 hour',
                            tags: ['Nature', 'Photo', 'Free'],
                            area: 'Arashiyama',
                            category: 'Natural',
                            priceLevel: 'Free',
                            hours: '24 hours',
                            goodFor: ['Everyone'],
                            rating: 4.5,
                            reviews: { positive: ['Magical atmosphere', 'Free'], negative: ['Very crowded by 9 AM'] },
                            note: 'Arrive by 7 AM for photos'
                        },
                        {
                            id: 'tenryuji',
                            name: 'Tenryu-ji Temple',
                            description: 'Zen temple with one of Japan\'s most celebrated gardens.',
                            duration: '1.5 hours',
                            tags: ['Temple', 'Garden', 'UNESCO'],
                            area: 'Arashiyama',
                            category: 'Temple',
                            priceLevel: '$$',
                            hours: '8:30 AM - 5:00 PM',
                            goodFor: ['Garden lovers'],
                            rating: 4.6,
                            reviews: { positive: ['Beautiful Zen garden', 'Peaceful'], negative: ['Interior costs extra'] }
                        }
                    ],
                    afternoon: [
                        {
                            id: 'kinkakuji',
                            name: 'Kinkaku-ji Golden Pavilion',
                            description: 'Kyoto\'s most iconic landmark - a Zen temple covered in gold leaf.',
                            duration: '1 hour',
                            tags: ['Temple', 'Landmark', 'Photo'],
                            area: 'North Kyoto',
                            category: 'Temple',
                            priceLevel: '$$',
                            hours: '9:00 AM - 5:00 PM',
                            goodFor: ['Everyone'],
                            rating: 4.7,
                            reviews: { positive: ['Stunning views', 'Iconic'], negative: ['Always crowded'] }
                        }
                    ],
                    evening: [
                        {
                            id: 'nishiki',
                            name: 'Nishiki Market',
                            description: 'Explore "Kyoto\'s Kitchen" - 400-year-old market with local specialties.',
                            duration: '1.5 hours',
                            tags: ['Food', 'Market', 'Local'],
                            area: 'Downtown',
                            category: 'Market',
                            priceLevel: '$$',
                            hours: 'Until 6 PM',
                            goodFor: ['Foodies'],
                            rating: 4.5,
                            reviews: { positive: ['Amazing variety', 'Fresh samples'], negative: ['Crowded aisles'] },
                            note: 'Arrive before 5 PM'
                        }
                    ]
                }
            },
            {
                name: 'Day 3 – Fushimi Inari & Departure',
                description: 'The mesmerizing vermillion gates and final explorations',
                slots: {
                    morning: [
                        {
                            id: 'fushimi',
                            name: 'Fushimi Inari Shrine',
                            description: 'Hike through thousands of vermillion torii gates - absolutely spectacular.',
                            duration: '2-3 hours',
                            tags: ['Shrine', 'Hiking', 'Photo'],
                            area: 'Fushimi',
                            category: 'Shrine',
                            priceLevel: 'Free',
                            hours: '24 hours',
                            goodFor: ['Everyone'],
                            rating: 4.8,
                            reviews: { positive: ['Absolutely stunning', 'Free entry'], negative: ['Crowded at start'] },
                            note: 'Go early or late afternoon'
                        }
                    ],
                    afternoon: [
                        {
                            id: 'inari-cafe',
                            name: 'Vermillion Café',
                            description: 'Relax with matcha and traditional sweets near the shrine.',
                            duration: '45 min',
                            tags: ['Café', 'Local'],
                            area: 'Fushimi',
                            category: 'Café',
                            priceLevel: '$',
                            hours: '9 AM - 5 PM',
                            goodFor: ['Everyone'],
                            rating: 4.3,
                            reviews: { positive: ['Great matcha', 'Cozy'], negative: ['Limited seating'] }
                        },
                        {
                            id: 'souvenir',
                            name: 'Souvenir Shopping',
                            description: 'Pick up omiyage at Kyoto Station - Yatsuhashi, matcha Kit-Kats, crafts.',
                            duration: '1 hour',
                            tags: ['Shopping'],
                            area: 'Kyoto Station',
                            category: 'Shopping',
                            priceLevel: '$$',
                            hours: '10 AM - 9 PM',
                            goodFor: ['Everyone'],
                            rating: 4.2,
                            reviews: { positive: ['Great gifts', 'Convenient'], negative: ['Crowded'] }
                        }
                    ],
                    evening: [
                        {
                            id: 'departure',
                            name: 'Departure / Free Time',
                            description: 'Head to your next destination or enjoy a final meal at the station.',
                            duration: 'Flexible',
                            tags: ['Travel'],
                            area: 'Kyoto Station',
                            category: 'Travel',
                            priceLevel: '-',
                            hours: 'As needed',
                            goodFor: ['Everyone'],
                            rating: null,
                            reviews: null
                        }
                    ]
                }
            }
        ]
    },
    'tokyo': {
        title: 'Your Tokyo Adventure',
        days: [
            {
                name: 'Day 1 – Traditional & Modern Contrast',
                description: 'Ancient temples meet neon-lit streets',
                slots: {
                    morning: [
                        {
                            id: 'sensoji',
                            name: 'Senso-ji Temple',
                            description: 'Tokyo\'s oldest temple in Asakusa with iconic Kaminarimon gate.',
                            duration: '2 hours',
                            tags: ['Temple', 'Culture', 'Shopping'],
                            area: 'Asakusa',
                            category: 'Historic',
                            priceLevel: 'Free',
                            hours: '6 AM - 5 PM',
                            goodFor: ['Everyone'],
                            rating: 4.6,
                            reviews: { positive: ['Iconic experience', 'Great shopping'], negative: ['Crowded'] }
                        }
                    ],
                    afternoon: [
                        {
                            id: 'skytree',
                            name: 'Tokyo Skytree',
                            description: 'Japan\'s tallest tower with 360-degree views. See Mt. Fuji on clear days.',
                            duration: '1.5 hours',
                            tags: ['Views', 'Landmark'],
                            area: 'Sumida',
                            category: 'Observation',
                            priceLevel: '$$$',
                            hours: '10 AM - 9 PM',
                            goodFor: ['Everyone', 'Photo'],
                            rating: 4.5,
                            reviews: { positive: ['Incredible views', 'Modern'], negative: ['Expensive', 'Queues'] }
                        },
                        {
                            id: 'ramen-lunch',
                            name: 'Ichiran Ramen',
                            description: 'Famous solo-booth ramen - customize your perfect bowl.',
                            duration: '45 min',
                            tags: ['Food', 'Ramen'],
                            area: 'Various',
                            category: 'Restaurant',
                            priceLevel: '$$',
                            hours: '24 hours',
                            goodFor: ['Everyone'],
                            rating: 4.4,
                            reviews: { positive: ['Delicious', 'Unique experience'], negative: ['Feels isolated'] }
                        }
                    ],
                    evening: [
                        {
                            id: 'shibuya',
                            name: 'Shibuya Crossing',
                            description: 'World\'s busiest crossing + vibrant nightlife and shopping.',
                            duration: '2 hours',
                            tags: ['Nightlife', 'Shopping', 'Iconic'],
                            area: 'Shibuya',
                            category: 'District',
                            priceLevel: '$$',
                            hours: 'Best after 7 PM',
                            goodFor: ['Everyone'],
                            rating: 4.5,
                            reviews: { positive: ['Must-see', 'Amazing energy'], negative: ['Overwhelming crowds'] }
                        }
                    ]
                }
            },
            {
                name: 'Day 2 – Harajuku to Shinjuku',
                description: 'Fashion, shrines, and electric nightscape',
                slots: {
                    morning: [
                        {
                            id: 'meiji',
                            name: 'Meiji Shrine',
                            description: 'Peaceful forest shrine in the heart of Tokyo.',
                            duration: '1.5 hours',
                            tags: ['Shrine', 'Nature', 'Free'],
                            area: 'Harajuku',
                            category: 'Shrine',
                            priceLevel: 'Free',
                            hours: 'Sunrise-Sunset',
                            goodFor: ['Everyone'],
                            rating: 4.7,
                            reviews: { positive: ['Serene', 'Beautiful forest'], negative: ['Weekend weddings crowded'] }
                        }
                    ],
                    afternoon: [
                        {
                            id: 'harajuku',
                            name: 'Harajuku & Takeshita',
                            description: 'Youth fashion mecca with quirky boutiques and colorful crepes.',
                            duration: '2 hours',
                            tags: ['Shopping', 'Fashion', 'Youth'],
                            area: 'Harajuku',
                            category: 'Shopping',
                            priceLevel: '$$',
                            hours: '10 AM - 8 PM',
                            goodFor: ['Young adults'],
                            rating: 4.3,
                            reviews: { positive: ['Unique finds', 'Fun vibe'], negative: ['Very crowded'] }
                        },
                        {
                            id: 'omotesando',
                            name: 'Omotesando Avenue',
                            description: 'Tokyo\'s Champs-Élysées with high-end boutiques and stunning architecture.',
                            duration: '1.5 hours',
                            tags: ['Shopping', 'Architecture'],
                            area: 'Omotesando',
                            category: 'Shopping',
                            priceLevel: '$$$',
                            hours: '11 AM - 8 PM',
                            goodFor: ['Couples', 'Design lovers'],
                            rating: 4.4,
                            reviews: { positive: ['Beautiful street', 'Great cafes'], negative: ['Expensive'] }
                        }
                    ],
                    evening: [
                        {
                            id: 'shinjuku',
                            name: 'Shinjuku Night Out',
                            description: 'Neon alleys, Memory Lane yakitori, rooftop bars.',
                            duration: '3 hours',
                            tags: ['Nightlife', 'Food', 'Photo'],
                            area: 'Shinjuku',
                            category: 'Nightlife',
                            priceLevel: '$$',
                            hours: 'After 7 PM',
                            goodFor: ['Adults'],
                            rating: 4.6,
                            reviews: { positive: ['Electric atmosphere', 'Great food'], negative: ['Easy to get lost'] }
                        }
                    ]
                }
            },
            {
                name: 'Day 3 – Tsukiji & Ginza',
                description: 'Fresh seafood and upscale shopping farewell',
                slots: {
                    morning: [
                        {
                            id: 'tsukiji',
                            name: 'Tsukiji Outer Market',
                            description: 'Fresh seafood breakfast, sushi, tamagoyaki, and kitchenware.',
                            duration: '2 hours',
                            tags: ['Food', 'Market', 'Seafood'],
                            area: 'Tsukiji',
                            category: 'Market',
                            priceLevel: '$$',
                            hours: '5 AM - 2 PM',
                            goodFor: ['Foodies'],
                            rating: 4.5,
                            reviews: { positive: ['Freshest sushi', 'Authentic'], negative: ['Crowded', 'Early close'] },
                            note: 'Come hungry, best before 10 AM'
                        }
                    ],
                    afternoon: [
                        {
                            id: 'ginza',
                            name: 'Ginza District',
                            description: 'Upscale shopping, flagship stores, art galleries.',
                            duration: '2 hours',
                            tags: ['Shopping', 'Upscale'],
                            area: 'Ginza',
                            category: 'Shopping',
                            priceLevel: '$$$',
                            hours: '11 AM - 8 PM',
                            goodFor: ['Shoppers'],
                            rating: 4.4,
                            reviews: { positive: ['Beautiful stores', 'Elegant'], negative: ['Very expensive'] }
                        }
                    ],
                    evening: [
                        {
                            id: 'tokyo-station',
                            name: 'Tokyo Station Departure',
                            description: 'Last-minute bento and souvenirs in the historic station.',
                            duration: 'Flexible',
                            tags: ['Travel', 'Shopping'],
                            area: 'Marunouchi',
                            category: 'Transit',
                            priceLevel: '$$',
                            hours: 'Always open',
                            goodFor: ['Everyone'],
                            rating: 4.3,
                            reviews: { positive: ['Amazing bento', 'Historic building'], negative: ['Confusing layout'] }
                        }
                    ]
                }
            }
        ]
    },
    'default': {
        title: 'Your Dream Trip',
        days: [
            {
                name: 'Day 1 – City Discovery',
                description: 'Explore the highlights',
                slots: {
                    morning: [{ id: 'landmark1', name: 'Famous Landmark', description: 'Start at the city\'s most iconic spot.', duration: '2 hours', tags: ['Landmark', 'Photo'], area: 'Center', category: 'Attraction', priceLevel: '$$', hours: '9 AM - 6 PM', goodFor: ['Everyone'], rating: 4.5, reviews: { positive: ['Must-see'], negative: ['Crowded'] } }],
                    afternoon: [{ id: 'lunch1', name: 'Local Cuisine', description: 'Try the signature dishes.', duration: '1.5 hours', tags: ['Food', 'Local'], area: 'Downtown', category: 'Restaurant', priceLevel: '$$', hours: '11 AM - 3 PM', goodFor: ['Foodies'], rating: 4.4, reviews: { positive: ['Authentic'], negative: ['Busy'] } }],
                    evening: [{ id: 'dinner1', name: 'Sunset Dinner', description: 'End with views and great food.', duration: '2 hours', tags: ['Food', 'Views'], area: 'Waterfront', category: 'Dining', priceLevel: '$$$', hours: '5 PM - 11 PM', goodFor: ['Couples'], rating: 4.6, reviews: { positive: ['Amazing views'], negative: ['Pricey'] }, note: 'Book ahead' }]
                }
            }
        ]
    }
};

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeChips();
    initializeCounters();
    initializeBudgetChips();
    initializeNationality();
    initializeGenerateButton();
    initializeDetailPanel();
    initializeChat();
    initializeNewTripButton();
    initializeChatTabs();
    initializeInviteModal();
});

// ========================================
// Chip Selection
// ========================================

function initializeChips() {
    const multiSelectGroups = ['tripTypeChips', 'styleChips', 'cuisineChips', 'dietChips',
        'accomTypeChips', 'accomLocChips', 'mustHaveChips', 'avoidChips'];

    multiSelectGroups.forEach(groupId => {
        const group = document.getElementById(groupId);
        if (!group) return;
        group.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('active');
                updateStateFromChips(groupId);
            });
        });
    });

    const paceGroup = document.getElementById('paceChips');
    if (paceGroup) {
        paceGroup.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                paceGroup.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                state.pace = chip.dataset.value;
            });
        });
    }
}

function updateStateFromChips(groupId) {
    const group = document.getElementById(groupId);
    const activeValues = Array.from(group.querySelectorAll('.chip.active')).map(c => c.dataset.value);
    const stateMap = {
        'tripTypeChips': 'tripType', 'styleChips': 'travelStyle', 'cuisineChips': 'cuisine',
        'dietChips': 'diet', 'accomTypeChips': 'accomType', 'accomLocChips': 'accomLoc',
        'mustHaveChips': 'mustHave', 'avoidChips': 'avoid'
    };
    if (stateMap[groupId]) state[stateMap[groupId]] = activeValues;
}

// ========================================
// Counter Controls
// ========================================

function initializeCounters() {
    document.querySelectorAll('.counter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            const action = btn.dataset.action;
            const valueEl = document.getElementById(target);
            let value = parseInt(valueEl.textContent);
            value = action === 'increase' ? Math.min(value + 1, target === 'tripDays' ? 14 : 10) : Math.max(value - 1, 1);
            valueEl.textContent = value;
            state[target] = value;
        });
    });
}

// ========================================
// Budget Chips
// ========================================

function initializeBudgetChips() {
    const budgetGroup = document.getElementById('budgetChips');
    if (!budgetGroup) return;

    budgetGroup.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            budgetGroup.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.budget = parseInt(chip.dataset.value);
        });
    });
}

// ========================================
// Nationality
// ========================================

function initializeNationality() {
    const nationalitySelect = document.getElementById('nationality');
    if (!nationalitySelect) return;

    nationalitySelect.addEventListener('change', () => {
        state.nationality = nationalitySelect.value;
    });
}

// ========================================
// Invite Modal
// ========================================

function initializeInviteModal() {
    const inviteBtn = document.getElementById('inviteGroupBtn');
    const modal = document.getElementById('inviteModal');
    const closeBtn = document.getElementById('inviteModalClose');
    const copyBtn = document.getElementById('copyLinkBtn');

    inviteBtn?.addEventListener('click', () => {
        modal?.classList.add('visible');
    });

    closeBtn?.addEventListener('click', () => {
        modal?.classList.remove('visible');
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('visible');
    });

    copyBtn?.addEventListener('click', () => {
        const linkInput = document.getElementById('shareLink');
        linkInput?.select();
        document.execCommand('copy');
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 2000);
    });
}

// ========================================
// Generate Button
// ========================================

function initializeGenerateButton() {
    const generateBtn = document.getElementById('generateBtn');
    const destinationInput = document.getElementById('destination');
    const tripDescInput = document.getElementById('tripDescription');

    function checkRequirements() {
        const hasDestination = destinationInput.value.trim().length > 0;
        const hasDescription = tripDescInput.value.trim().length >= 5;
        generateBtn.disabled = !(hasDestination || hasDescription);
    }

    destinationInput.addEventListener('input', () => { state.destination = destinationInput.value; checkRequirements(); });
    tripDescInput.addEventListener('input', () => { state.tripDescription = tripDescInput.value; checkRequirements(); });
    generateBtn.addEventListener('click', generateItinerary);
}

// ========================================
// Generate Itinerary
// ========================================

function generateItinerary() {
    showLoading();

    const loadingTexts = ['Analyzing preferences...', 'Finding flights...', 'Checking events...', 'Optimizing schedule...', 'Calculating costs...'];
    let i = 0;
    const interval = setInterval(() => {
        i = (i + 1) % loadingTexts.length;
        document.getElementById('loadingSubtext').textContent = loadingTexts[i];
    }, 800);

    setTimeout(() => {
        clearInterval(interval);
        hideLoading();

        const dest = state.destination.toLowerCase();
        let template = dest.includes('kyoto') ? sampleItineraries.kyoto : dest.includes('tokyo') ? sampleItineraries.tokyo : sampleItineraries.default;
        state.currentItinerary = JSON.parse(JSON.stringify(template));

        if (state.destination) {
            const cityName = state.destination.split(',')[0].trim();
            state.currentItinerary.title = `Your ${cityName} Adventure`;
        }

        // Save to history
        state.tripHistory.unshift({
            id: Date.now(),
            destination: state.destination || 'Custom Trip',
            date: new Date().toLocaleDateString(),
            messages: [...state.chatHistory]
        });

        // Render all sections
        renderEvents();
        renderVisaAndWeather();
        renderFlights();
        renderHotels();
        renderTripMap();
        renderItinerary();
        updateCosts();
        showItinerarySection();
    }, 2500);
}

function showLoading() { document.getElementById('loadingOverlay').classList.add('visible'); }
function hideLoading() { document.getElementById('loadingOverlay').classList.remove('visible'); }

// ========================================
// Render Events
// ========================================

function renderEvents() {
    const dest = state.destination.toLowerCase();
    const events = dest.includes('kyoto') ? eventsData.kyoto : dest.includes('tokyo') ? eventsData.tokyo : eventsData.default;

    const container = document.getElementById('eventsList');
    if (!container) return;

    if (events.length === 0) {
        document.getElementById('eventsBanner').style.display = 'none';
        return;
    }

    document.getElementById('eventsBanner').style.display = 'block';
    container.innerHTML = events.map(event => `
        <div class="event-item">
            <div class="event-info">
                <div class="event-icon">${event.icon}</div>
                <div class="event-details">
                    <h4>${event.title}</h4>
                    <p>${event.description}</p>
                </div>
            </div>
            <button class="btn btn-primary event-add-btn" data-event="${event.id}">
                ✨ Include in Plan
            </button>
        </div>
    `).join('');

    container.querySelectorAll('.event-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.textContent = '✓ Added!';
            btn.disabled = true;
            btn.style.background = 'var(--color-success)';
        });
    });
}

// ========================================
// Render Visa and Weather
// ========================================

function renderVisaAndWeather() {
    const dest = state.destination.toLowerCase();
    const destKey = dest.includes('kyoto') ? 'kyoto' : dest.includes('tokyo') ? 'tokyo' : 'default';

    // Visa
    const nationalityData = visaData[state.nationality] || visaData.default;
    const visa = nationalityData[destKey] || nationalityData;
    state.costs.visa = visa.cost || 0;

    document.getElementById('visaCost').textContent = visa.cost > 0 ? `$${visa.cost}` : '$0';
    document.getElementById('visaNote').textContent = visa.note || 'Check visa requirements';

    // Weather
    const weather = weatherData[destKey] || weatherData.default;
    document.getElementById('weatherTemp').textContent = weather.temp;
    document.getElementById('weatherNote').textContent = weather.note;
}

// ========================================
// Render Flights
// ========================================

function renderFlights() {
    const dest = state.destination.toLowerCase();
    const flights = dest.includes('kyoto') ? flightData.kyoto : dest.includes('tokyo') ? flightData.tokyo : flightData.default;

    const container = document.getElementById('flightCards');
    if (!container) return;

    container.innerHTML = flights.map(flight => `
        <div class="flight-card ${state.selectedFlight === flight.id ? 'selected' : ''}" data-id="${flight.id}" data-price="${flight.price}">
            <div class="flight-header">
                <span class="flight-airline">✈️ ${flight.airline}</span>
                <span class="flight-price">$${flight.price}</span>
            </div>
            <div class="flight-details">
                <span>🕐 ${flight.duration}</span>
                <span>📍 ${flight.stops}</span>
            </div>
            <div class="flight-details">
                <span>Depart: ${flight.departure}</span>
                <span>Arrive: ${flight.arrival}</span>
            </div>
            <div class="flight-pros-cons">
                ${flight.pros.map(p => `<span class="flight-pro">✓ ${p}</span>`).join('')}
                ${flight.cons.map(c => `<span class="flight-con">✗ ${c}</span>`).join('')}
            </div>
        </div>
    `).join('');

    // Auto-select cheapest
    if (!state.selectedFlight) {
        const cheapest = flights.reduce((a, b) => a.price < b.price ? a : b);
        state.selectedFlight = cheapest.id;
        state.costs.flight = cheapest.price;
    }

    container.querySelectorAll('.flight-card').forEach(card => {
        if (card.dataset.id === state.selectedFlight) card.classList.add('selected');

        card.addEventListener('click', () => {
            container.querySelectorAll('.flight-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.selectedFlight = card.dataset.id;
            state.costs.flight = parseInt(card.dataset.price);
            updateCosts();
        });
    });
}

// ========================================
// Render Trip Map
// ========================================

function renderTripMap() {
    const mapSvg = document.getElementById('mapSvg');
    const legend = document.getElementById('mapLegend');
    if (!mapSvg || !legend) return;

    const days = state.currentItinerary?.days || [];
    const colors = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

    // Simple illustrated map
    let svgContent = `
        <defs>
            <pattern id="mapPattern" patternUnits="userSpaceOnUse" width="20" height="20">
                <circle cx="10" cy="10" r="1" fill="#ccc" opacity="0.3"/>
            </pattern>
        </defs>
        <rect width="400" height="250" fill="url(#mapPattern)"/>
        <path d="M50,200 Q100,150 150,180 T250,160 T350,190" stroke="#a8d5ba" stroke-width="3" fill="none" opacity="0.6"/>
        <ellipse cx="200" cy="125" rx="120" ry="80" fill="#e8f4f0" stroke="#c8e0d8" stroke-width="2"/>
        <text x="200" y="60" text-anchor="middle" font-size="12" fill="#666" font-weight="500">${state.destination || 'Your Destination'}</text>
    `;

    // Add location dots for each day
    days.forEach((day, i) => {
        const x = 80 + (i * 100);
        const y = 100 + (i % 2 ? 30 : 0);
        svgContent += `
            <circle cx="${x}" cy="${y}" r="14" fill="${colors[i % colors.length]}" opacity="0.8"/>
            <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10" fill="white" font-weight="600">${i + 1}</text>
        `;
    });

    mapSvg.innerHTML = svgContent;

    // Legend
    legend.innerHTML = days.map((day, i) => `
        <div class="legend-item">
            <div class="legend-dot day-${i + 1}"></div>
            <span>Day ${i + 1}</span>
        </div>
    `).join('');
}

// ========================================
// Update Costs
// ========================================

function updateCosts() {
    const { flight, hotel, activities, meals, transport, visa } = state.costs;
    const total = flight + hotel + activities + meals + transport + visa;

    document.getElementById('totalCost').textContent = `$${total.toLocaleString()}`;
    document.getElementById('itineraryBudget').textContent = `$${state.budget.toLocaleString()}`;

    // Update cost bars
    document.getElementById('flightCostDisplay').textContent = `$${flight}`;
    document.getElementById('hotelCostDisplay').textContent = `$${hotel}`;
    document.getElementById('activitiesCostDisplay').textContent = `$${activities}`;
    document.getElementById('mealsCostDisplay').textContent = `$${meals}`;
    document.getElementById('transportCostDisplay').textContent = `$${transport}`;

    // Update bar widths
    const barElements = {
        flight: document.querySelector('.flight-bar'),
        hotel: document.querySelector('.hotel-bar'),
        activities: document.querySelector('.activities-bar'),
        meals: document.querySelector('.meals-bar'),
        transport: document.querySelector('.transport-bar')
    };

    if (total > 0) {
        Object.entries(barElements).forEach(([key, el]) => {
            if (el) el.style.width = `${(state.costs[key] / total) * 100}%`;
        });
    }
}

// ========================================
// Render Hotels
// ========================================

function renderHotels() {
    const dest = state.destination.toLowerCase();
    const hotels = dest.includes('kyoto') ? hotelData.kyoto : dest.includes('tokyo') ? hotelData.tokyo : hotelData.default;

    const container = document.getElementById('hotelCards');
    container.innerHTML = hotels.map(hotel => {
        // Generate pros/cons from features
        const pros = hotel.features.slice(0, 2);
        const cons = hotel.rating < 4.5 ? ['Can be busy'] : [];
        const priceNum = parseInt(hotel.price.replace(/[^0-9]/g, ''));

        return `
        <div class="hotel-card ${state.selectedHotel === hotel.id ? 'selected' : ''}" data-id="${hotel.id}" data-price="${priceNum}">
          <div class="hotel-image">
            <img src="${hotel.image}" alt="${hotel.name}" loading="lazy">
          </div>
          <div class="hotel-name">${hotel.name}</div>
          <div class="hotel-info">${hotel.type} • ${hotel.location}</div>
          <div class="hotel-price">${hotel.price} <span style="color: #f5a623">★ ${hotel.rating}</span></div>
          <div class="hotel-pros-cons">
            ${pros.map(p => `<span class="hotel-pro">✓ ${p}</span>`).join('')}
            ${cons.map(c => `<span class="hotel-con">✗ ${c}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Auto-select first hotel
    if (!state.selectedHotel && hotels.length > 0) {
        state.selectedHotel = hotels[0].id;
        const priceNum = parseInt(hotels[0].price.replace(/[^0-9]/g, ''));
        state.costs.hotel = priceNum * state.tripDays;
    }

    container.querySelectorAll('.hotel-card').forEach(card => {
        if (card.dataset.id === state.selectedHotel) card.classList.add('selected');

        card.addEventListener('click', () => {
            container.querySelectorAll('.hotel-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.selectedHotel = card.dataset.id;
            const pricePerNight = parseInt(card.dataset.price);
            state.costs.hotel = pricePerNight * state.tripDays;
            updateCosts();
        });
    });
}

// ========================================
// Render Itinerary
// ========================================

function renderItinerary() {
    const itinerary = state.currentItinerary;
    if (!itinerary) return;

    document.getElementById('itineraryTitle').textContent = itinerary.title;
    document.getElementById('itineraryDays').textContent = `${itinerary.days.length} Days`;
    document.getElementById('itineraryTravelers').textContent = `${state.adults} Adults`;
    document.getElementById('itineraryBudget').textContent = `$${state.budget.toLocaleString()}`;

    const tabsContainer = document.getElementById('dayTabs');

    // Add Total Trip tab first, then individual days
    let tabsHtml = `<button class="day-tab total-tab ${state.selectedDay === -1 ? 'active' : ''}" data-day="-1">📊 Total Trip</button>`;
    tabsHtml += itinerary.days.map((day, i) =>
        `<button class="day-tab ${state.selectedDay === i ? 'active' : ''}" data-day="${i}">Day ${i + 1}</button>`
    ).join('');
    tabsContainer.innerHTML = tabsHtml;

    tabsContainer.querySelectorAll('.day-tab').forEach(tab => {
        tab.addEventListener('click', () => selectDay(parseInt(tab.dataset.day)));
    });

    const contentsContainer = document.getElementById('dayContents');
    contentsContainer.innerHTML = itinerary.days.map((day, i) => `
    <div class="day-content ${i === 0 ? 'active' : ''}" data-day="${i}">
      <div class="day-header">
        <h3 class="day-name">${day.name}</h3>
        <p class="day-description">${day.description}</p>
      </div>
      <div class="timeline">
        ${renderTimeSlot('Morning', day.slots.morning)}
        ${renderTimeSlot('Afternoon', day.slots.afternoon)}
        ${renderTimeSlot('Evening', day.slots.evening)}
      </div>
    </div>
  `).join('');

    contentsContainer.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('click', () => openActivityDetail(card.dataset.id));
    });
}

function renderTimeSlot(label, activities) {
    if (!activities?.length) return '';
    return `
    <div class="time-slot">
      <div class="time-label-side">${label}</div>
      <div class="activities-column">
        ${activities.map(a => renderActivityCard(a)).join('')}
      </div>
    </div>
  `;
}

function renderActivityCard(activity) {
    const imgUrl = activityImages[activity.id] || activityImages.default;
    return `
    <div class="activity-card" data-id="${activity.id}">
      <div class="activity-image">
        <img src="${imgUrl}" alt="${activity.name}" loading="lazy">
      </div>
      <div class="activity-body">
        <div class="activity-header">
          <h4 class="activity-name">${activity.name}</h4>
          <span class="activity-duration">${activity.duration}</span>
        </div>
        <p class="activity-description">${activity.description}</p>
        <div class="activity-tags">
          ${activity.tags.map(t => `<span class="activity-tag">${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function selectDay(dayIndex) {
    state.selectedDay = dayIndex;
    document.querySelectorAll('.day-tab').forEach(tab => tab.classList.toggle('active', parseInt(tab.dataset.day) === dayIndex));

    // -1 = Total Trip (show all days)
    if (dayIndex === -1) {
        document.querySelectorAll('.day-content').forEach(c => c.classList.add('active'));
    } else {
        document.querySelectorAll('.day-content').forEach(c => c.classList.toggle('active', parseInt(c.dataset.day) === dayIndex));
    }
}

function showItinerarySection() {
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('itinerarySection').classList.add('visible');
    document.getElementById('newTripBtn').style.display = 'flex';
    document.getElementById('chatToggle').classList.add('visible');
}

function showInputSection() {
    document.getElementById('heroSection').style.display = 'block';
    document.getElementById('inputSection').style.display = 'block';
    document.getElementById('itinerarySection').classList.remove('visible');
    document.getElementById('newTripBtn').style.display = 'none';
    document.getElementById('chatToggle').classList.remove('visible');
    document.getElementById('chatContainer').classList.remove('visible');
}

// ========================================
// Detail Panel
// ========================================

function initializeDetailPanel() {
    document.getElementById('detailClose').addEventListener('click', closeDetailPanel);
    document.getElementById('detailOverlay').addEventListener('click', closeDetailPanel);
    document.getElementById('keepActivityBtn').addEventListener('click', () => {
        closeDetailPanel();
        addMessage('assistant', `"${state.selectedActivity?.name}" confirmed!`);
    });
    document.getElementById('removeActivityBtn').addEventListener('click', () => {
        if (state.selectedActivity) { removeActivity(state.selectedActivity.id); closeDetailPanel(); }
    });
}

function openActivityDetail(activityId) {
    const activity = findActivityById(activityId);
    if (!activity) return;
    state.selectedActivity = activity;

    const imgUrl = activityImages[activity.id] || activityImages.default;
    const content = document.getElementById('detailContent');
    content.innerHTML = `
    <div class="detail-image"><img src="${imgUrl}" alt="${activity.name}"></div>
    <h3 class="detail-title">${activity.name}</h3>
    <p class="detail-category">${activity.category} • ${activity.area}</p>
    <p class="detail-summary">${activity.description}</p>
    <div class="detail-attributes">
      <div class="detail-attr"><div class="detail-attr-label">Duration</div><div class="detail-attr-value">${activity.duration}</div></div>
      <div class="detail-attr"><div class="detail-attr-label">Hours</div><div class="detail-attr-value">${activity.hours}</div></div>
      <div class="detail-attr"><div class="detail-attr-label">Price</div><div class="detail-attr-value">${activity.priceLevel}</div></div>
      <div class="detail-attr"><div class="detail-attr-label">Best For</div><div class="detail-attr-value">${activity.goodFor?.join(', ') || 'Everyone'}</div></div>
    </div>
    <div class="detail-map">📍 Map coming soon</div>
    ${activity.rating ? `
    <div class="detail-reviews">
      <h4>Reviews</h4>
      <div class="review-rating">
        <span class="rating-score">${activity.rating}</span>
        <span class="rating-stars">${'★'.repeat(Math.round(activity.rating))}</span>
      </div>
      <ul class="review-bullets">
        ${activity.reviews?.positive?.map(r => `<li><strong>👍</strong> ${r}</li>`).join('') || ''}
        ${activity.reviews?.negative?.map(r => `<li><strong>👎</strong> ${r}</li>`).join('') || ''}
      </ul>
    </div>` : ''}
  `;

    document.getElementById('detailPanel').classList.add('open');
    document.getElementById('detailOverlay').classList.add('visible');
}

function closeDetailPanel() {
    document.getElementById('detailPanel').classList.remove('open');
    document.getElementById('detailOverlay').classList.remove('visible');
}

function findActivityById(id) {
    if (!state.currentItinerary) return null;
    for (const day of state.currentItinerary.days) {
        for (const slot of ['morning', 'afternoon', 'evening']) {
            const a = day.slots[slot]?.find(x => x.id === id);
            if (a) return a;
        }
    }
    return null;
}

function removeActivity(id) {
    if (!state.currentItinerary) return;
    for (const day of state.currentItinerary.days) {
        for (const slot of ['morning', 'afternoon', 'evening']) {
            const idx = day.slots[slot]?.findIndex(x => x.id === id);
            if (idx !== -1) {
                const removed = day.slots[slot].splice(idx, 1)[0];
                renderItinerary();
                addMessage('assistant', `Removed "${removed.name}". Want a replacement?`);
                return;
            }
        }
    }
}

// ========================================
// Chat with History
// ========================================

function initializeChat() {
    const toggle = document.getElementById('chatToggle');
    const container = document.getElementById('chatContainer');
    const minimize = document.getElementById('chatMinimize');
    const input = document.getElementById('chatInput');
    const send = document.getElementById('chatSend');

    toggle.addEventListener('click', () => { container.classList.add('visible'); toggle.classList.remove('visible'); input.focus(); });
    minimize.addEventListener('click', () => { container.classList.remove('visible'); toggle.classList.add('visible'); });
    send.addEventListener('click', sendMessage);
    input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => { input.value = chip.textContent; sendMessage(); });
    });
}

function initializeChatTabs() {
    document.querySelectorAll('.chat-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.currentChatTab = tab.dataset.tab;

            if (tab.dataset.tab === 'history') {
                document.getElementById('chatMessages').classList.add('hidden');
                document.getElementById('historyList').classList.remove('hidden');
                renderChatHistory();
            } else {
                document.getElementById('chatMessages').classList.remove('hidden');
                document.getElementById('historyList').classList.add('hidden');
            }
        });
    });
}

function renderChatHistory() {
    const container = document.getElementById('historyList');
    if (state.tripHistory.length === 0) {
        container.innerHTML = '<div class="history-item"><div class="history-item-title">No past trips yet</div></div>';
        return;
    }

    container.innerHTML = state.tripHistory.map(trip => `
    <div class="history-item" data-id="${trip.id}">
      <div class="history-item-title">${trip.destination}</div>
      <div class="history-item-date">${trip.date} • ${trip.messages.length} messages</div>
    </div>
  `).join('');

    container.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const trip = state.tripHistory.find(t => t.id === parseInt(item.dataset.id));
            if (trip) {
                // Restore messages from this trip
                document.getElementById('chatMessages').innerHTML = trip.messages.map(m =>
                    `<div class="chat-message ${m.role}"><div class="message-bubble">${m.content}</div></div>`
                ).join('') || '<div class="chat-message assistant"><div class="message-bubble">No messages in this trip.</div></div>';

                // Switch to chat tab
                document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
                document.querySelector('.chat-tab[data-tab="chat"]').classList.add('active');
                document.getElementById('chatMessages').classList.remove('hidden');
                document.getElementById('historyList').classList.add('hidden');
            }
        });
    });
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    addMessage('user', message);
    input.value = '';
    setTimeout(() => processRefinement(message), 500);
}

function addMessage(role, content) {
    const container = document.getElementById('chatMessages');
    const el = document.createElement('div');
    el.className = `chat-message ${role}`;
    el.innerHTML = `<div class="message-bubble">${content}</div>`;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    state.chatHistory.push({ role, content });

    // Update current trip history
    if (state.tripHistory.length > 0) {
        state.tripHistory[0].messages = [...state.chatHistory];
    }
}

function processRefinement(message) {
    const msg = message.toLowerCase();
    let response = '';

    if (msg.includes('less busy') || msg.includes('lighter') || msg.includes('slower')) {
        response = "Done! Made the itinerary more relaxed. 🧘";
        markUpdated(['gion', 'harajuku', 'kinkakuji']);
    } else if (msg.includes('more food') || msg.includes('restaurant') || msg.includes('eating')) {
        response = "Added more food spots! 🍽️";
        markUpdated(['lunch-gion', 'nishiki', 'ramen-lunch']);
    } else if (msg.includes('scenic') || msg.includes('photo')) {
        response = "Highlighted more scenic spots! 📸";
        markUpdated(['bamboo', 'fushimi', 'shibuya']);
    } else if (msg.includes('budget') || msg.includes('cheaper')) {
        response = "Optimized for budget! 💰";
        markUpdated(['pontocho', 'skytree']);
    } else {
        response = `Updated based on "${message}"! ✨`;
    }
    addMessage('assistant', response);
}

function markUpdated(ids) {
    document.querySelectorAll('.activity-card').forEach(card => {
        if (ids.includes(card.dataset.id)) {
            card.classList.add('updated');
            setTimeout(() => card.classList.remove('updated'), 4000);
        }
    });
}

// ========================================
// New Trip
// ========================================

function initializeNewTripButton() {
    document.getElementById('newTripBtn').addEventListener('click', () => {
        if (confirm('Start a new trip?')) { resetState(); showInputSection(); }
    });
    document.getElementById('editPrefsBtn').addEventListener('click', showInputSection);
}

function resetState() {
    state.currentItinerary = null;
    state.selectedDay = 0;
    state.selectedActivity = null;
    state.selectedHotel = null;
    state.chatHistory = [];
    document.getElementById('chatMessages').innerHTML = '<div class="chat-message assistant"><div class="message-bubble">Hi! Try "Make Day 2 lighter" or "Add more food spots."</div></div>';
}

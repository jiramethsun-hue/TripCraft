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
    startDate: '', // New: for seasonal weather/pricing
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

    // Flight Preferences
    flightTime: [],           // early-morning, morning, afternoon, evening, late-night, redeye
    flightSeat: 'standard',   // standard, extra-legroom, premium, business
    flightLuggage: '1-checked', // carry-on, 1-checked, 2-checked
    flightAmenities: [],      // meals, entertainment, wifi, power
    flightPriority: 'cheapest', // cheapest, shortest, timing, overall

    // Hotel Preferences
    hotelRoomSize: 'standard', // compact, standard, spacious, suite
    hotelBedType: [],          // single, twin, double, queen, king
    hotelLocation: [],         // metro, restaurants, center, airport, train
    hotelAmenities: [],        // luggage, hairdryer, breakfast, bathtub, gym, pool, workspace
    hotelReviewFocus: [],      // cleanliness, service, value, quiet
    hotelStyle: [],            // business, boutique, traditional, apartment

    currentItinerary: null,
    selectedDay: -1, // -1 = Total Trip
    selectedActivity: null,
    selectedHotel: null,
    selectedFlight: null,

    // AI-generated data
    aiHotels: null,
    aiFlights: null,
    aiEvents: null,
    aiWeather: null,
    aiVisa: null, // New: visa info from AI

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
            priceNum: 450,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
            features: ['Traditional garden', 'Onsen spa', 'Central location'],
            // New preference attributes
            roomSize: 'spacious',
            bedTypes: ['king', 'twin'],
            locationTags: ['center', 'metro'],
            amenities: ['breakfast', 'bathtub', 'hairdryer', 'luggage', 'gym'],
            reviewHighlights: ['cleanliness', 'service'],
            style: 'boutique',
            guestVoice: {
                positive: ['Impeccable service and stunning garden views', 'The onsen was absolutely divine'],
                concerns: ['Premium pricing but worth every yen'],
                topReview: '⭐ "Best hotel experience in Japan" - verified guest'
            }
        },
        {
            id: 'hotel2',
            name: 'Hotel Kanra Kyoto',
            type: 'Boutique Hotel',
            location: 'Gojo',
            price: '$180/night',
            priceNum: 180,
            rating: 4.6,
            image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop',
            features: ['Modern Japanese', 'Near station', 'Great value'],
            roomSize: 'standard',
            bedTypes: ['queen', 'twin'],
            locationTags: ['metro', 'train', 'restaurants'],
            amenities: ['breakfast', 'hairdryer', 'workspace'],
            reviewHighlights: ['value', 'cleanliness'],
            style: 'boutique',
            guestVoice: {
                positive: ['Perfect blend of modern and traditional', 'Walking distance to everything'],
                concerns: ['Room slightly compact but well-designed'],
                topReview: '⭐ "Great value for Kyoto!" - verified guest'
            }
        },
        {
            id: 'hotel3',
            name: 'Piece Hostel Kyoto',
            type: 'Design Hostel',
            location: 'Kyoto Station',
            price: '$45/night',
            priceNum: 45,
            rating: 4.4,
            image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
            features: ['Social atmosphere', 'Café bar', 'Budget friendly'],
            roomSize: 'compact',
            bedTypes: ['single', 'double'],
            locationTags: ['train', 'metro', 'restaurants'],
            amenities: ['luggage', 'workspace'],
            reviewHighlights: ['value', 'service'],
            style: 'business',
            guestVoice: {
                positive: ['Amazing cafe and social vibe', 'Super clean and modern'],
                concerns: ['Can be noisy on weekends'],
                topReview: '⭐ "Best hostel I\'ve ever stayed in!" - verified guest'
            }
        }
    ],
    'tokyo': [
        {
            id: 'hotel1',
            name: 'Aman Tokyo',
            type: 'Luxury Hotel',
            location: 'Otemachi',
            price: '$800/night',
            priceNum: 800,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
            features: ['Sky lobby', 'Panoramic views', 'Michelin restaurant'],
            roomSize: 'suite',
            bedTypes: ['king'],
            locationTags: ['center', 'metro'],
            amenities: ['breakfast', 'bathtub', 'gym', 'pool', 'hairdryer', 'luggage', 'workspace'],
            reviewHighlights: ['cleanliness', 'service', 'quiet'],
            style: 'boutique',
            guestVoice: {
                positive: ['Unparalleled luxury and service', 'The views are breathtaking'],
                concerns: ['Very expensive but exceptional quality'],
                topReview: '⭐ "Pure perfection in every detail" - verified guest'
            }
        },
        {
            id: 'hotel2',
            name: 'Hotel Gracery Shinjuku',
            type: 'Mid-range Hotel',
            location: 'Shinjuku',
            price: '$120/night',
            priceNum: 120,
            rating: 4.5,
            image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
            features: ['Godzilla head!', 'Great location', 'Modern rooms'],
            roomSize: 'compact',
            bedTypes: ['double', 'twin'],
            locationTags: ['metro', 'restaurants', 'center'],
            amenities: ['hairdryer', 'luggage'],
            reviewHighlights: ['value', 'cleanliness'],
            style: 'business',
            guestVoice: {
                positive: ['Godzilla terrace is a must-see!', 'Perfect Shinjuku location'],
                concerns: ['Rooms are typical Tokyo size'],
                topReview: '⭐ "Fun and convenient!" - verified guest'
            }
        },
        {
            id: 'hotel3',
            name: 'Nui. Hostel & Bar',
            type: 'Design Hostel',
            location: 'Kuramae',
            price: '$35/night',
            priceNum: 35,
            rating: 4.3,
            image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
            features: ['Trendy area', 'Bar lounge', 'Art vibes'],
            roomSize: 'compact',
            bedTypes: ['single'],
            locationTags: ['metro', 'restaurants'],
            amenities: ['luggage', 'workspace'],
            reviewHighlights: ['value', 'service'],
            style: 'boutique',
            guestVoice: {
                positive: ['Incredible atmosphere and design', 'Staff are super helpful'],
                concerns: ['Kuramae is quieter but charming'],
                topReview: '⭐ "Coolest hostel in Tokyo!" - verified guest'
            }
        }
    ],
    'default': [
        {
            id: 'hotel1',
            name: 'Premium City Hotel',
            type: 'Luxury',
            location: 'City Center',
            price: '$300/night',
            priceNum: 300,
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
            features: ['Central', 'Spa', 'Restaurant'],
            roomSize: 'spacious',
            bedTypes: ['king', 'queen'],
            locationTags: ['center', 'metro', 'restaurants'],
            amenities: ['breakfast', 'bathtub', 'gym', 'hairdryer'],
            reviewHighlights: ['service', 'cleanliness'],
            style: 'boutique',
            guestVoice: {
                positive: ['Excellent central location', 'Beautiful rooms'],
                concerns: ['Can be busy during peak times'],
                topReview: '⭐ "Perfect for city exploration" - verified guest'
            }
        },
        {
            id: 'hotel2',
            name: 'Comfort Inn Central',
            type: 'Mid-range',
            location: 'Downtown',
            price: '$100/night',
            priceNum: 100,
            rating: 4.4,
            image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
            features: ['Good value', 'Near transit', 'Breakfast included'],
            roomSize: 'standard',
            bedTypes: ['queen', 'twin'],
            locationTags: ['metro', 'train'],
            amenities: ['breakfast', 'hairdryer', 'luggage'],
            reviewHighlights: ['value', 'cleanliness'],
            style: 'business',
            guestVoice: {
                positive: ['Great breakfast spread', 'Clean and comfortable'],
                concerns: ['Basic decor but functional'],
                topReview: '⭐ "Reliable and affordable" - verified guest'
            }
        },
        {
            id: 'hotel3',
            name: 'Budget Stay Hostel',
            type: 'Budget',
            location: 'Near Station',
            price: '$45/night',
            priceNum: 45,
            rating: 4.1,
            image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
            features: ['Great value', 'Social atmosphere', 'Near transport'],
            roomSize: 'compact',
            bedTypes: ['single', 'bunk'],
            locationTags: ['train', 'metro'],
            amenities: ['luggage', 'wifi'],
            reviewHighlights: ['value', 'location'],
            style: 'hostel',
            guestVoice: {
                positive: ['Amazing value for money', 'Met great people'],
                concerns: ['Shared facilities'],
                topReview: '⭐ "Best budget option!" - verified guest'
            }
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
            cons: ['Higher price'],
            // New preference attributes
            departureSlot: 'morning',
            seatType: 'standard',
            luggage: '2-checked',
            amenities: ['meals', 'entertainment', 'power'],
            matchScore: 0 // Will be calculated dynamically
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
            cons: ['1 layover', 'Longer travel time'],
            departureSlot: 'morning',
            seatType: 'extra-legroom',
            luggage: '1-checked',
            amenities: ['meals', 'entertainment', 'wifi', 'power'],
            matchScore: 0
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
            cons: ['Overnight flight', 'Long layover'],
            departureSlot: 'late-night',
            seatType: 'standard',
            luggage: '1-checked',
            amenities: ['meals', 'entertainment', 'wifi', 'power'],
            matchScore: 0
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
            cons: ['Premium pricing'],
            departureSlot: 'morning',
            seatType: 'standard',
            luggage: '2-checked',
            amenities: ['meals', 'entertainment', 'wifi', 'power'],
            matchScore: 0
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
            cons: ['1 layover'],
            departureSlot: 'afternoon',
            seatType: 'standard',
            luggage: '1-checked',
            amenities: ['meals', 'entertainment'],
            matchScore: 0
        },
        {
            id: 'flight3',
            airline: 'EVA Air',
            price: 520,
            duration: '19h 15m',
            stops: '1 stop (Taipei)',
            departure: '6:00 AM',
            arrival: '1:15 AM +1',
            pros: ['Budget-friendly', 'Hello Kitty jet!'],
            cons: ['Early departure', 'Long layover'],
            departureSlot: 'early-morning',
            seatType: 'standard',
            luggage: '1-checked',
            amenities: ['meals', 'entertainment'],
            matchScore: 0
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
            cons: ['Basic amenities'],
            departureSlot: 'morning',
            seatType: 'standard',
            luggage: '1-checked',
            amenities: ['meals'],
            matchScore: 0
        },
        {
            id: 'flight2',
            airline: 'Budget Airline',
            price: 450,
            duration: '15h',
            stops: '1 stop',
            departure: '6:00 AM',
            arrival: '9:00 PM',
            pros: ['Best price'],
            cons: ['Layover', 'Early departure'],
            departureSlot: 'early-morning',
            seatType: 'standard',
            luggage: '1-checked',
            amenities: ['meals'],
            matchScore: 0
        },
        {
            id: 'flight3',
            airline: 'Premium Airlines',
            price: 950,
            duration: '10h',
            stops: 'Direct',
            departure: '2:00 PM',
            arrival: '12:00 AM +1',
            pros: ['Fastest', 'Premium service', 'Great meals'],
            cons: ['Higher price'],
            departureSlot: 'afternoon',
            seatType: 'extra-legroom',
            luggage: '2-checked',
            amenities: ['meals', 'entertainment', 'wifi', 'power'],
            matchScore: 0
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

// Activity type to image mapping for AI-generated activities
const activityTypeImages = {
    'sightseeing': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=200&fit=crop',
    'food': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop',
    'culture': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=200&fit=crop',
    'shopping': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop',
    'nature': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=200&fit=crop',
    'nightlife': 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=200&fit=crop',
    'museum': 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=200&fit=crop',
    'temple': 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=200&fit=crop',
    'beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop',
    'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop'
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
    initializeStartDate(); // New: for date picker
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
    // Multi-select groups
    const multiSelectGroups = ['tripTypeChips', 'styleChips', 'cuisineChips', 'dietChips',
        'accomTypeChips', 'accomLocChips', 'mustHaveChips', 'avoidChips',
        // New flight preferences
        'flightTimeChips', 'flightAmenitiesChips',
        // New hotel preferences
        'hotelBedTypeChips', 'hotelLocationChips', 'hotelAmenitiesChips',
        'hotelReviewFocusChips', 'hotelStyleChips'];

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

    // Single-select groups (only one can be active at a time)
    const singleSelectGroups = [
        { id: 'paceChips', stateKey: 'pace' },
        { id: 'flightSeatChips', stateKey: 'flightSeat' },
        { id: 'flightLuggageChips', stateKey: 'flightLuggage' },
        { id: 'flightPriorityChips', stateKey: 'flightPriority' },
        { id: 'hotelRoomSizeChips', stateKey: 'hotelRoomSize' }
    ];

    singleSelectGroups.forEach(({ id, stateKey }) => {
        const group = document.getElementById(id);
        if (!group) return;
        group.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                state[stateKey] = chip.dataset.value;
            });
        });
    });
}

function updateStateFromChips(groupId) {
    const group = document.getElementById(groupId);
    const activeValues = Array.from(group.querySelectorAll('.chip.active')).map(c => c.dataset.value);
    const stateMap = {
        'tripTypeChips': 'tripType',
        'styleChips': 'travelStyle',
        'cuisineChips': 'cuisine',
        'dietChips': 'diet',
        'accomTypeChips': 'accomType',
        'accomLocChips': 'accomLoc',
        'mustHaveChips': 'mustHave',
        'avoidChips': 'avoid',
        // New flight preferences
        'flightTimeChips': 'flightTime',
        'flightAmenitiesChips': 'flightAmenities',
        // New hotel preferences
        'hotelBedTypeChips': 'hotelBedType',
        'hotelLocationChips': 'hotelLocation',
        'hotelAmenitiesChips': 'hotelAmenities',
        'hotelReviewFocusChips': 'hotelReviewFocus',
        'hotelStyleChips': 'hotelStyle'
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
// Start Date
// ========================================

function initializeStartDate() {
    const dateInput = document.getElementById('tripStartDate');
    if (!dateInput) return;

    // Set default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
    state.startDate = dateInput.value;

    dateInput.addEventListener('change', () => {
        state.startDate = dateInput.value;
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

async function generateItinerary() {
    showLoading();

    const loadingTexts = ['🤖 AI analyzing preferences...', '✈️ Finding best flights...', '🎉 Checking local events...', '🗓️ Crafting your schedule...', '💰 Calculating costs...'];
    let i = 0;
    const interval = setInterval(() => {
        i = (i + 1) % loadingTexts.length;
        document.getElementById('loadingSubtext').textContent = loadingTexts[i];
    }, 1200);

    try {
        // Prepare preferences for AI
        const preferences = {
            destination: state.destination || 'Japan',
            days: state.tripDays,
            travelers: state.adults,
            startDate: state.startDate, // New: for seasonal weather/pricing
            nationality: state.nationality, // New: for visa info
            tripType: state.tripType.join(', ') || 'general',
            budget: state.budget,
            styles: state.travelStyle,
            cuisines: state.cuisine,
            dietary: state.diet,
            accomType: state.accomType.join(', ') || 'hotel',
            accomLocation: state.accomLoc.join(', ') || 'central',
            mustHave: state.mustHave,
            avoid: state.avoid,
            pace: state.pace,
            description: state.tripDescription
        };

        // Call Gemini AI to generate itinerary
        const aiItinerary = await GeminiService.generateItinerary(preferences);

        // Convert AI response to our format
        state.currentItinerary = convertAIItineraryToFormat(aiItinerary);

        // Reset selections for new AI data
        state.selectedFlight = null;
        state.selectedHotel = null;

        // Store AI-generated data for other sections
        state.aiHotels = aiItinerary.hotels || null;
        state.aiFlights = aiItinerary.flights || null;
        state.aiEvents = aiItinerary.specialEvents || null;
        state.aiWeather = aiItinerary.weatherInfo || null;
        state.aiVisa = aiItinerary.visaInfo || null; // New: visa info from AI

        // Update costs from AI
        if (aiItinerary.estimatedCosts) {
            state.costs = {
                flight: aiItinerary.estimatedCosts.flights || 650,
                hotel: aiItinerary.estimatedCosts.hotels || 400,
                activities: aiItinerary.estimatedCosts.activities || 150,
                meals: aiItinerary.estimatedCosts.meals || 200,
                transport: aiItinerary.estimatedCosts.transport || 100,
                visa: aiItinerary.visaInfo?.cost || 0
            };
        }

        clearInterval(interval);
        hideLoading();

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

        // Load real photos from Unsplash (after DOM is rendered)
        loadRealPhotos();

    } catch (error) {
        console.error('AI Generation failed, using fallback:', error);
        clearInterval(interval);

        // Fallback to sample itineraries
        const dest = state.destination.toLowerCase();
        let template = dest.includes('kyoto') ? sampleItineraries.kyoto : dest.includes('tokyo') ? sampleItineraries.tokyo : sampleItineraries.default;
        state.currentItinerary = JSON.parse(JSON.stringify(template));

        // Dynamically expand to requested number of days
        const requestedDays = state.tripDays || 3;
        const baseDay = state.currentItinerary.days[0];
        while (state.currentItinerary.days.length < requestedDays) {
            const newDay = JSON.parse(JSON.stringify(baseDay));
            const dayNum = state.currentItinerary.days.length + 1;
            newDay.name = `Day ${dayNum} – Exploration`;
            newDay.description = `Continue your ${state.destination || 'adventure'} experience`;
            state.currentItinerary.days.push(newDay);
        }

        if (state.destination) {
            const cityName = state.destination.split(',')[0].trim();
            state.currentItinerary.title = `Your ${cityName} Adventure`;
        }

        hideLoading();

        state.tripHistory.unshift({
            id: Date.now(),
            destination: state.destination || 'Custom Trip',
            date: new Date().toLocaleDateString(),
            messages: [...state.chatHistory]
        });

        renderEvents();
        renderVisaAndWeather();
        renderFlights();
        renderHotels();
        renderTripMap();
        renderItinerary();
        updateCosts();
        showItinerarySection();

        // Load real photos from Unsplash (for fallback too)
        loadRealPhotos();
    }
}

/**
 * Load real photos from Unsplash for activities and hotels
 * This runs after DOM is rendered and progressively updates images
 */
async function loadRealPhotos() {
    // Check if UnsplashService is available and configured
    if (typeof UnsplashService === 'undefined') {
        console.log('UnsplashService not loaded, skipping real photos');
        return;
    }

    if (!CONFIG.UNSPLASH_ACCESS_KEY || CONFIG.UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_KEY_HERE') {
        console.log('Unsplash API key not configured, using stock photos');
        return;
    }

    const destination = state.destination || '';

    // Collect all activities from the itinerary
    const allActivities = [];
    if (state.currentItinerary?.days) {
        state.currentItinerary.days.forEach(day => {
            ['morning', 'afternoon', 'evening'].forEach(slot => {
                const activities = day.slots?.[slot] || [];
                allActivities.push(...activities);
            });
        });
    }

    // Load activity photos
    if (allActivities.length > 0) {
        console.log(`📸 Loading ${allActivities.length} activity photos from Unsplash...`);
        await UnsplashService.updateActivityImages(allActivities, destination);
    }

    // Load hotel photos
    const hotels = state.aiHotels || [];
    if (hotels.length > 0) {
        console.log(`🏨 Loading ${hotels.length} hotel photos from Unsplash...`);
        await UnsplashService.updateHotelImages(hotels, destination);
    }

    console.log('✅ Real photos loaded');
}

// Convert AI-generated itinerary to our app format
function convertAIItineraryToFormat(aiItinerary) {
    const days = aiItinerary.days.map((day, index) => {
        const activities = day.activities || [];

        // Helper to parse time strings like "9AM", "2PM", "9:00", "14:00"
        const parseHour = (timeStr) => {
            if (!timeStr) return -1;
            const str = timeStr.toUpperCase().trim();

            // Handle "9AM", "2PM" format
            const ampmMatch = str.match(/^(\d{1,2})\s*(AM|PM)?/);
            if (ampmMatch) {
                let hour = parseInt(ampmMatch[1]);
                const isPM = ampmMatch[2] === 'PM';
                if (isPM && hour !== 12) hour += 12;
                if (!isPM && ampmMatch[2] === 'AM' && hour === 12) hour = 0;
                return hour;
            }

            // Handle "9:00", "14:00" format  
            const colonMatch = str.match(/^(\d{1,2}):/);
            if (colonMatch) {
                return parseInt(colonMatch[1]);
            }

            return -1;
        };

        // Assign activities to slots based on their index if time parsing fails
        // This ensures no duplication
        const morning = [];
        const afternoon = [];
        const evening = [];

        activities.forEach((a, idx) => {
            const hour = parseHour(a.time);

            if (hour >= 0 && hour < 12) {
                morning.push(a);
            } else if (hour >= 12 && hour < 17) {
                afternoon.push(a);
            } else if (hour >= 17) {
                evening.push(a);
            } else {
                // If no valid time, distribute based on activity index
                if (idx === 0) {
                    morning.push(a);
                } else if (idx === activities.length - 1 && activities.length > 2) {
                    evening.push(a);
                } else {
                    afternoon.push(a);
                }
            }
        });

        // Convert to our activity format with travel times and dynamic images
        const convertActivity = (a) => ({
            id: a.id || `activity-${Math.random().toString(36).substr(2, 9)}`,
            name: a.title,
            description: a.description,
            duration: a.duration,
            tags: [a.type, 'AI Generated'].filter(Boolean),
            area: a.location || 'City Center',
            category: a.type || 'Activity',
            priceLevel: a.cost > 50 ? '$$$' : a.cost > 20 ? '$$' : '$',
            hours: 'Varies',
            goodFor: ['Everyone'],
            rating: 4.5,
            reviews: { positive: [a.tips || 'Great experience'], negative: [] },
            note: a.tips,
            travelTime: a.travelTime || '', // Travel time from previous activity
            coordinates: a.coordinates || null, // GPS coordinates for map
            // Use activity type to get reliable curated photos
            imageUrl: activityTypeImages[a.type?.toLowerCase()] || activityTypeImages.default
        });

        return {
            name: day.name,
            description: day.description,
            slots: {
                morning: morning.map(convertActivity),
                afternoon: afternoon.map(convertActivity),
                evening: evening.map(convertActivity)
            }
        };
    });

    return {
        title: aiItinerary.title || `Your ${state.destination} Adventure`,
        summary: aiItinerary.summary,
        days: days
    };
}

function showLoading() { document.getElementById('loadingOverlay').classList.add('visible'); }
function hideLoading() { document.getElementById('loadingOverlay').classList.remove('visible'); }

// ========================================
// Render Events
// ========================================

function renderEvents() {
    // Use AI-generated events if available, otherwise fall back to static data
    let events;
    if (state.aiEvents && state.aiEvents.length > 0) {
        events = state.aiEvents;
    } else {
        const dest = state.destination.toLowerCase();
        events = dest.includes('kyoto') ? eventsData.kyoto : dest.includes('tokyo') ? eventsData.tokyo : eventsData.default;
    }

    const container = document.getElementById('eventsList');
    if (!container) return;

    if (!events || events.length === 0) {
        document.getElementById('eventsBanner').style.display = 'none';
        return;
    }

    document.getElementById('eventsBanner').style.display = 'block';
    container.innerHTML = events.map(event => `
        <div class="event-item">
            <div class="event-info">
                <div class="event-icon">${event.icon || '🎉'}</div>
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

    // Visa - use AI-generated visa info if available, otherwise static data
    let visa;
    if (state.aiVisa) {
        visa = {
            cost: state.aiVisa.cost || 0,
            note: state.aiVisa.note || 'Check visa requirements'
        };
    } else {
        const nationalityData = visaData[state.nationality] || visaData.default;
        visa = nationalityData[destKey] || nationalityData;
    }
    state.costs.visa = visa.cost || 0;

    document.getElementById('visaCost').textContent = visa.cost > 0 ? `$${visa.cost}` : '$0';
    document.getElementById('visaNote').textContent = visa.note || 'Check visa requirements';

    // Weather - use AI-generated weather if available
    let weather;
    if (state.aiWeather) {
        weather = state.aiWeather;
    } else {
        weather = weatherData[destKey] || weatherData.default;
    }
    document.getElementById('weatherTemp').textContent = weather.temp;
    document.getElementById('weatherNote').textContent = weather.note;
}

// ========================================
// Render Flights
// ========================================

function renderFlights() {
    // Use AI-generated flights if available, otherwise fall back to static data
    let flights;
    if (state.aiFlights && state.aiFlights.length > 0) {
        flights = state.aiFlights;
    } else {
        const dest = state.destination.toLowerCase();
        flights = dest.includes('kyoto') ? flightData.kyoto : dest.includes('tokyo') ? flightData.tokyo : flightData.default;
    }

    // Calculate preference match scores
    flights = flights.map(flight => {
        let matchScore = 0;
        let matchReasons = [];

        // Check departure time preference
        if (state.flightTime.length > 0 && flight.departureSlot) {
            if (state.flightTime.includes(flight.departureSlot)) {
                matchScore += 2;
                matchReasons.push('⏰ Preferred time');
            }
        }

        // Check amenities match
        if (state.flightAmenities.length > 0 && flight.amenities) {
            const matchedAmenities = state.flightAmenities.filter(a => flight.amenities.includes(a));
            matchScore += matchedAmenities.length;
            if (matchedAmenities.length > 0) {
                matchReasons.push(`✓ ${matchedAmenities.length} amenities`);
            }
        }

        // Check luggage match
        if (flight.luggage === state.flightLuggage) {
            matchScore += 1;
            matchReasons.push('🧳 Luggage OK');
        }

        // Check seat match
        if (flight.seatType === state.flightSeat) {
            matchScore += 1;
        }

        // Priority scoring
        if (state.flightPriority === 'cheapest') {
            // Lower price = higher score (normalize)
            matchScore += Math.max(0, (1000 - flight.price) / 200);
        } else if (state.flightPriority === 'shortest') {
            // Shorter duration = higher score
            const hours = parseFloat(flight.duration) || 12;
            matchScore += Math.max(0, (20 - hours) / 2);
        }

        return { ...flight, matchScore, matchReasons };
    });

    // Sort by priority preference
    if (state.flightPriority === 'cheapest') {
        flights.sort((a, b) => a.price - b.price);
    } else if (state.flightPriority === 'shortest') {
        flights.sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration));
    } else {
        flights.sort((a, b) => b.matchScore - a.matchScore);
    }

    const container = document.getElementById('flightCards');
    if (!container) return;

    container.innerHTML = flights.map((flight, idx) => {
        const isBestMatch = idx === 0 && flight.matchScore > 0;
        const matchBadge = isBestMatch ? '<span class="pref-badge best">🎯 Best Match</span>' :
            (flight.matchReasons?.length > 0 ? '<span class="pref-badge">✓ Matches preferences</span>' : '');

        return `
        <div class="flight-card ${state.selectedFlight === flight.id ? 'selected' : ''} ${isBestMatch ? 'best-match' : ''}" data-id="${flight.id}" data-price="${flight.price}">
            <div class="flight-header">
                <span class="flight-airline">✈️ ${flight.airline}</span>
                <span class="flight-price">$${flight.price}</span>
            </div>
            ${matchBadge}
            <div class="flight-details">
                <span>🕐 ${flight.duration}</span>
                <span>📍 ${flight.stops}</span>
            </div>
            <div class="flight-details">
                <span>Depart: ${flight.departure}</span>
                <span>Arrive: ${flight.arrival}</span>
            </div>
            ${flight.matchReasons?.length > 0 ? `
            <div class="flight-match-reasons">
                ${flight.matchReasons.map(r => `<span class="match-tag">${r}</span>`).join('')}
            </div>
            ` : ''}
            <div class="flight-pros-cons">
                ${(flight.pros || []).map(p => `<span class="flight-pro">✓ ${p}</span>`).join('')}
                ${(flight.cons || []).map(c => `<span class="flight-con">✗ ${c}</span>`).join('')}
            </div>
        </div>
    `}).join('');

    // Auto-select best match or cheapest
    if (!state.selectedFlight && flights.length > 0) {
        const best = flights[0]; // Already sorted by preference
        state.selectedFlight = best.id;
        state.costs.flight = best.price;
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
// Render Trip Map (Leaflet.js)
// ========================================

// Store map instance globally so we can destroy it on re-render
let tripMap = null;

function renderTripMap() {
    const mapContainer = document.getElementById('leafletMap');
    const legend = document.getElementById('mapLegend');
    if (!mapContainer || !legend) return;

    // Destroy existing map if present
    if (tripMap) {
        tripMap.remove();
        tripMap = null;
    }

    const days = state.currentItinerary?.days || [];
    const colors = ['#3b82f6', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6'];

    // Default coordinates for common destinations (fallback)
    const destinationCoords = {
        'kyoto': [35.0116, 135.7681],
        'tokyo': [35.6762, 139.6503],
        'osaka': [34.6937, 135.5023],
        'paris': [48.8566, 2.3522],
        'barcelona': [41.3874, 2.1686],
        'bali': [-8.4095, 115.1889],
        'copenhagen': [55.6761, 12.5683],
        'rome': [41.9028, 12.4964],
        'london': [51.5074, -0.1278],
        'new york': [40.7128, -74.0060],
        'singapore': [1.3521, 103.8198],
        'bangkok': [13.7563, 100.5018],
        'default': [35.0116, 135.7681] // Kyoto as default
    };

    // Get center coordinates based on destination
    const dest = (state.destination || '').toLowerCase();
    let centerCoords = destinationCoords.default;
    for (const [key, coords] of Object.entries(destinationCoords)) {
        if (dest.includes(key)) {
            centerCoords = coords;
            break;
        }
    }

    // Initialize Leaflet map with better zoom settings
    tripMap = L.map('leafletMap', {
        center: centerCoords,
        zoom: 14,        // Start more zoomed in
        minZoom: 10,     // Don't allow too far zoom out
        maxZoom: 18,     // Allow street-level detail
        scrollWheelZoom: true,
        zoomControl: true
    });

    // Use CARTO tiles - cleaner, more colorful maps with better zoom
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(tripMap);

    // Collect all activity markers with their coordinates
    const allMarkers = [];
    const routePoints = [];
    let activityIndex = 0;

    days.forEach((day, dayIndex) => {
        const slots = ['morning', 'afternoon', 'evening'];

        slots.forEach(slot => {
            const activities = day.slots?.[slot] || [];
            activities.forEach(activity => {
                // Get coordinates from activity, or generate clustered offset from center
                let lat, lng;
                if (activity.coordinates?.lat && activity.coordinates?.lng) {
                    lat = activity.coordinates.lat;
                    lng = activity.coordinates.lng;
                } else {
                    // Fallback: create SMALL offset for tighter clustering (within ~500m)
                    // Spread activities in a spiral pattern for better visualization
                    const spiralAngle = activityIndex * 0.8;
                    const spiralRadius = 0.003 + (activityIndex * 0.001);
                    lat = centerCoords[0] + spiralRadius * Math.cos(spiralAngle);
                    lng = centerCoords[1] + spiralRadius * Math.sin(spiralAngle);
                }
                activityIndex++;

                // Create custom marker icon
                const markerIcon = L.divIcon({
                    className: `leaflet-marker-icon day-marker day-${dayIndex + 1}`,
                    html: `<span>${dayIndex + 1}</span>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14],
                    popupAnchor: [0, -14]
                });

                // Add marker
                const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(tripMap);

                // Create popup content
                const popupContent = `
                    <div class="map-popup">
                        <div class="map-popup-title">${activity.name}</div>
                        <div class="map-popup-time">${slot.charAt(0).toUpperCase() + slot.slice(1)} • ${activity.duration || '1-2h'}</div>
                        <div class="map-popup-description">${activity.description || ''}</div>
                        <span class="map-popup-day day-${dayIndex + 1}">Day ${dayIndex + 1}</span>
                    </div>
                `;
                marker.bindPopup(popupContent);

                allMarkers.push(marker);
                routePoints.push([lat, lng, dayIndex]);
            });
        });
    });

    // Draw route lines between activities (connecting same-day activities)
    let currentDayPoints = [];
    let prevDayIndex = -1;

    routePoints.forEach(([lat, lng, dayIndex]) => {
        if (dayIndex !== prevDayIndex && currentDayPoints.length > 1) {
            // Draw line for previous day
            L.polyline(currentDayPoints, {
                color: colors[prevDayIndex % colors.length],
                weight: 3,
                opacity: 0.7,
                dashArray: '8, 6'
            }).addTo(tripMap);
            currentDayPoints = [];
        }
        currentDayPoints.push([lat, lng]);
        prevDayIndex = dayIndex;
    });

    // Draw last day's route
    if (currentDayPoints.length > 1) {
        L.polyline(currentDayPoints, {
            color: colors[prevDayIndex % colors.length],
            weight: 3,
            opacity: 0.7,
            dashArray: '8, 6'
        }).addTo(tripMap);
    }

    // Fit map to show all markers with appropriate zoom
    if (allMarkers.length > 0) {
        const group = L.featureGroup(allMarkers);
        tripMap.fitBounds(group.getBounds(), {
            padding: [30, 30],
            maxZoom: 15  // Don't zoom in too close when fitting
        });
    }

    // CRITICAL: Force Leaflet to recalculate tile positions after container is visible
    // This fixes the grey tiles issue when map is rendered in a container that was hidden
    setTimeout(() => {
        if (tripMap) {
            tripMap.invalidateSize();
        }
    }, 100);

    // Also invalidate on window resize
    setTimeout(() => {
        if (tripMap) {
            tripMap.invalidateSize();
        }
    }, 500);

    // Render legend - strip "Day N" prefix with any dash type
    legend.innerHTML = days.map((day, i) => `
        <div class="legend-item">
            <div class="legend-dot day-${i + 1}"></div>
            <span>Day ${i + 1}: ${(day.name || 'Activities').replace(/^Day\s*\d+\s*[–\-—:]\s*/i, '')}</span>
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

    // Update cost display values
    document.getElementById('flightCostDisplay').textContent = `$${flight}`;
    document.getElementById('hotelCostDisplay').textContent = `$${hotel}`;
    document.getElementById('activitiesCostDisplay').textContent = `$${activities}`;
    document.getElementById('mealsCostDisplay').textContent = `$${meals}`;
    document.getElementById('transportCostDisplay').textContent = `$${transport}`;

    // Update pie chart center total
    const pieTotalEl = document.getElementById('pieTotalCost');
    if (pieTotalEl) pieTotalEl.textContent = `$${total.toLocaleString()}`;

    // Draw pie chart
    drawCostPieChart();
}

function drawCostPieChart() {
    const canvas = document.getElementById('costPieChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { flight, hotel, activities, meals, transport } = state.costs;
    const total = flight + hotel + activities + meals + transport;

    if (total === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const innerRadius = radius * 0.6; // Donut hole

    const segments = [
        { value: flight, color: '#60a5fa' },      // Blue - Flights
        { value: hotel, color: '#f472b6' },       // Pink - Hotels
        { value: activities, color: '#34d399' },  // Green - Activities
        { value: meals, color: '#fbbf24' },       // Yellow - Meals
        { value: transport, color: '#a78bfa' }    // Purple - Transport
    ];

    let startAngle = -Math.PI / 2; // Start from top

    segments.forEach(segment => {
        if (segment.value === 0) return;

        const sliceAngle = (segment.value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        // Draw outer arc
        ctx.beginPath();
        ctx.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();

        ctx.fillStyle = segment.color;
        ctx.fill();

        // Add subtle border between segments
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        startAngle = endAngle;
    });
}

// ========================================
// Render Hotels
// ========================================

function renderHotels() {
    // Use AI-generated hotels if available, otherwise fall back to static data
    let hotels;
    if (state.aiHotels && state.aiHotels.length > 0) {
        hotels = state.aiHotels.map(h => ({
            ...h,
            // Normalize AI hotel format to our format
            price: h.price || `$${h.pricePerNight || 150}/night`,
            image: `https://picsum.photos/seed/${encodeURIComponent(h.name || 'hotel')}/400/300`,
            features: h.features || [h.whyRecommended || 'Great choice'].slice(0, 3)
        }));
    } else {
        const dest = state.destination.toLowerCase();
        hotels = dest.includes('kyoto') ? hotelData.kyoto : dest.includes('tokyo') ? hotelData.tokyo : hotelData.default;
    }

    // Calculate preference match scores for hotels
    hotels = hotels.map(hotel => {
        let matchScore = 0;
        let matchReasons = [];

        // Check room size match
        if (hotel.roomSize && hotel.roomSize === state.hotelRoomSize) {
            matchScore += 2;
            matchReasons.push('📐 Room size');
        }

        // Check bed type match
        if (state.hotelBedType.length > 0 && hotel.bedTypes) {
            const matchedBeds = state.hotelBedType.filter(b => hotel.bedTypes.includes(b));
            if (matchedBeds.length > 0) {
                matchScore += 2;
                matchReasons.push('🛏️ Bed type');
            }
        }

        // Check location match
        if (state.hotelLocation.length > 0 && hotel.locationTags) {
            const matchedLocations = state.hotelLocation.filter(l => hotel.locationTags.includes(l));
            matchScore += matchedLocations.length;
            if (matchedLocations.length > 0) {
                matchReasons.push(`📍 ${matchedLocations.length} location`);
            }
        }

        // Check amenities match
        if (state.hotelAmenities.length > 0 && hotel.amenities) {
            const matchedAmenities = state.hotelAmenities.filter(a => hotel.amenities.includes(a));
            matchScore += matchedAmenities.length * 1.5;
            if (matchedAmenities.length > 0) {
                matchReasons.push(`✓ ${matchedAmenities.length} amenities`);
            }
        }

        // Check review focus match
        if (state.hotelReviewFocus.length > 0 && hotel.reviewHighlights) {
            const matchedReviews = state.hotelReviewFocus.filter(r => hotel.reviewHighlights.includes(r));
            if (matchedReviews.length > 0) {
                matchScore += matchedReviews.length;
                matchReasons.push('⭐ Top rated');
            }
        }

        // Check style match
        if (state.hotelStyle.length > 0 && hotel.style) {
            if (state.hotelStyle.includes(hotel.style)) {
                matchScore += 2;
                matchReasons.push('🎨 Your style');
            }
        }

        return { ...hotel, matchScore, matchReasons };
    });

    // Sort by match score
    hotels.sort((a, b) => b.matchScore - a.matchScore);

    const container = document.getElementById('hotelCards');
    if (!container) return;

    container.innerHTML = hotels.map((hotel, idx) => {
        // Generate pros/cons from features
        const features = hotel.features || [];
        const pros = features.slice(0, 2);
        const cons = (hotel.rating || 4.5) < 4.5 ? ['Can be busy'] : [];
        const priceNum = hotel.priceNum || hotel.pricePerNight || parseInt(String(hotel.price).replace(/[^0-9]/g, '')) || 150;

        const isBestMatch = idx === 0 && hotel.matchScore > 0;
        const matchBadge = isBestMatch ? '<span class="pref-badge best">🎯 Best Match</span>' :
            (hotel.matchReasons?.length > 0 ? '<span class="pref-badge">✓ Matches preferences</span>' : '');

        // Room info
        const roomSizeLabels = { compact: '<15m²', standard: '15-20m²', spacious: '20-25m²', suite: '25m²+' };
        const roomInfo = hotel.roomSize ? `${roomSizeLabels[hotel.roomSize] || hotel.roomSize}` : '';
        const bedInfo = hotel.bedTypes ? hotel.bedTypes.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join('/') : '';

        // Guest voice
        const guestVoice = hotel.guestVoice?.topReview || '';

        return `
        <div class="hotel-card ${state.selectedHotel === hotel.id ? 'selected' : ''} ${isBestMatch ? 'best-match' : ''}" data-id="${hotel.id}" data-price="${priceNum}">
          <div class="hotel-image">
            <img src="${hotel.image}" alt="${hotel.name}" loading="lazy">
          </div>
          ${matchBadge}
          <div class="hotel-name">${hotel.name}</div>
          <div class="hotel-info">${hotel.type} • ${hotel.location}</div>
          ${roomInfo || bedInfo ? `<div class="hotel-room-info">📐 ${roomInfo} ${bedInfo ? '• 🛏️ ' + bedInfo : ''}</div>` : ''}
          <div class="hotel-price">${typeof hotel.price === 'string' ? hotel.price : '$' + priceNum + '/night'} <span style="color: #f5a623">★ ${hotel.rating || 4.5}</span></div>
          ${hotel.matchReasons?.length > 0 ? `
          <div class="hotel-match-reasons">
            ${hotel.matchReasons.map(r => `<span class="match-tag">${r}</span>`).join('')}
          </div>
          ` : ''}
          ${guestVoice ? `<div class="guest-voice">${guestVoice}</div>` : ''}
          <div class="hotel-pros-cons">
            ${pros.map(p => `<span class="hotel-pro">✓ ${p}</span>`).join('')}
            ${cons.map(c => `<span class="hotel-con">✗ ${c}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Auto-select best match hotel
    if (!state.selectedHotel && hotels.length > 0) {
        state.selectedHotel = hotels[0].id;
        const priceNum = hotels[0].priceNum || hotels[0].pricePerNight || parseInt(String(hotels[0].price).replace(/[^0-9]/g, '')) || 150;
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
    // Use AI-generated Unsplash image if available, otherwise static
    const imgUrl = activity.imageUrl || activityImages[activity.id] || activityImages.default;

    // Travel time indicator (shows before activity if there's travel time)
    const travelTimeHtml = activity.travelTime ?
        `<div class="travel-indicator">🚗 ${activity.travelTime}</div>` : '';

    return `
    ${travelTimeHtml}
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

async function processRefinement(message) {
    // Show typing indicator in chat
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message assistant typing';
    typingEl.innerHTML = '<div class="message-bubble">✨ Updating your itinerary...</div>';
    document.getElementById('chatMessages').appendChild(typingEl);

    // Show loading overlay on itinerary panel
    const itineraryLoading = document.getElementById('itineraryLoadingOverlay');
    const loadingSubtext = document.getElementById('itineraryLoadingSubtext');
    if (itineraryLoading) {
        itineraryLoading.classList.add('visible');
        // Cycle through loading messages
        const loadingMessages = [
            'Applying your changes',
            'Analyzing your request',
            'Crafting new activities',
            'Almost there...'
        ];
        let msgIndex = 0;
        const loadingInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % loadingMessages.length;
            if (loadingSubtext) loadingSubtext.textContent = loadingMessages[msgIndex];
        }, 2000);
        itineraryLoading.dataset.interval = loadingInterval;
    }

    try {
        // Call Gemini AI for intelligent modification
        const result = await GeminiService.modifyItinerary(
            state.currentItinerary,
            message,
            state.chatHistory
        );

        // Hide loading overlay
        if (itineraryLoading) {
            clearInterval(parseInt(itineraryLoading.dataset.interval));
            itineraryLoading.classList.remove('visible');
        }

        // Remove typing indicator
        typingEl.remove();

        // Add AI response
        addMessage('assistant', result.response);

        // Apply the changes if we got an updated itinerary
        if (result.updatedItinerary) {
            // Merge the updated itinerary with the current one
            const updatedIt = result.updatedItinerary;

            // Update title and summary if provided
            if (updatedIt.title) state.currentItinerary.title = updatedIt.title;
            if (updatedIt.summary) state.currentItinerary.summary = updatedIt.summary;

            // Update days if provided
            if (updatedIt.days && updatedIt.days.length > 0) {
                state.currentItinerary.days = updatedIt.days.map((day, i) => {
                    const existingDay = state.currentItinerary.days[i] || {};
                    return {
                        name: day.name || existingDay.name,
                        description: day.description || existingDay.description,
                        slots: {
                            morning: normalizeActivities(day.slots?.morning || existingDay.slots?.morning || []),
                            afternoon: normalizeActivities(day.slots?.afternoon || existingDay.slots?.afternoon || []),
                            evening: normalizeActivities(day.slots?.evening || existingDay.slots?.evening || [])
                        }
                    };
                });
            }

            // Re-render everything
            renderItinerary();
            renderTripMap();
            updateCosts();

            // Flash the itinerary section to show update
            const itSection = document.getElementById('itinerarySection');
            itSection.classList.add('flash-update');
            setTimeout(() => itSection.classList.remove('flash-update'), 1000);

            console.log('✅ Itinerary updated from chat');
        }

    } catch (error) {
        console.error('AI refinement failed:', error);

        // Hide loading overlay on error
        if (itineraryLoading) {
            clearInterval(parseInt(itineraryLoading.dataset.interval));
            itineraryLoading.classList.remove('visible');
        }

        typingEl.remove();

        // Fallback to simple responses
        const msg = message.toLowerCase();
        let response = '';

        if (msg.includes('less busy') || msg.includes('lighter') || msg.includes('slower')) {
            response = "I'd make your itinerary more relaxed - try being more specific! 🧘";
        } else if (msg.includes('more food') || msg.includes('restaurant') || msg.includes('eating')) {
            response = "I'd add more food spots - try again in a moment! 🍽️";
        } else if (msg.includes('scenic') || msg.includes('photo')) {
            response = "I'd highlight scenic spots - please try again! 📸";
        } else if (msg.includes('budget') || msg.includes('cheaper')) {
            response = "I'd optimize for budget - please try again! 💰";
        } else {
            response = `I couldn't process "${message}" right now. Please try again! 🙏`;
        }
        addMessage('assistant', response);
    }
}

// Helper to normalize activity format from AI response
function normalizeActivities(activities) {
    if (!activities || !Array.isArray(activities)) return [];

    return activities.map(a => ({
        id: a.id || `activity_${Math.random().toString(36).substr(2, 9)}`,
        name: a.name || a.title || 'Activity',
        description: a.description || '',
        duration: a.duration || '1-2 hours',
        tags: a.tags || [a.category || 'Activity'],
        area: a.area || a.location || '',
        category: a.category || 'Activity',
        priceLevel: a.priceLevel || a.cost || 'Free',
        hours: a.hours || '',
        goodFor: a.goodFor || ['Everyone'],
        rating: a.rating || 4.0,
        reviews: a.reviews || { positive: [], negative: [] },
        coordinates: a.coordinates || null,
        note: a.note || ''
    }));
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

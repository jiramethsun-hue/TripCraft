# TripCraft AI ✈️

An AI-powered travel itinerary planner that generates personalized trip plans using Google's Gemini API.

## 🌟 Features

- **AI-Generated Itineraries**: Day-by-day activities tailored to your preferences
- **Interactive Leaflet Map**: Real location markers with routes between activities
- **Cost Breakdown**: Visual pie chart showing expense distribution
- **Flight & Hotel Options**: AI-suggested accommodations with pricing
- **Weather & Visa Info**: Destination-specific travel requirements
- **Responsive Design**: Works on desktop and mobile

## 🚀 Getting Started

1. Clone this repository
2. Add your Gemini API key in `scripts/config.js`:
   ```javascript
   const GEMINI_API_KEY = 'your-api-key-here';
   ```
3. Open `index.html` in your browser

## 📁 Project Structure

```
TripCraft-AI/
├── index.html              # Main HTML structure
├── scripts/
│   ├── app.js              # Core application logic (1,900+ lines)
│   ├── config.js           # API configuration
│   └── gemini-service.js   # Gemini API integration
├── styles/
│   └── main.css            # Styling (1,850+ lines)
└── backups/                # Rollback files for recent changes
```

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Maps**: Leaflet.js with OpenStreetMap/CARTO tiles
- **AI**: Google Gemini API for itinerary generation
- **Charts**: Native Canvas API for pie chart

## 📝 Areas for Review

1. **HTML Structure & Semantics** - `index.html`
2. **CSS Layout & Responsiveness** - `styles/main.css`
3. **JavaScript Logic** - `scripts/app.js`, `scripts/gemini-service.js`

## 🔮 Potential Enhancements

- [ ] User authentication & saved trips
- [ ] Export itinerary to PDF/Calendar
- [ ] Integration with booking APIs
- [ ] Offline support with PWA
- [ ] Multi-language support

## License

MIT

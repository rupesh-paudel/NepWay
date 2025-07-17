# Quick Google Maps Setup

## Step 1: Get Your Free API Key
1. Go to: https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable these APIs:
   - Maps JavaScript API
   - Places API  
   - Geocoding API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

## Step 2: Add API Key to Your App

### Option A: Environment Variable (Recommended)
Create a `.env` file in the `client` folder:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Option B: Direct Setup (Quick Testing)
Edit `client/src/api/config.js` and replace this line:
```javascript
export const GOOGLE_MAPS_API_KEY = 'your_api_key_here';
```

## Step 3: Restart Your App
Stop the frontend (Ctrl+C) and run `npm start` again.

## You're Done! 🎉
- Maps will now load with interactive location selection
- Click on map to select locations
- Search for addresses using the search box
- Current fallback: Manual text input (works without API key)

## Security Note
For production apps, restrict your API key to your domain in Google Cloud Console.

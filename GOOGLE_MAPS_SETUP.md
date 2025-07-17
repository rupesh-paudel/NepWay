# Google Maps API Setup Guide

## 1. Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API

4. Create credentials (API Key):
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

## 2. Configure API Key in Your App

### Option 1: Environment Variable (Recommended)
1. Create a `.env` file in the `client` folder:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. Add `.env` to your `.gitignore` file to keep your key secure

### Option 2: Direct Configuration
Edit `client/src/api/config.js` and add:
```javascript
export const GOOGLE_MAPS_API_KEY = 'your_api_key_here';
```

## 3. Load Google Maps Script

The GoogleMapPicker component will automatically load the Google Maps JavaScript API when it mounts.

## 4. API Key Restrictions (Security)

For production, restrict your API key:
1. In Google Cloud Console, go to your API key
2. Set Application restrictions:
   - HTTP referrers for web apps
   - Add your domain (e.g., `yourapp.com/*`)
3. Set API restrictions:
   - Restrict key to only the APIs you need

## 5. Testing

1. Start your React app: `npm start`
2. Navigate to "Request a Ride" or "Create Ride Offer"
3. You should see the Google Maps interface for selecting locations

## Troubleshooting

- **Map not loading**: Check browser console for API key errors
- **"This page can't load Google Maps correctly"**: Verify API key and billing setup
- **Autocomplete not working**: Ensure Places API is enabled
- **Geocoding errors**: Ensure Geocoding API is enabled

## Cost Considerations

Google Maps APIs have usage limits and pricing:
- First $200/month is free
- After that, pay-per-use pricing applies
- Monitor usage in Google Cloud Console

For development/testing, the free tier is usually sufficient.

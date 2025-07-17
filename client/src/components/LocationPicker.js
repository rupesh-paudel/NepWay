import React, { useState } from 'react';

const LocationPicker = ({ onLocationSelect, placeholder = "Enter location" }) => {
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sample locations for demonstration - in real app, you'd use Google Places API
  const sampleLocations = [
    'Downtown', 'City Center', 'Airport', 'University Campus', 'Mall', 'Hospital',
    'Train Station', 'Bus Terminal', 'Park', 'Business District', 'Residential Area',
    'Shopping Center', 'Sports Complex', 'Library', 'Government Office', 'Hotel District'
  ];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    
    if (value.length > 0) {
      const filtered = sampleLocations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    onLocationSelect(value);
  };

  const selectSuggestion = (suggestion) => {
    setLocation(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationSelect(suggestion);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocation('Getting location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLoc = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          setLocation(currentLoc);
          onLocationSelect(currentLoc);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocation('');
          switch(error.code) {
            case error.PERMISSION_DENIED:
              alert('Location access denied. Please enable location permissions in your browser.');
              break;
            case error.POSITION_UNAVAILABLE:
              alert('Location information is unavailable.');
              break;
            case error.TIMEOUT:
              alert('Location request timed out.');
              break;
            default:
              alert('An unknown error occurred while retrieving location.');
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={location}
          onChange={handleInputChange}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
        <button
          type="button"
          onClick={getCurrentLocation}
          style={{
            padding: '12px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          title="Use current location"
        >
          <i className="fas fa-location-arrow"></i>
        </button>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          marginTop: '4px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => selectSuggestion(suggestion)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              <i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: '#6b7280' }}></i>
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

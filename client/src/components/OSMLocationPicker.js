import React, { useState, useEffect, useRef } from 'react';

const OSMLocationPicker = ({ onLocationSelect, placeholder, initialValue }) => {
  const [address, setAddress] = useState(initialValue || '');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapId] = useState(() => `osm-map-${Math.random().toString(36).substr(2, 9)}`);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Load Leaflet CSS and JS
  useEffect(() => {
    // Add Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
      initializeMap();
    }

    // Cleanup function - only clean up what we control
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Error during map cleanup:', error);
        }
        mapInstanceRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
      // Don't manually manipulate DOM - let React handle it
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;
    
    // Check if map is already initialized
    if (mapInstanceRef.current) {
      return; // Map already exists, don't reinitialize
    }

    // Default location (Delhi, India)
    const defaultLat = 28.6139;
    const defaultLng = 77.2090;

    try {
      // Initialize map - let Leaflet handle the DOM
      mapInstanceRef.current = window.L.map(mapRef.current, {
        // Prevent Leaflet from handling some DOM events that conflict with React
        zoomControl: true,
        attributionControl: true
      }).setView([defaultLat, defaultLng], 13);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Add click event to map
      mapInstanceRef.current.on('click', handleMapClick);

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([lat, lng], 13);
              placeMarker([lat, lng]);
            }
          },
          (error) => {
            console.log('Geolocation error:', error);
          }
        );
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      // If there's an error, clean up our references but let React handle DOM
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (cleanupError) {
          console.warn('Error during cleanup:', cleanupError);
        }
        mapInstanceRef.current = null;
      }
    }
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    placeMarker([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const placeMarker = (latlng) => {
    if (!mapInstanceRef.current || !window.L) return;

    try {
      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Add new marker
      markerRef.current = window.L.marker(latlng).addTo(mapInstanceRef.current);
      
      setSelectedLocation({ lat: latlng[0], lng: latlng[1] });
    } catch (error) {
      console.error('Error placing marker:', error);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        const formattedAddress = data.display_name;
        setAddress(formattedAddress);
        
        if (onLocationSelect) {
          onLocationSelect(formattedAddress, { lat, lng });
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    if (onLocationSelect) {
      onLocationSelect(e.target.value, selectedLocation);
    }
  };

  const searchLocation = async () => {
    if (!address.trim()) return;

    try {
      // Using OpenStreetMap Nominatim API for forward geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
          placeMarker([lat, lng]);
          setSelectedLocation({ lat, lng });
          
          if (onLocationSelect) {
            onLocationSelect(result.display_name, { lat, lng });
          }
        }
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error searching for location. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation();
    }
  };

  return (
    <div className="osm-location-picker" style={{ width: '100%' }}>
      {/* Address Input */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || "Enter location or click on map"}
          style={{
            flex: 1,
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
        <button
          type="button"
          onClick={searchLocation}
          style={{
            padding: '12px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        id={mapId}
        style={{
          width: '100%',
          height: '300px',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}
      >
        {!mapLoaded && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#666'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
            Loading map...
          </div>
        )}
      </div>

      {/* Instructions */}
      <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
        🗺️ Click on the map to select a location or search for an address above.
        <br />
        📍 Powered by OpenStreetMap (free alternative to Google Maps)
      </small>
    </div>
  );
};

export default OSMLocationPicker;

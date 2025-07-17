import React, { useState, useEffect, useRef, useCallback } from 'react';

const StableOSMPicker = ({ onLocationSelect, placeholder, initialValue }) => {
  const [address, setAddress] = useState(initialValue || '');
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const isInitializedRef = useRef(false);
  
  // Create unique ID for this map instance to prevent conflicts
  const mapId = useRef(`map-${Math.random().toString(36).substr(2, 9)}`).current;

  // Memoized map initialization
  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || !window.L || isInitializedRef.current) {
      return;
    }

    try {
      // Mark as initialized
      isInitializedRef.current = true;

      // Create map instance
      const map = window.L.map(mapContainerRef.current, {
        center: [28.6139, 77.2090], // Delhi
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      });

      // Add tile layer
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Store map reference
      mapInstanceRef.current = map;

      // Add click handler
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        placeMarker([lat, lng]);
        reverseGeocode(lat, lng);
      });

      setIsMapReady(true);

      // Try to get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([lat, lng], 13);
            }
          },
          (error) => {
            console.log('Geolocation not available:', error.message);
          }
        );
      }
    } catch (error) {
      console.error('Map initialization failed:', error);
      setMapError(error.message);
      isInitializedRef.current = false;
    }
  }, []);

  // Load Leaflet and initialize map
  useEffect(() => {
    let isComponentMounted = true;

    const loadLeaflet = async () => {
      try {
        // Add CSS if not present
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Load JS if not present
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.crossOrigin = '';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Initialize map if component is still mounted
        if (isComponentMounted) {
          initializeMap();
        }
      } catch (error) {
        if (isComponentMounted) {
          setMapError('Failed to load map library');
          console.error('Leaflet loading failed:', error);
        }
      }
    };

    loadLeaflet();

    // Cleanup function
    return () => {
      isComponentMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Map cleanup warning:', error);
        }
        mapInstanceRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array - only run once

  // Handle initialValue changes without interfering with other instances
  useEffect(() => {
    if (initialValue && initialValue !== address) {
      console.log(`StableOSMPicker[${mapId}]: Setting initial value:`, initialValue);
      setAddress(initialValue);
    }
  }, [initialValue, mapId]); // Only update when initialValue actually changes

  const placeMarker = useCallback((latlng) => {
    if (!mapInstanceRef.current || !window.L) return;

    try {
      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Add new marker
      markerRef.current = window.L.marker(latlng).addTo(mapInstanceRef.current);
    } catch (error) {
      console.warn('Marker placement error:', error);
    }
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      console.log(`StableOSMPicker[${mapId}]: Reverse geocoding:`, { lat, lng });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        const formattedAddress = data.display_name;
        console.log(`StableOSMPicker[${mapId}]: Setting address to:`, formattedAddress);
        setAddress(formattedAddress);
        
        if (onLocationSelect) {
          console.log(`StableOSMPicker[${mapId}]: Calling onLocationSelect with:`, { formattedAddress, lat, lng });
          onLocationSelect(formattedAddress, { lat, lng });
        }
      }
    } catch (error) {
      console.error(`StableOSMPicker[${mapId}]: Reverse geocoding error:`, error);
    }
  }, [onLocationSelect, mapId]);

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    console.log(`StableOSMPicker[${mapId}]: Address input changed to:`, newAddress);
    setAddress(newAddress);
    
    if (onLocationSelect) {
      console.log(`StableOSMPicker[${mapId}]: Calling onLocationSelect with manual input:`, newAddress);
      onLocationSelect(newAddress, null);
    }
  };

  const searchLocation = async () => {
    if (!address.trim()) return;

    try {
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

  if (mapError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', border: '2px solid #ffc107', borderRadius: '8px', backgroundColor: '#fff3cd' }}>
        <p>⚠️ Map loading failed. Using text input instead.</p>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder={placeholder || "Enter location manually"}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
      </div>
    );
  }

  return (
    <div className="stable-osm-picker" style={{ width: '100%' }}>
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
          🔍 Search
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        id={mapId}
        style={{
          width: '100%',
          height: '300px',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          position: 'relative'
        }}
      >
        {!isMapReady && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(248, 249, 250, 0.9)',
            zIndex: 1000
          }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <div>🗺️ Loading interactive map...</div>
              <small>Powered by OpenStreetMap</small>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
        🗺️ Click on the map to select a location or search for an address above.
        <br />
        📍 Free OpenStreetMap - no API key required!
      </small>
    </div>
  );
};

export default StableOSMPicker;

import React, { useState, useRef, useEffect } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../api/config';

const GoogleMapPicker = ({ onLocationSelect, placeholder = "Search location", initialValue = "" }) => {
  const [location, setLocation] = useState(initialValue);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Function to load Google Maps API
  const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for it to load
        const checkGoogleMaps = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogleMaps);
            resolve();
          }
        }, 100);
        return;
      }

      // Create and load the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    // Load Google Maps API and then initialize map
    loadGoogleMapsAPI()
      .then(() => {
        initializeMap();
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
        alert('Failed to load Google Maps. Please check your API key.');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;

    // Default location (you can change this to your city)
    const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: defaultLocation,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Add click listener to map
    mapInstanceRef.current.addListener('click', (event) => {
      placeMarker(event.latLng);
      reverseGeocode(event.latLng);
    });

    // Initialize autocomplete
    const input = document.getElementById('location-search-input');
    if (input) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(input);
      autocompleteRef.current.addListener('place_changed', onPlaceChanged);
    }

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstanceRef.current.setCenter(userLocation);
          placeMarker(userLocation);
        },
        () => {
          console.log('Geolocation failed, using default location');
        }
      );
    }
  };

  const placeMarker = (location) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });

    markerRef.current.addListener('dragend', (event) => {
      reverseGeocode(event.latLng);
    });
  };

  const reverseGeocode = (latLng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        setLocation(address);
        onLocationSelect(address, {
          lat: latLng.lat(),
          lng: latLng.lng(),
          fullAddress: results[0]
        });
      }
    });
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const location = place.geometry.location;
      mapInstanceRef.current.setCenter(location);
      mapInstanceRef.current.setZoom(15);
      placeMarker(location);
      setLocation(place.formatted_address);
      onLocationSelect(place.formatted_address, {
        lat: location.lat(),
        lng: location.lng(),
        fullAddress: place
      });
    }
  };

  const toggleMap = () => {
    setIsMapVisible(!isMapVisible);
    if (!isMapVisible) {
      // Small delay to ensure the map container is visible before initializing
      setTimeout(() => {
        if (mapInstanceRef.current) {
          window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
        } else {
          initializeMap();
        }
      }, 100);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(userLocation);
            placeMarker(userLocation);
            reverseGeocode(new window.google.maps.LatLng(userLocation.lat, userLocation.lng));
          }
        },
        (error) => {
          alert('Unable to get your location. Please select manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Search Input */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <input
          id="location-search-input"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
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
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          title="Use current location"
        >
          <i className="fas fa-location-arrow"></i>
        </button>
        <button
          type="button"
          onClick={toggleMap}
          style={{
            padding: '12px',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          title="Open map"
        >
          <i className="fas fa-map"></i>
        </button>
      </div>

      {/* Map Container */}
      {isMapVisible && (
        <div style={{
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '10px'
        }}>
          <div style={{
            background: '#f9fafb',
            padding: '10px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              <i className="fas fa-info-circle"></i> Click on map or search to select location
            </span>
            <button
              onClick={toggleMap}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div
            ref={mapRef}
            style={{
              height: '300px',
              width: '100%'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default GoogleMapPicker;

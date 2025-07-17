import React, { useState } from 'react';

const SimpleLocationPicker = ({ onLocationSelect, placeholder, initialValue }) => {
  const [address, setAddress] = useState(initialValue || '');

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    
    // Call the callback with the address
    if (onLocationSelect) {
      onLocationSelect(newAddress, null); // null for coordinates since we don't have Maps
    }
  };

  return (
    <div className="simple-location-picker">
      <input
        type="text"
        value={address}
        onChange={handleAddressChange}
        placeholder={placeholder || "Enter location"}
        className="form-control"
        style={{
          width: '100%',
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
      <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
        💡 Enter your location manually. Google Maps integration available with API key setup.
      </small>
    </div>
  );
};

export default SimpleLocationPicker;

import React, { useState, useEffect } from 'react';
import api from '../api/config';
import StableOSMPicker from './StableOSMPicker';

const CreateRide = () => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    fromCoordinates: null,
    toCoordinates: null,
    date: '',
    time: '',
    availableSeats: '',
    pricePerSeat: '',
    description: '',
    vehicleInfo: {
      make: '',
      model: '',
      color: '',
      plateNumber: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vehicle.')) {
      const vehicleField = name.split('.')[1];
      setFormData({
        ...formData,
        vehicleInfo: {
          ...formData.vehicleInfo,
          [vehicleField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (fromCoords, toCoords) => {
    if (!fromCoords || !toCoords) return 0;
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (toCoords.lat - fromCoords.lat) * Math.PI / 180;
    const dLon = (toCoords.lng - fromCoords.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(fromCoords.lat * Math.PI / 180) * Math.cos(toCoords.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  };

  // Calculate fare based on distance: Rs. 30 basic + tiered pricing per km
  const calculateFare = (fromCoords, toCoords) => {
    const distance = calculateDistance(fromCoords, toCoords);
    if (distance === 0) return 30; // Basic fare
    
    const basicFare = 30;
    let totalFare = basicFare;
    
    // Tiered pricing structure
    if (distance <= 5) {
      // First 5 km: Rs. 15 each
      totalFare += distance * 15;
    } else if (distance <= 15) {
      // First 5 km: Rs. 15 each + Next 10 km: Rs. 10 each
      totalFare += (5 * 15) + ((distance - 5) * 10);
    } else {
      // First 5 km: Rs. 15 each + Next 10 km: Rs. 10 each + Remaining: Rs. 5 each
      totalFare += (5 * 15) + (10 * 10) + ((distance - 15) * 5);
    }
    
    return Math.round(totalFare);
  };

  // Auto-calculate fare when both locations are set
  useEffect(() => {
    if (formData.fromCoordinates && formData.toCoordinates) {
      const suggestedFare = calculateFare(formData.fromCoordinates, formData.toCoordinates);
      setFormData(prevData => ({
        ...prevData,
        pricePerSeat: suggestedFare.toString()
      }));
    }
  }, [formData.fromCoordinates, formData.toCoordinates]);

  const handleLocationSelect = (field) => (address, data) => {
    console.log(`CreateRide: handleLocationSelect called for ${field}:`, { address, data });
    
    // Use functional update to prevent state conflicts
    setFormData(prevFormData => {
      const newFormData = {
        ...prevFormData,
        [field]: address,
        [`${field}Coordinates`]: data ? { lat: data.lat, lng: data.lng } : null
      };
      console.log(`CreateRide: Updated ${field} to:`, address);
      console.log(`CreateRide: New form data:`, newFormData);
      return newFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Debug: Log current form data
    console.log('Current form data:', formData);

    // Validate form data with detailed debugging
    const requiredFields = ['from', 'to', 'date', 'time', 'availableSeats', 'pricePerSeat'];
    const fieldValues = requiredFields.map(field => ({
      field,
      value: formData[field],
      isEmpty: !formData[field] || formData[field].toString().trim() === ''
    }));
    
    console.log('Field validation details:', fieldValues);
    
    const missingFields = fieldValues.filter(item => item.isEmpty).map(item => item.field);
    
    if (missingFields.length > 0) {
      const errorMessage = `Please fill in all required fields: ${missingFields.join(', ')}`;
      console.error('Validation failed:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      return;
    }

    // Validate numeric fields
    if (parseInt(formData.availableSeats) < 1) {
      setError('Available seats must be at least 1');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.pricePerSeat) < 0) {
      setError('Price per seat must be 0 or greater');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending enhanced ride data:', formData);
      
      const response = await api.post('/api/rides', formData);
      
      console.log('Enhanced ride created:', response.data);
      setSuccess('Ride created successfully!');
      setFormData({
        from: '',
        to: '',
        fromCoordinates: null,
        toCoordinates: null,
        date: '',
        time: '',
        availableSeats: '',
        pricePerSeat: '',
        description: '',
        vehicleInfo: {
          make: '',
          model: '',
          color: '',
          plateNumber: ''
        }
      });
    } catch (err) {
      console.error('Error creating enhanced ride:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to create ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', color: 'white' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          <i className="fas fa-plus-circle"></i> Create New Ride Offer
        </h2>

        {/* Debug Panel - Remove this after testing */}
        <div style={{ 
          backgroundColor: '#2c3e50', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          fontSize: '12px'
        }}>
          <strong>Debug Info (check console for more details):</strong>
          <br />
          From: {formData.from ? '✓ ' + formData.from.substring(0, 30) + '...' : '❌ Empty'}
          <br />
          To: {formData.to ? '✓ ' + formData.to.substring(0, 30) + '...' : '❌ Empty'}
          <br />
          Date: {formData.date ? '✓ ' + formData.date : '❌ Empty'}
          <br />
          Time: {formData.time ? '✓ ' + formData.time : '❌ Empty'}
          <br />
          Seats: {formData.availableSeats ? '✓ ' + formData.availableSeats : '❌ Empty'}
          <br />
          Price: {formData.pricePerSeat ? '✓ Rs.' + formData.pricePerSeat : '❌ Empty'}
        </div>

        <div className="card">
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-triangle"></i> {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Location Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>
                  <i className="fas fa-map-marker-alt"></i> Pickup Location * 
                  {formData.from && <span style={{ color: '#28a745', marginLeft: '10px' }}>✓</span>}
                </label>
                <StableOSMPicker 
                  onLocationSelect={handleLocationSelect('from')}
                  placeholder="Select pickup location"
                  initialValue={formData.from}
                />
                {formData.from && (
                  <small style={{ color: '#28a745', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    📍 Selected: {formData.from.substring(0, 50)}...
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-flag-checkered"></i> Destination * 
                  {formData.to && <span style={{ color: '#28a745', marginLeft: '10px' }}>✓</span>}
                </label>
                <StableOSMPicker 
                  onLocationSelect={handleLocationSelect('to')}
                  placeholder="Select destination"
                  initialValue={formData.to}
                />
                {formData.to && (
                  <small style={{ color: '#28a745', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    📍 Selected: {formData.to.substring(0, 50)}...
                  </small>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="date">
                  <i className="fas fa-calendar"></i> Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">
                  <i className="fas fa-clock"></i> Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Ride Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="availableSeats">
                  <i className="fas fa-users"></i> Available Seats *
                </label>
                <input
                  type="number"
                  id="availableSeats"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  required
                  min="1"
                  max="8"
                  placeholder="e.g., 3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pricePerSeat">
                  <i className="fas fa-rupee-sign"></i> Price per Seat (Rs.) *
                </label>
                <input
                  type="number"
                  id="pricePerSeat"
                  name="pricePerSeat"
                  value={formData.pricePerSeat}
                  onChange={handleChange}
                  required
                  min="30"
                  step="1"
                  placeholder="Auto-calculated based on distance"
                />
                {formData.fromCoordinates && formData.toCoordinates && (
                  <div style={{ marginTop: '8px', fontSize: '14px' }}>
                    <div style={{ color: '#16a34a', fontWeight: '500' }}>
                      📏 Distance: ~{calculateDistance(formData.fromCoordinates, formData.toCoordinates)} km
                    </div>
                    <div style={{ color: '#0ea5e9', fontSize: '12px' }}>
                      💰 Suggested Fare: Rs. {calculateFare(formData.fromCoordinates, formData.toCoordinates)} 
                      (Rs. 30 basic + Rs. 15/km first 5km + Rs. 10/km next 10km + Rs. 5/km remaining)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="description">
                <i className="fas fa-comment"></i> Additional Information
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Any special instructions, vehicle details, or preferences..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Vehicle Information */}
            <div style={{ 
              background: '#f9fafb', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px' 
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '15px' }}>
                <i className="fas fa-car"></i> Vehicle Information (Optional)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                <div className="form-group">
                  <label htmlFor="vehicle.make">Make</label>
                  <input
                    type="text"
                    id="vehicle.make"
                    name="vehicle.make"
                    value={formData.vehicleInfo.make}
                    onChange={handleChange}
                    placeholder="e.g., Toyota"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="vehicle.model">Model</label>
                  <input
                    type="text"
                    id="vehicle.model"
                    name="vehicle.model"
                    value={formData.vehicleInfo.model}
                    onChange={handleChange}
                    placeholder="e.g., Camry"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="vehicle.color">Color</label>
                  <input
                    type="text"
                    id="vehicle.color"
                    name="vehicle.color"
                    value={formData.vehicleInfo.color}
                    onChange={handleChange}
                    placeholder="e.g., White"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="vehicle.plateNumber">Plate Number</label>
                  <input
                    type="text"
                    id="vehicle.plateNumber"
                    name="vehicle.plateNumber"
                    value={formData.vehicleInfo.plateNumber}
                    onChange={handleChange}
                    placeholder="e.g., ABC-123"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '20px', fontSize: '18px', padding: '15px' }} 
              disabled={loading}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Creating Ride Offer...</>
              ) : (
                <><i className="fas fa-plus"></i> Create Ride Offer</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRide;

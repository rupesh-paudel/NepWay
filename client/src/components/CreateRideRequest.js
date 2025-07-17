import React, { useState, useEffect } from 'react';
import api from '../api/config';
import StableOSMPicker from './StableOSMPicker';

const CreateRideRequest = () => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    fromCoordinates: null,
    toCoordinates: null,
    preferredDate: '',
    preferredTime: '',
    maxPricePerSeat: '',
    seatsNeeded: 1,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationSelect = (field) => (address, data) => {
    console.log(`CreateRideRequest: handleLocationSelect called for ${field}:`, { address, data });
    
    // Use functional update to prevent state conflicts
    setFormData(prevFormData => {
      const newFormData = {
        ...prevFormData,
        [field]: address,
        [`${field}Coordinates`]: data ? { lat: data.lat, lng: data.lng } : null
      };
      console.log(`CreateRideRequest: Updated ${field} to:`, address);
      console.log(`CreateRideRequest: New form data:`, newFormData);
      return newFormData;
    });
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

  // Auto-calculate max fare when both locations are set
  useEffect(() => {
    if (formData.fromCoordinates && formData.toCoordinates) {
      const suggestedMaxFare = calculateFare(formData.fromCoordinates, formData.toCoordinates);
      setFormData(prevData => ({
        ...prevData,
        maxPricePerSeat: suggestedMaxFare.toString()
      }));
    }
  }, [formData.fromCoordinates, formData.toCoordinates]);

  // Calculate current distance and suggested fare for display
  const distance = formData.fromCoordinates && formData.toCoordinates 
    ? calculateDistance(formData.fromCoordinates, formData.toCoordinates) 
    : 0;
  const suggestedFare = formData.fromCoordinates && formData.toCoordinates 
    ? calculateFare(formData.fromCoordinates, formData.toCoordinates) 
    : 30;

  // Form validation function
  const isFormValid = () => {
    const requiredFields = ['from', 'to', 'fromCoordinates', 'toCoordinates', 'preferredDate', 'preferredTime', 'maxPricePerSeat', 'seatsNeeded'];
    return requiredFields.every(field => {
      const value = formData[field];
      if (field.includes('Coordinates')) {
        return value && value.lat && value.lng;
      }
      return value && value.toString().trim() !== '';
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Debug: Log current form data
    console.log('Current ride request form data:', formData);

    // Validate form data with detailed debugging
    const requiredFields = ['from', 'to', 'preferredDate', 'preferredTime', 'maxPricePerSeat'];
    const fieldValues = requiredFields.map(field => ({
      field,
      value: formData[field],
      isEmpty: !formData[field] || formData[field].toString().trim() === ''
    }));
    
    console.log('Ride request field validation details:', fieldValues);
    
    const missingFields = fieldValues.filter(item => item.isEmpty).map(item => item.field);
    
    if (missingFields.length > 0) {
      const errorMessage = `Please fill in all required fields: ${missingFields.join(', ')}`;
      console.error('Ride request validation failed:', errorMessage);
      setError(errorMessage);
      setLoading(false);
      return;
    }

    try {
      console.log('Sending ride request data:', formData);
      
      const response = await api.post('/api/ride-requests', formData);
      
      console.log('Ride request created:', response.data);
      setSuccess('Ride request posted successfully! Drivers will be able to see your request and contact you.');
      setFormData({
        from: '',
        to: '',
        fromCoordinates: null,
        toCoordinates: null,
        preferredDate: '',
        preferredTime: '',
        maxPricePerSeat: '',
        seatsNeeded: 1,
        description: ''
      });
    } catch (err) {
      console.error('Error creating ride request:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to create ride request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', color: 'white' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          <i className="fas fa-hand-paper"></i> Request a Ride
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
          Date: {formData.preferredDate ? '✓ ' + formData.preferredDate : '❌ Empty'}
          <br />
          Time: {formData.preferredTime ? '✓ ' + formData.preferredTime : '❌ Empty'}
          <br />
          Max Price: {formData.maxPricePerSeat ? '✓ Rs. ' + formData.maxPricePerSeat : '❌ Empty'}
          <br />
          Seats: {formData.seatsRequired ? '✓ ' + formData.seatsRequired : '1 (default)'}
        </div>
        
        <div style={{ 
          background: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <i className="fas fa-info-circle" style={{ fontSize: '2rem', marginBottom: '10px', color: '#3b82f6' }}></i>
          <h4>How it works</h4>
          <p>Post your ride request with your preferred route, time, and budget. Drivers will see your request and can offer you a ride!</p>
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
                  <i className="fas fa-map-marker-alt"></i> From (Where you are) * 
                  {formData.from && <span style={{ color: '#28a745', marginLeft: '10px' }}>✓</span>}
                </label>
                <StableOSMPicker 
                  onLocationSelect={handleLocationSelect('from')}
                  placeholder="Select your pickup location"
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
                  <i className="fas fa-flag-checkered"></i> To (Where you want to go) * 
                  {formData.to && <span style={{ color: '#28a745', marginLeft: '10px' }}>✓</span>}
                </label>
                <StableOSMPicker 
                  onLocationSelect={handleLocationSelect('to')}
                  placeholder="Select your destination"
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
                <label htmlFor="preferredDate">
                  <i className="fas fa-calendar"></i> Preferred Date * 
                  {formData.preferredDate && <span style={{ color: '#28a745', marginLeft: '10px' }}>✓</span>}
                </label>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="preferredTime">
                  <i className="fas fa-clock"></i> Preferred Time * 
                  {formData.preferredTime && <span style={{ color: '#28a745', marginLeft: '10px' }}>✓</span>}
                </label>
                <input
                  type="time"
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
            </div>

            {/* Ride Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label htmlFor="seatsNeeded">
                  <i className="fas fa-users"></i> Seats Needed * 
                  {formData.seatsNeeded && <span style={{ color: '#28a745', marginLeft: '10px' }}>✓</span>}
                </label>
                <select
                  id="seatsNeeded"
                  name="seatsNeeded"
                  value={formData.seatsNeeded}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value={1}>1 seat</option>
                  <option value={2}>2 seats</option>
                  <option value={3}>3 seats</option>
                  <option value={4}>4 seats</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="maxPricePerSeat">
                  <i className="fas fa-rupee-sign"></i> Max Price per Seat * 
                  {formData.maxPricePerSeat && <span style={{ color: '#28a745', marginLeft: '10px' }}>✓</span>}
                </label>
                {distance > 0 && (
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    Distance: {distance} km | Suggested Fare: Rs. {suggestedFare}
                  </div>
                )}
                <input
                  type="number"
                  id="maxPricePerSeat"
                  name="maxPricePerSeat"
                  value={formData.maxPricePerSeat}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder={distance > 0 ? `Suggested: Rs. ${suggestedFare}` : "e.g., Rs. 20.00"}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="description">
                <i className="fas fa-comment"></i> Additional Notes
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Any special requests, flexible timing, or additional information for drivers..."
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

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '20px', fontSize: '18px', padding: '15px' }} 
              disabled={loading}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Posting Request...</>
              ) : (
                <><i className="fas fa-hand-paper"></i> Post Ride Request</>
              )}
            </button>

            {/* Debug Panel */}
            <div style={{
              marginTop: '30px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <h5 style={{ marginBottom: '15px', color: '#495057' }}>
                <i className="fas fa-bug"></i> Form Debug Info
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div>
                  <strong>From:</strong> 
                  <span style={{ color: formData.from ? '#28a745' : '#dc3545', marginLeft: '5px' }}>
                    {formData.from ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
                <div>
                  <strong>To:</strong> 
                  <span style={{ color: formData.to ? '#28a745' : '#dc3545', marginLeft: '5px' }}>
                    {formData.to ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
                <div>
                  <strong>Date:</strong> 
                  <span style={{ color: formData.preferredDate ? '#28a745' : '#dc3545', marginLeft: '5px' }}>
                    {formData.preferredDate ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
                <div>
                  <strong>Time:</strong> 
                  <span style={{ color: formData.preferredTime ? '#28a745' : '#dc3545', marginLeft: '5px' }}>
                    {formData.preferredTime ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
                <div>
                  <strong>Seats:</strong> 
                  <span style={{ color: formData.seatsNeeded ? '#28a745' : '#dc3545', marginLeft: '5px' }}>
                    {formData.seatsNeeded ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
                <div>
                  <strong>Max Price:</strong> 
                  <span style={{ color: formData.maxPricePerSeat ? '#28a745' : '#dc3545', marginLeft: '5px' }}>
                    {formData.maxPricePerSeat ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#6c757d' }}>
                Form valid: {isFormValid() ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRideRequest;

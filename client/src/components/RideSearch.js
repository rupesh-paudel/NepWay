import React, { useState, useEffect } from 'react';
import api from '../api/config';
import LocationPicker from './LocationPicker';

const RideSearch = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user info
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const response = await api.get('/api/rides');
      setRides(response.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookRide = async (rideId) => {
    try {
      await api.post(`/api/rides/${rideId}/book`);
      alert('Ride booked successfully!');
      fetchRides(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to book ride');
    }
  };

  const filteredRides = rides.filter(ride => {
    const fromMatch = searchFrom === '' || ride.from.toLowerCase().includes(searchFrom.toLowerCase());
    const toMatch = searchTo === '' || ride.to.toLowerCase().includes(searchTo.toLowerCase());
    return fromMatch && toMatch;
  });

  if (loading) {
    return <div className="text-center" style={{color: 'white', padding: '40px'}}>Loading rides...</div>;
  }

  return (
    <div style={{ padding: '40px 20px', color: 'white' }}>
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          <i className="fas fa-search"></i> Find Available Rides
        </h2>

        {/* Search Filters */}
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '30px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>From:</label>
            <LocationPicker 
              onLocationSelect={setSearchFrom}
              placeholder="Enter pickup location"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>To:</label>
            <LocationPicker 
              onLocationSelect={setSearchTo}
              placeholder="Enter destination"
            />
          </div>
        </div>

        {/* Rides List */}
        {filteredRides.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#666' }}>
            <i className="fas fa-car" style={{ fontSize: '3rem', marginBottom: '20px', color: '#ddd' }}></i>
            <h3>No rides available</h3>
            <p>Try different search criteria or check back later.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {filteredRides
              .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
              .map((ride) => (
              <div key={ride._id} className="card" style={{ padding: '25px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: '#1f2937', marginBottom: '10px' }}>
                      <i className="fas fa-route"></i> {ride.from} → {ride.to}
                    </h4>
                    <p style={{ color: '#6b7280', marginBottom: '5px' }}>
                      <i className="fas fa-user"></i> Driver: {ride.driver?.name}
                    </p>
                    <p style={{ color: '#6b7280' }}>
                      <i className="fas fa-envelope"></i> {ride.driver?.email}
                    </p>
                  </div>
                  
                  <div>
                    <p style={{ color: '#1f2937', marginBottom: '5px' }}>
                      <i className="fas fa-calendar"></i> {new Date(ride.date).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#1f2937' }}>
                      <i className="fas fa-clock"></i> {ride.time}
                    </p>
                  </div>
                  
                  <div>
                    <p style={{ color: '#1f2937', marginBottom: '5px' }}>
                      <i className="fas fa-users"></i> {ride.availableSeats - ride.passengers.length} seats available
                    </p>
                    <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '18px' }}>
                      <i className="fas fa-rupee-sign"></i>Rs. {ride.pricePerSeat}/seat
                    </p>
                  </div>
                  
                  <div>
                    {currentUser && ride.driver._id === currentUser.id ? (
                      // Show message for own ride
                      <div style={{ 
                        textAlign: 'center',
                        padding: '12px 20px',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '8px',
                        border: '1px solid #fcd34d'
                      }}>
                        <i className="fas fa-car"></i> Your ride offer
                        <br />
                        <small>You cannot book your own ride</small>
                      </div>
                    ) : (
                      // Show book button for other users' rides
                      <button 
                        onClick={() => bookRide(ride._id)}
                        className="btn btn-primary"
                        disabled={ride.availableSeats - ride.passengers.length === 0}
                        style={{ width: '100%' }}
                      >
                        {ride.availableSeats - ride.passengers.length === 0 ? 'Full' : 'Book Ride'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideSearch;

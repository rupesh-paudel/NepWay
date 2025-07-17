import React, { useState, useEffect } from 'react';
import api from '../api/config';
import RideStatusTracker from './RideStatusTracker';
import RatingsReviews from './RatingsReviews';

const MyBookings = () => {
  const [bookings, setBookings] = useState({ asDriver: [], asPassenger: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('passenger');
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [ratingUser, setRatingUser] = useState(null);
  const [userRole, setUserRole] = useState('passenger');

  useEffect(() => {
    fetchMyRides();
  }, []);

  const fetchMyRides = async () => {
    try {
      const response = await api.get('/api/rides/my-rides');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelRide = async (rideId) => {
    if (window.confirm('Are you sure you want to cancel this ride?')) {
      try {
        await api.patch(`/api/rides/${rideId}/cancel`);
        alert('Ride cancelled successfully');
        fetchMyRides();
      } catch (error) {
        alert('Failed to cancel ride');
      }
    }
  };

  const updateRideStatus = async (rideId, newStatus) => {
    try {
      await api.patch(`/api/rides/${rideId}/status`, { status: newStatus });
      fetchMyRides(); // Refresh data
      alert('Ride status updated successfully!');
    } catch (error) {
      console.error('Error updating ride status:', error);
      alert('Failed to update ride status');
    }
  };

  const openRatingModal = (ride, targetUser, role) => {
    setSelectedRide(ride);
    setRatingUser(targetUser);
    setUserRole(role);
    setShowRating(true);
  };

  const closeRatingModal = () => {
    setShowRating(false);
    setSelectedRide(null);
    setRatingUser(null);
    fetchMyRides(); // Refresh to show any changes
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'active': '#f59e0b',
      'driver_assigned': '#3b82f6',
      'driver_arrived': '#8b5cf6',
      'ride_started': '#06b6d4',
      'ride_completed': '#16a34a',
      'cancelled': '#ef4444',
      'expired': '#6b7280'
    };
    return statusColors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'active': 'Active',
      'driver_assigned': 'Driver Assigned',
      'driver_arrived': 'Driver Arrived',
      'ride_started': 'Ride Started',
      'ride_completed': 'Completed',
      'cancelled': 'Cancelled',
      'expired': 'Expired'
    };
    return statusTexts[status] || status;
  };

  if (loading) {
    return <div className="text-center" style={{color: 'white', padding: '40px'}}>Loading your bookings...</div>;
  }

  return (
    <div style={{ padding: '40px 20px', color: 'white' }}>
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          <i className="fas fa-calendar-alt"></i> My Bookings & Rides
        </h2>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '30px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '8px'
        }}>
          <button
            onClick={() => setActiveTab('passenger')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'passenger' ? '#4f46e5' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            <i className="fas fa-user"></i> As Passenger ({bookings.asPassenger.length})
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'driver' ? '#4f46e5' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <i className="fas fa-car"></i> As Driver ({bookings.asDriver.length})
          </button>
        </div>

        {/* Passenger Rides */}
        {activeTab === 'passenger' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>
              <i className="fas fa-user"></i> Rides I've Booked
            </h3>
            {bookings.asPassenger.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: '#666' }}>
                <i className="fas fa-calendar-times" style={{ fontSize: '3rem', marginBottom: '20px', color: '#ddd' }}></i>
                <h3>No bookings yet</h3>
                <p>You haven't booked any rides. Search for rides to get started!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {bookings.asPassenger
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
                        <p style={{ color: '#1f2937', marginBottom: '5px' }}>
                          <i className="fas fa-clock"></i> {ride.time}
                        </p>
                        <p style={{ 
                          color: getStatusColor(ride.status), 
                          fontWeight: '600',
                          fontSize: '14px'
                        }}>
                          <i className="fas fa-info-circle"></i> {getStatusText(ride.status)}
                        </p>
                      </div>
                      
                      <div>
                        <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '18px' }}>
                          <i className="fas fa-rupee-sign"></i>Rs. {ride.pricePerSeat}
                        </p>
                        {ride.status === 'ride_completed' && (
                          <button
                            onClick={() => openRatingModal(ride, ride.driver, 'passenger')}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              marginTop: '8px'
                            }}
                          >
                            <i className="fas fa-star"></i> Rate Driver
                          </button>
                        )}
                      </div>
                      
                      <div>
                        {(ride.status === 'active' || ride.status === 'driver_assigned') && (
                          <button 
                            onClick={() => cancelRide(ride._id)}
                            className="btn"
                            style={{ 
                              background: '#dc2626', 
                              color: 'white', 
                              width: '100%',
                              marginBottom: '8px'
                            }}
                          >
                            <i className="fas fa-times"></i> Cancel Ride
                          </button>
                        )}
                        {ride.status !== 'cancelled' && ride.status !== 'expired' && (
                          <RideStatusTracker
                            rideId={ride._id}
                            userRole="passenger"
                            onStatusUpdate={() => fetchMyRides()}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Driver Rides */}
        {activeTab === 'driver' && (
          <div>
            <h3 style={{ marginBottom: '20px' }}>
              <i className="fas fa-car"></i> Rides I'm Offering
            </h3>
            {bookings.asDriver.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: '#666' }}>
                <i className="fas fa-car-side" style={{ fontSize: '3rem', marginBottom: '20px', color: '#ddd' }}></i>
                <h3>No rides posted</h3>
                <p>You haven't posted any rides yet. Create a ride to start earning!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {bookings.asDriver
                  .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                  .map((ride) => (
                  <div key={ride._id} className="card" style={{ padding: '25px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: '#1f2937', marginBottom: '10px' }}>
                          <i className="fas fa-route"></i> {ride.from} → {ride.to}
                        </h4>
                        <p style={{ color: '#6b7280' }}>
                          <i className="fas fa-users"></i> {ride.passengers.length}/{ride.availableSeats} passengers
                        </p>
                      </div>
                      
                      <div>
                        <p style={{ color: '#1f2937', marginBottom: '5px' }}>
                          <i className="fas fa-calendar"></i> {new Date(ride.date).toLocaleDateString()}
                        </p>
                        <p style={{ color: '#1f2937', marginBottom: '5px' }}>
                          <i className="fas fa-clock"></i> {ride.time}
                        </p>
                        <p style={{ 
                          color: getStatusColor(ride.status), 
                          fontWeight: '600',
                          fontSize: '14px'
                        }}>
                          <i className="fas fa-info-circle"></i> {getStatusText(ride.status)}
                        </p>
                      </div>
                      
                      <div>
                        <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '18px' }}>
                          <i className="fas fa-rupee-sign"></i>Rs. {ride.pricePerSeat}/seat
                        </p>
                        <p style={{ color: '#16a34a', fontWeight: '500' }}>
                          Total: Rs. {ride.pricePerSeat * ride.passengers.length}
                        </p>
                        {ride.status === 'ride_completed' && ride.passengers.length > 0 && (
                          <button
                            onClick={() => openRatingModal(ride, ride.passengers[0], 'driver')}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              marginTop: '8px'
                            }}
                          >
                            <i className="fas fa-star"></i> Rate Passengers
                          </button>
                        )}
                      </div>
                      
                      <div>
                        {(ride.status === 'active' || ride.status === 'driver_assigned') && (
                          <button 
                            onClick={() => cancelRide(ride._id)}
                            className="btn"
                            style={{ 
                              background: '#dc2626', 
                              color: 'white', 
                              width: '100%',
                              marginBottom: '8px'
                            }}
                          >
                            <i className="fas fa-times"></i> Cancel Ride
                          </button>
                        )}
                        {ride.status !== 'cancelled' && ride.status !== 'expired' && (
                          <RideStatusTracker
                            rideId={ride._id}
                            userRole="driver"
                            onStatusUpdate={() => fetchMyRides()}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Passenger List */}
                    {ride.passengers.length > 0 && (
                      <div style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
                        <h5 style={{ color: '#1f2937', marginBottom: '10px' }}>Passengers:</h5>
                        {ride.passengers.map((passenger, index) => (
                          <p key={index} style={{ color: '#6b7280', margin: '5px 0' }}>
                            <i className="fas fa-user"></i> {passenger.name} - {passenger.email}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRating && selectedRide && ratingUser && (
        <RatingsReviews
          rideId={selectedRide._id}
          userToRate={ratingUser}
          userRole={userRole}
          onClose={closeRatingModal}
        />
      )}
    </div>
  );
};

export default MyBookings;

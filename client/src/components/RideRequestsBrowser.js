import React, { useState, useEffect } from 'react';
import api from '../api/config';

const RideRequestsBrowser = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingRequest, setAcceptingRequest] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user info
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    fetchRideRequests();
    
    // Auto-refresh every 30 seconds to show updated ride requests
    const refreshInterval = setInterval(() => {
      fetchRideRequests();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchRideRequests = async () => {
    try {
      const response = await api.get('/api/ride-requests');
      setRequests(response.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching ride requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    setAcceptingRequest(requestId);
    try {
      const response = await api.post(`/api/ride-requests/${requestId}/accept`);
      
      // Show success message with more details
      const message = response.data?.message || 'Ride request accepted successfully!';
      alert(`✅ ${message}\n\nA new ride has been created and the passenger will be notified. You can view your rides in the "My Bookings" section.`);
      
      // Refresh the list to remove the accepted request
      fetchRideRequests();
    } catch (error) {
      console.error('Error accepting ride request:', error);
      
      // Show specific error message
      const errorMessage = error.response?.data?.error || 'Failed to accept ride request';
      
      if (errorMessage.includes('no longer available') || errorMessage.includes('already been accepted')) {
        alert(`❌ ${errorMessage}\n\nThis ride request was just accepted by another driver. The list will be refreshed.`);
        fetchRideRequests(); // Refresh to show updated list
      } else if (errorMessage.includes('Only drivers')) {
        alert(`❌ ${errorMessage}\n\nPlease make sure you're logged in as a driver.`);
      } else {
        alert(`❌ ${errorMessage}\n\nPlease try again in a moment.`);
      }
    } finally {
      setAcceptingRequest(null);
    }
  };

  const calculateDistance = (from, to) => {
    // This is a simplified distance calculation
    // In a real app, you'd use Google Maps Distance Matrix API
    if (from && to) {
      const lat1 = from.lat;
      const lon1 = from.lng;
      const lat2 = to.lat;
      const lon2 = to.lng;
      
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c; // Distance in km
      return Math.round(d);
    }
    return null;
  };

  if (loading) {
    return <div className="text-center" style={{color: 'white', padding: '40px'}}>Loading ride requests...</div>;
  }

  return (
    <div style={{ padding: '40px 20px', color: 'white' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>
            <i className="fas fa-hand-paper"></i> Ride Requests from Passengers
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <small style={{ color: '#94a3b8', fontSize: '14px' }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </small>
            <button
              onClick={fetchRideRequests}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Refreshing...</>
              ) : (
                <><i className="fas fa-sync-alt"></i> Refresh</>
              )}
            </button>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <i className="fas fa-car" style={{ fontSize: '2rem', marginBottom: '10px', color: '#10b981' }}></i>
          <h4>Help passengers reach their destination!</h4>
          <p>Browse ride requests from passengers and offer them a ride. You can create a new ride or add them to an existing one.</p>
        </div>

        {requests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#666' }}>
            <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '20px', color: '#ddd' }}></i>
            <h3>No ride requests available</h3>
            <p>Check back later for new ride requests from passengers.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {requests
              .sort((a, b) => new Date(b.createdAt || b.requestDate) - new Date(a.createdAt || a.requestDate))
              .map((request) => (
              <div key={request._id} className="card" style={{ padding: '25px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  {/* Passenger Info */}
                  <div>
                    <h4 style={{ color: '#1f2937', marginBottom: '10px' }}>
                      <i className="fas fa-user"></i> {request.passenger?.name}
                    </h4>
                    <p style={{ color: '#6b7280', marginBottom: '5px' }}>
                      <i className="fas fa-envelope"></i> {request.passenger?.email}
                    </p>
                    <p style={{ color: '#6b7280' }}>
                      <i className="fas fa-users"></i> Needs {request.seatsNeeded} seat{request.seatsNeeded > 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Route Info */}
                  <div>
                    <h5 style={{ color: '#1f2937', marginBottom: '10px' }}>
                      <i className="fas fa-route"></i> Route
                    </h5>
                    <p style={{ color: '#6b7280', marginBottom: '5px' }}>
                      <strong>From:</strong> {request.from}
                    </p>
                    <p style={{ color: '#6b7280', marginBottom: '5px' }}>
                      <strong>To:</strong> {request.to}
                    </p>
                    {request.fromCoordinates && request.toCoordinates && (
                      <p style={{ color: '#6b7280' }}>
                        <i className="fas fa-road"></i> ~{calculateDistance(request.fromCoordinates, request.toCoordinates)} km
                      </p>
                    )}
                  </div>

                  {/* Time & Budget */}
                  <div>
                    <h5 style={{ color: '#1f2937', marginBottom: '10px' }}>
                      <i className="fas fa-clock"></i> Timing & Budget
                    </h5>
                    <p style={{ color: '#6b7280', marginBottom: '5px' }}>
                      <i className="fas fa-calendar"></i> {new Date(request.preferredDate).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#6b7280', marginBottom: '5px' }}>
                      <i className="fas fa-clock"></i> {request.preferredTime}
                    </p>
                    <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '16px' }}>
                      <i className="fas fa-rupee-sign"></i>Rs. {request.maxPricePerSeat}/seat (max)
                    </p>
                    <p style={{ color: '#16a34a', fontWeight: '500' }}>
                      Total: Rs. {(request.maxPricePerSeat * request.seatsNeeded).toFixed(2)}
                    </p>
                  </div>

                  {/* Action */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentUser && request.passenger._id === currentUser.id ? (
                      // Show message for own request
                      <div style={{ 
                        textAlign: 'center',
                        padding: '12px 20px',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '8px',
                        border: '1px solid #fcd34d'
                      }}>
                        <i className="fas fa-info-circle"></i> This is your request
                        <br />
                        <small>Wait for other drivers to accept</small>
                      </div>
                    ) : (
                      // Show accept button for other users' requests
                      <button 
                        onClick={() => acceptRequest(request._id)}
                        className="btn btn-primary"
                        disabled={acceptingRequest === request._id}
                        style={{ 
                          width: '100%',
                          fontSize: '16px',
                          padding: '12px 20px'
                        }}
                      >
                        {acceptingRequest === request._id ? (
                          <><i className="fas fa-spinner fa-spin"></i> Accepting...</>
                        ) : (
                          <><i className="fas fa-handshake"></i> Accept Request</>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                {request.description && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    background: '#f9fafb', 
                    borderRadius: '8px' 
                  }}>
                    <h6 style={{ color: '#1f2937', marginBottom: '8px' }}>
                      <i className="fas fa-comment"></i> Additional Notes:
                    </h6>
                    <p style={{ color: '#6b7280', margin: 0 }}>{request.description}</p>
                  </div>
                )}

                {/* Request Time */}
                <div style={{ 
                  marginTop: '15px', 
                  padding: '10px 0', 
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <i className="fas fa-clock"></i> Requested {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideRequestsBrowser;

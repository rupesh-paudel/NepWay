import React, { useState, useEffect } from 'react';
import api from '../api/config';

const MyRideRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRideRequests();
  }, []);

  const fetchMyRideRequests = async () => {
    try {
      const response = await api.get('/api/ride-requests/my-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching my ride requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this ride request?')) {
      try {
        await api.patch(`/api/ride-requests/${requestId}/cancel`);
        alert('Ride request cancelled successfully');
        fetchMyRideRequests();
      } catch (error) {
        alert('Failed to cancel ride request');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'fa-clock';
      case 'accepted': return 'fa-check-circle';
      case 'completed': return 'fa-flag-checkered';
      case 'cancelled': return 'fa-times-circle';
      default: return 'fa-question-circle';
    }
  };

  if (loading) {
    return <div className="text-center" style={{color: 'white', padding: '40px'}}>Loading your ride requests...</div>;
  }

  return (
    <div style={{ padding: '40px 20px', color: 'white' }}>
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          <i className="fas fa-list"></i> My Ride Requests
        </h2>

        {requests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#666' }}>
            <i className="fas fa-hand-paper" style={{ fontSize: '3rem', marginBottom: '20px', color: '#ddd' }}></i>
            <h3>No ride requests yet</h3>
            <p>You haven't posted any ride requests. Create one to find a driver!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {requests
              .sort((a, b) => new Date(b.createdAt || b.requestDate) - new Date(a.createdAt || a.requestDate))
              .map((request) => (
              <div key={request._id} className="card" style={{ padding: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h4 style={{ color: '#1f2937', margin: 0 }}>
                    <i className="fas fa-route"></i> {request.from} → {request.to}
                  </h4>
                  <span style={{ 
                    color: getStatusColor(request.status),
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <i className={`fas ${getStatusIcon(request.status)}`}></i>
                    {request.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  {/* Trip Details */}
                  <div>
                    <h6 style={{ color: '#1f2937', marginBottom: '10px' }}>Trip Details</h6>
                    <p style={{ color: '#6b7280', marginBottom: '5px' }}>
                      <i className="fas fa-calendar"></i> {new Date(request.preferredDate).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#6b7280', marginBottom: '5px' }}>
                      <i className="fas fa-clock"></i> {request.preferredTime}
                    </p>
                    <p style={{ color: '#6b7280' }}>
                      <i className="fas fa-users"></i> {request.seatsNeeded} seat{request.seatsNeeded > 1 ? 's' : ''} needed
                    </p>
                  </div>

                  {/* Budget */}
                  <div>
                    <h6 style={{ color: '#1f2937', marginBottom: '10px' }}>Budget</h6>
                    <p style={{ color: '#16a34a', fontWeight: '600', fontSize: '18px' }}>
                      <i className="fas fa-rupee-sign"></i>Rs. {request.maxPricePerSeat}/seat (max)
                    </p>
                    <p style={{ color: '#16a34a', fontWeight: '500' }}>
                      Total budget: Rs. {(request.maxPricePerSeat * request.seatsNeeded).toFixed(2)}
                    </p>
                  </div>

                  {/* Driver Info (if accepted) */}
                  {request.status === 'accepted' && request.acceptedBy && (
                    <div>
                      <h6 style={{ color: '#1f2937', marginBottom: '10px' }}>
                        <i className="fas fa-user-check"></i> Accepted by Driver
                      </h6>
                      <p style={{ color: '#6b7280', marginBottom: '5px' }}>
                        <strong>Name:</strong> {request.acceptedBy.name}
                      </p>
                      <p style={{ color: '#6b7280' }}>
                        <strong>Email:</strong> {request.acceptedBy.email}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {request.status === 'pending' && (
                      <button 
                        onClick={() => cancelRequest(request._id)}
                        className="btn"
                        style={{ 
                          background: '#ef4444', 
                          color: 'white',
                          width: '100%'
                        }}
                      >
                        <i className="fas fa-times"></i> Cancel Request
                      </button>
                    )}
                    {request.status === 'accepted' && (
                      <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ 
                          background: '#dcfce7', 
                          color: '#16a34a',
                          padding: '12px',
                          borderRadius: '8px',
                          fontWeight: '600'
                        }}>
                          <i className="fas fa-check-circle"></i> Request Accepted!
                        </div>
                        <small style={{ color: '#6b7280', marginTop: '8px', display: 'block' }}>
                          The driver will contact you soon
                        </small>
                      </div>
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
                      <i className="fas fa-comment"></i> Your Notes:
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
                  <i className="fas fa-clock"></i> Posted {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRideRequests;

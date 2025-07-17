import React, { useState, useEffect } from 'react';
import api from '../api/config';

const RideStatusTracker = ({ rideId, userRole, onStatusUpdate }) => {
  const [rideStatus, setRideStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRideStatus();
    // Poll for status updates every 30 seconds
    const interval = setInterval(fetchRideStatus, 30000);
    return () => clearInterval(interval);
  }, [rideId]);

  const fetchRideStatus = async () => {
    try {
      const response = await api.get(`/api/rides/${rideId}/status`);
      setRideStatus(response.data);
      if (onStatusUpdate) {
        onStatusUpdate(response.data);
      }
    } catch (error) {
      console.error('Error fetching ride status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRideStatus = async (newStatus) => {
    if (userRole !== 'driver') return;

    setUpdating(true);
    try {
      const response = await api.patch(`/api/rides/${rideId}/status`, {
        status: newStatus
      });
      
      setRideStatus(response.data);
      if (onStatusUpdate) {
        onStatusUpdate(response.data);
      }
    } catch (error) {
      console.error('Error updating ride status:', error);
      alert('Failed to update ride status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'active': { 
        icon: 'fa-clock', 
        color: '#f59e0b', 
        text: 'Ride Requested',
        description: 'Looking for passengers or waiting for ride confirmation'
      },
      'driver_assigned': { 
        icon: 'fa-user-check', 
        color: '#3b82f6', 
        text: 'Driver Assigned',
        description: 'Driver has been assigned and is on the way'
      },
      'driver_arrived': { 
        icon: 'fa-map-marker-alt', 
        color: '#8b5cf6', 
        text: 'Driver Arrived',
        description: 'Driver has arrived at pickup location'
      },
      'ride_started': { 
        icon: 'fa-road', 
        color: '#06b6d4', 
        text: 'Ride Started',
        description: 'Currently on the way to destination'
      },
      'ride_completed': { 
        icon: 'fa-flag-checkered', 
        color: '#16a34a', 
        text: 'Ride Completed',
        description: 'Ride has been successfully completed'
      },
      'cancelled': { 
        icon: 'fa-times-circle', 
        color: '#ef4444', 
        text: 'Ride Cancelled',
        description: 'Ride was cancelled'
      }
    };
    return statusMap[status] || { icon: 'fa-question', color: '#6b7280', text: 'Unknown', description: '' };
  };

  const getNextAction = (currentStatus) => {
    if (userRole !== 'driver') return null;

    const actionMap = {
      'active': { status: 'driver_assigned', text: 'Confirm Pickup', icon: 'fa-check' },
      'driver_assigned': { status: 'driver_arrived', text: 'Mark as Arrived', icon: 'fa-map-marker-alt' },
      'driver_arrived': { status: 'ride_started', text: 'Start Ride', icon: 'fa-play' },
      'ride_started': { status: 'ride_completed', text: 'Complete Ride', icon: 'fa-flag-checkered' }
    };
    return actionMap[currentStatus];
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <i className="fas fa-spinner fa-spin"></i> Loading ride status...
      </div>
    );
  }

  if (!rideStatus) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
        <i className="fas fa-exclamation-triangle"></i> Unable to load ride status
      </div>
    );
  }

  const statusInfo = getStatusInfo(rideStatus.status);
  const nextAction = getNextAction(rideStatus.status);

  return (
    <div className="card" style={{ margin: '20px 0' }}>
      <h4 style={{ marginBottom: '20px', textAlign: 'center' }}>
        <i className="fas fa-route"></i> Ride Status Tracker
      </h4>

      {/* Current Status */}
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        backgroundColor: `${statusInfo.color}20`,
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <i 
          className={`fas ${statusInfo.icon}`} 
          style={{ 
            fontSize: '3rem', 
            color: statusInfo.color, 
            marginBottom: '10px' 
          }}
        ></i>
        <h3 style={{ margin: '10px 0', color: statusInfo.color }}>
          {statusInfo.text}
        </h3>
        <p style={{ margin: 0, color: '#6b7280' }}>
          {statusInfo.description}
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {['active', 'driver_assigned', 'driver_arrived', 'ride_started', 'ride_completed'].map((status, index) => {
            const info = getStatusInfo(status);
            const isCompleted = ['active', 'driver_assigned', 'driver_arrived', 'ride_started', 'ride_completed']
              .indexOf(rideStatus.status) >= index;
            const isCurrent = rideStatus.status === status;
            
            return (
              <div key={status} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? info.color : '#e5e7eb',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  border: isCurrent ? `3px solid ${info.color}` : 'none',
                  boxSizing: 'border-box'
                }}>
                  <i className={`fas ${info.icon}`} style={{ fontSize: '14px' }}></i>
                </div>
                <small style={{ 
                  color: isCompleted ? info.color : '#6b7280',
                  fontWeight: isCurrent ? 'bold' : 'normal'
                }}>
                  {info.text.split(' ')[0]}
                </small>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Actions */}
      {userRole === 'driver' && nextAction && rideStatus.status !== 'ride_completed' && rideStatus.status !== 'cancelled' && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => updateRideStatus(nextAction.status)}
            disabled={updating}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: updating ? 'not-allowed' : 'pointer',
              opacity: updating ? 0.7 : 1
            }}
          >
            {updating ? (
              <><i className="fas fa-spinner fa-spin"></i> Updating...</>
            ) : (
              <><i className={`fas ${nextAction.icon}`}></i> {nextAction.text}</>
            )}
          </button>
        </div>
      )}

      {/* Ride Details */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h6 style={{ marginBottom: '10px', color: '#1f2937' }}>Ride Information</h6>
        <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
          <div><strong>From:</strong> {rideStatus.from}</div>
          <div><strong>To:</strong> {rideStatus.to}</div>
          <div><strong>Date:</strong> {new Date(rideStatus.date).toLocaleDateString()}</div>
          <div><strong>Time:</strong> {rideStatus.time}</div>
          <div><strong>Price:</strong> Rs. {rideStatus.pricePerSeat}/seat</div>
          {rideStatus.estimatedDuration && (
            <div><strong>Estimated Duration:</strong> {rideStatus.estimatedDuration} minutes</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideStatusTracker;

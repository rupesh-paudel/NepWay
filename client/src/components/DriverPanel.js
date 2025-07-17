import React, { useState, useEffect } from 'react';
import api from '../api/config';

const DriverPanel = () => {
  const [driverStats, setDriverStats] = useState({
    totalEarnings: 0,
    totalRides: 0,
    averageRating: 0,
    todayEarnings: 0,
    activeRides: 0
  });
  const [availability, setAvailability] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverData();
    getCurrentLocation();
  }, []);

  const fetchDriverData = async () => {
    try {
      const [statsResponse, availabilityResponse, notificationsResponse] = await Promise.all([
        api.get('/api/drivers/stats'),
        api.get('/api/drivers/availability'),
        api.get('/api/notifications')
      ]);

      setDriverStats(statsResponse.data);
      setAvailability(availabilityResponse.data.isAvailable);
      setNotifications(notificationsResponse.data);
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const toggleAvailability = async () => {
    try {
      const response = await api.patch('/api/drivers/availability', {
        isAvailable: !availability,
        location: currentLocation
      });
      
      setAvailability(response.data.isAvailable);
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', color: 'white', textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '20px' }}></i>
        <p>Loading driver panel...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', color: 'white' }}>
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          <i className="fas fa-tachometer-alt"></i> Driver Dashboard
        </h2>

        {/* Availability Toggle */}
        <div className="card" style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '20px' }}>
            <i className="fas fa-toggle-on"></i> Driver Status
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '1.2rem', marginRight: '15px' }}>
              {availability ? '🟢 Online' : '🔴 Offline'}
            </span>
            <button
              onClick={toggleAvailability}
              style={{
                padding: '12px 24px',
                backgroundColor: availability ? '#ef4444' : '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              {availability ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
          <small style={{ color: '#6b7280' }}>
            {availability ? 'You are available to receive ride requests' : 'Turn online to start receiving rides'}
          </small>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #16a34a, #15803d)' }}>
            <i className="fas fa-rupee-sign" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>Rs. {driverStats.totalEarnings}</h3>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Total Earnings</p>
          </div>

          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <i className="fas fa-car" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{driverStats.totalRides}</h3>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Total Rides</p>
          </div>

          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <i className="fas fa-star" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{driverStats.averageRating.toFixed(1)}</h3>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Rating</p>
          </div>

          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <i className="fas fa-calendar-day" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>Rs. {driverStats.todayEarnings}</h3>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Today's Earnings</p>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>
            <i className="fas fa-bell"></i> Recent Notifications
          </h3>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
              <i className="fas fa-inbox" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
              <p>No new notifications</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification._id}
                  style={{
                    padding: '15px',
                    backgroundColor: notification.isRead ? '#f9fafb' : '#eff6ff',
                    borderRadius: '8px',
                    border: notification.isRead ? '1px solid #e5e7eb' : '1px solid #3b82f6'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <h6 style={{ margin: 0, color: '#1f2937' }}>{notification.title}</h6>
                    <small style={{ color: '#6b7280' }}>
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginTop: '30px' 
        }}>
          <div className="card">
            <h4><i className="fas fa-clock"></i> Earnings This Week</h4>
            <div style={{ fontSize: '1.5rem', color: '#16a34a', fontWeight: 'bold' }}>
              Rs. {(driverStats.todayEarnings * 7).toFixed(0)}
            </div>
            <small style={{ color: '#6b7280' }}>Estimated based on today's performance</small>
          </div>

          <div className="card">
            <h4><i className="fas fa-route"></i> Active Rides</h4>
            <div style={{ fontSize: '1.5rem', color: '#3b82f6', fontWeight: 'bold' }}>
              {driverStats.activeRides}
            </div>
            <small style={{ color: '#6b7280' }}>Currently in progress</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPanel;

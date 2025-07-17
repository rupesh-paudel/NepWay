import React, { useState } from 'react';
import CreateRide from './CreateRide';
import RideSearch from './RideSearch';
import MyBookings from './MyBookings';
import ProfileSettings from './ProfileSettings';
import CreateRideRequest from './CreateRideRequest';
import RideRequestsBrowser from './RideRequestsBrowser';
import MyRideRequests from './MyRideRequests';
import DriverPanel from './DriverPanel';
import RatingsReviews from './RatingsReviews';
import RideStatusTracker from './RideStatusTracker';

const Dashboard = ({ user, onUpdateUser }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const isDriver = user?.role === 'driver';

  if (activeView === 'create-ride' && isDriver) {
    return (
      <div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
        <CreateRide />
      </div>
    );
  }

  if (activeView === 'create-ride-request') {
    return (
      <div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
        <CreateRideRequest />
      </div>
    );
  }

  if (activeView === 'browse-ride-requests' && isDriver) {
    return (
      <div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
        <RideRequestsBrowser />
      </div>
    );
  }

  if (activeView === 'my-ride-requests') {
    return (
      <div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
        <MyRideRequests />
      </div>
    );
  }

  if (activeView === 'search-rides') {
    return (
      <div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
        <RideSearch />
      </div>
    );
  }

  if (activeView === 'my-bookings') {
    return (
      <div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
        <MyBookings />
      </div>
    );
  }

  if (activeView === 'profile-settings') {
    return (
      <div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
        <ProfileSettings user={user} onUpdateUser={onUpdateUser} />
      </div>
    );
  }

  if (activeView === 'driver-panel' && isDriver) {
    return (
      <div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            onClick={() => setActiveView('dashboard')} 
            className="btn btn-secondary"
            style={{ marginBottom: '20px' }}
          >
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
        <DriverPanel />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>
            <i className={`fas ${isDriver ? 'fa-car' : 'fa-map-marked-alt'}`}></i> 
            {isDriver ? 'Driver Dashboard' : 'General User Dashboard'}
          </h1>
          <p>Welcome back, {user?.name}! Ready to {isDriver ? 'give rides' : 'find a ride'}?</p>
        </div>

        <div className="dashboard-content">
          {isDriver ? (
            <>
              <div className="dashboard-card">
                <i className="fas fa-plus-circle"></i>
                <h3>Create Ride Offer</h3>
                <p>Post a ride offer with your route and schedule</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveView('create-ride')}
                >
                  <i className="fas fa-plus"></i> Post New Ride
                </button>
              </div>

              <div className="dashboard-card">
                <i className="fas fa-hand-paper"></i>
                <h3>Browse Ride Requests</h3>
                <p>See ride requests from passengers and help them out</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveView('browse-ride-requests')}
                >
                  <i className="fas fa-search"></i> Browse Requests
                </button>
              </div>

              <div className="dashboard-card">
                <i className="fas fa-tachometer-alt"></i>
                <h3>Driver Panel</h3>
                <p>View earnings, stats, and manage your availability</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveView('driver-panel')}
                >
                  <i className="fas fa-dashboard"></i> Open Panel
                </button>
              </div>

              <div className="dashboard-card">
                <i className="fas fa-search"></i>
                <h3>Browse All Rides</h3>
                <p>See what other rides are available in your area</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveView('search-rides')}
                >
                  <i className="fas fa-eye"></i> Browse Rides
                </button>
              </div>

              <div className="dashboard-card">
                <i className="fas fa-chart-line"></i>
                <h3>My Rides & Bookings</h3>
                <p>Manage your posted rides and view bookings</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveView('my-bookings')}
                >
                  <i className="fas fa-list"></i> View My Rides
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="dashboard-card">
                <i className="fas fa-hand-paper"></i>
                <h3>Request a Ride</h3>
                <p>Post your ride request and let drivers find you</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveView('create-ride-request')}
                >
                  <i className="fas fa-hand-paper"></i> Request Ride
                </button>
              </div>

              <div className="dashboard-card">
                <i className="fas fa-search"></i>
                <h3>Find Available Rides</h3>
                <p>Search for rides that match your route</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveView('search-rides')}
                >
                  <i className="fas fa-search"></i> Search Rides
                </button>
              </div>

              <div className="dashboard-card">
                <i className="fas fa-list"></i>
                <h3>My Ride Requests</h3>
                <p>View and manage your posted ride requests</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveView('my-ride-requests')}
                >
                  <i className="fas fa-list"></i> My Requests
                </button>
              </div>

              <div className="dashboard-card">
                <i className="fas fa-bookmark"></i>
                <h3>My Bookings</h3>
                <p>View your booked rides and trip history</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveView('my-bookings')}
                >
                  <i className="fas fa-calendar"></i> View Bookings
                </button>
              </div>
            </>
          )}

          <div className="dashboard-card">
            <i className="fas fa-user-cog"></i>
            <h3>Profile Settings</h3>
            <p>Update your profile and preferences</p>
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveView('profile-settings')}
            >
              <i className="fas fa-cog"></i> Edit Profile
            </button>
          </div>

          <div className="dashboard-card">
            <i className="fas fa-headset"></i>
            <h3>Support</h3>
            <p>Get help or contact customer support</p>
            <button className="btn btn-secondary">
              <i className="fas fa-question-circle"></i> Get Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

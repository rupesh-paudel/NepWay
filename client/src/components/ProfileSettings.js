import React, { useState, useEffect } from 'react';
import api from '../api/config';

const ProfileSettings = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/api/users/profile', {
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
      
      setSuccess('Profile updated successfully!');
      // Update user data in parent component
      if (onUpdateUser) {
        onUpdateUser(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await api.put('/api/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setSuccess('Password changed successfully!');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', color: 'white' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          <i className="fas fa-user-cog"></i> Profile Settings
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
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'profile' ? '#4f46e5' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            <i className="fas fa-user"></i> Profile Info
          </button>
          <button
            onClick={() => setActiveTab('password')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'password' ? '#4f46e5' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <i className="fas fa-lock"></i> Change Password
          </button>
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

          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate}>
              <h3 style={{ color: '#1f2937', marginBottom: '20px' }}>
                <i className="fas fa-user"></i> Personal Information
              </h3>

              <div className="form-group">
                <label htmlFor="name">
                  <i className="fas fa-user"></i> Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">
                  <i className="fas fa-user-tag"></i> Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="general">🚗 General User (Looking for rides)</option>
                  <option value="driver">🚙 Driver (Offering rides)</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }} 
                disabled={loading}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Updating Profile...</>
                ) : (
                  <><i className="fas fa-save"></i> Update Profile</>
                )}
              </button>
            </form>
          )}

          {/* Password Change Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange}>
              <h3 style={{ color: '#1f2937', marginBottom: '20px' }}>
                <i className="fas fa-lock"></i> Change Password
              </h3>

              <div className="form-group">
                <label htmlFor="currentPassword">
                  <i className="fas fa-key"></i> Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter your current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">
                  <i className="fas fa-lock"></i> New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <i className="fas fa-lock"></i> Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Confirm your new password"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }} 
                disabled={loading}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Changing Password...</>
                ) : (
                  <><i className="fas fa-key"></i> Change Password</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Account Stats */}
        <div className="card" style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '20px' }}>
            <i className="fas fa-chart-bar"></i> Account Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
            <div>
              <i className="fas fa-calendar-check" style={{ fontSize: '2rem', color: '#4f46e5', marginBottom: '10px' }}></i>
              <h4 style={{ color: '#1f2937' }}>Member Since</h4>
              <p style={{ color: '#6b7280' }}>January 2025</p>
            </div>
            <div>
              <i className="fas fa-star" style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '10px' }}></i>
              <h4 style={{ color: '#1f2937' }}>Rating</h4>
              <p style={{ color: '#6b7280' }}>4.8/5.0</p>
            </div>
            <div>
              <i className="fas fa-route" style={{ fontSize: '2rem', color: '#10b981', marginBottom: '10px' }}></i>
              <h4 style={{ color: '#1f2937' }}>Total Trips</h4>
              <p style={{ color: '#6b7280' }}>12 rides</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

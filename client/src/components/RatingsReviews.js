import React, { useState, useEffect } from 'react';
import api from '../api/config';

const RatingsReviews = ({ rideId, userToRate, userRole, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const submitRating = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/ratings', {
        rideId,
        ratedUserId: userToRate._id,
        rating,
        comment,
        raterType: userRole
      });

      setSuccess('Rating submitted successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '2rem',
          cursor: 'pointer',
          color: (hoveredRating || rating) >= star ? '#fbbf24' : '#e5e7eb',
          padding: '0 4px'
        }}
      >
        ★
      </button>
    ));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>
            <i className="fas fa-star"></i> Rate Your Experience
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <i className="fas fa-user-circle" style={{ fontSize: '3rem', color: '#6b7280' }}></i>
          </div>
          <h4 style={{ color: '#1f2937', margin: '10px 0' }}>{userToRate.name}</h4>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Rate your {userRole === 'driver' ? 'passenger' : 'driver'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <i className="fas fa-check-circle"></i> {success}
          </div>
        )}

        <form onSubmit={submitRating}>
          {/* Star Rating */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#1f2937' }}>
              Rating *
            </label>
            <div style={{ marginBottom: '10px' }}>
              {renderStars()}
            </div>
            <small style={{ color: '#6b7280' }}>
              {rating === 0 && 'Click to rate'}
              {rating === 1 && '⭐ Poor'}
              {rating === 2 && '⭐⭐ Fair'}
              {rating === 3 && '⭐⭐⭐ Good'}
              {rating === 4 && '⭐⭐⭐⭐ Very Good'}
              {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
            </small>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows="4"
              maxLength="500"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#6b7280' }}>
              {comment.length}/500 characters
            </small>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || rating === 0}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: rating === 0 ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: rating === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Submitting Rating...</>
            ) : (
              <><i className="fas fa-star"></i> Submit Rating</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingsReviews;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import './Modal.css';

function AgentSettings({ onClose, onSave }) {
  const { profile } = useAuth();
  const [currentManager, setCurrentManager] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AgentSettings - profile:', profile);
    console.log('AgentSettings - manager_id:', profile?.manager_id);
    
    if (profile?.manager_id) {
      fetchCurrentManager();
    } else {
      console.log('No manager_id found on profile');
      setLoading(false);
    }
  }, [profile?.manager_id]);

  const fetchCurrentManager = async () => {
    console.log('Fetching manager with id:', profile.manager_id);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, agency_name')
      .eq('id', profile.manager_id)
      .single();

    console.log('Manager fetch result - data:', data);
    console.log('Manager fetch result - error:', error);

    if (data && !error) {
      setCurrentManager(data);
    } else if (error) {
      console.error('Error fetching manager:', error);
    }
    setLoading(false);
  };

  const handleUnlink = async () => {
    if (!window.confirm('Are you sure you want to unlink from this agency? You will become an independent agent.')) {
      return;
    }

    setError('');
    setSuccess('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ manager_id: null })
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Successfully unlinked from agency!');
      setTimeout(() => {
        onSave();
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Account Settings</h2>
            <button onClick={onClose} className="close-btn">&times;</button>
          </div>
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Account Settings</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div style={{ padding: '24px' }}>
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={profile?.full_name || ''}
              disabled
              style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label>Your Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: '#333' }}>
              Linked Agency
            </label>

            {/* Debug info */}
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', padding: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
              DEBUG: manager_id = {profile?.manager_id || 'null'} | currentManager = {currentManager ? 'found' : 'null'}
            </div>

            {currentManager ? (
              <div className="linked-agency-card">
                <div className="agency-info">
                  <div className="manager-name">{currentManager.full_name}</div>
                  {currentManager.agency_name && (
                    <div className="agency-name">{currentManager.agency_name}</div>
                  )}
                </div>
                <button 
                  onClick={handleUnlink}
                  className="btn-unlink"
                  type="button"
                >
                  🗑️ Unlink Agency
                </button>
              </div>
            ) : (
              <div className="info-message">
                <strong>No Linked Agency</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                  You are currently an independent agent.
                </p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentSettings;

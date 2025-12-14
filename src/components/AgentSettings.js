import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import './Modal.css';

function AgentSettings({ onClose, onSave }) {
  const { profile } = useAuth();
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [currentManager, setCurrentManager] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchManagers();
    // Set the selected manager after profile loads
    if (profile.manager_id) {
      setSelectedManager(profile.manager_id);
      fetchCurrentManager();
    }
  }, [profile.manager_id]);

  const fetchManagers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, agency_name')
      .eq('role', 'manager')
      .order('full_name');

    if (data && !error) {
      setManagers(data);
    }
  };

  const fetchCurrentManager = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, agency_name')
      .eq('id', profile.manager_id)
      .single();

    if (data && !error) {
      setCurrentManager(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        manager_id: selectedManager || null
      })
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
    } else {
      setSuccess('Manager updated successfully!');
      setTimeout(() => {
        onSave();
      }, 1500);
    }
  };

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

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={profile.full_name}
              disabled
              style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label>Your Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>

          {currentManager && (
            <div className="info-message">
              Currently managed by: <strong>{currentManager.full_name}</strong>
              {currentManager.agency_name && ` at ${currentManager.agency_name}`}
            </div>
          )}

          <div className="form-group">
            <label>Change Manager</label>
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
            >
              <option value="">Independent Agent (No Manager)</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.full_name} {manager.agency_name ? `- ${manager.agency_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AgentSettings;

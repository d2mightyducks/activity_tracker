import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import './Modal.css';

function AccountSettings({ onClose, onSave }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    agency_name: ''
  });

  useEffect(() => {
    if (profile) {
      loadUserData();
    }
  }, [profile]);

  async function loadUserData() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('full_name, email, agency_name')
        .eq('id', profile.id)
        .single();

      if (error) throw error;

      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        agency_name: data.agency_name || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage('❌ Error loading account settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          agency_name: formData.agency_name || null
        })
        .eq('id', profile.id);

      if (error) throw error;

      setMessage('✅ Settings saved successfully!');
      setTimeout(() => {
        setMessage('');
        if (onSave) onSave();
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('❌ Error saving settings');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div>Loading account settings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Account Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div style={{ padding: '20px' }}>
          <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#333'
          }}>
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            required
          />
        </div>

        {/* Email (read-only) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#333'
          }}>
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: '#f5f5f5',
              color: '#666'
            }}
          />
          <small style={{ color: '#666', fontSize: '14px' }}>
            Email cannot be changed
          </small>
        </div>

        {/* Linked Agency */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#333'
          }}>
            Linked Agency
          </label>
          <input
            type="text"
            value={formData.agency_name}
            onChange={(e) => handleChange('agency_name', e.target.value)}
            placeholder="No Linked Agency"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
          <small style={{ color: '#666', fontSize: '14px' }}>
            {formData.agency_name 
              ? `Currently linked to: ${formData.agency_name}`
              : 'No linked agency'}
          </small>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 32px',
            backgroundColor: saving ? '#ccc' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: saving ? 'not-allowed' : 'pointer',
            marginTop: '8px'
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Success/Error Message */}
        {message && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
            border: `1px solid ${message.startsWith('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '6px',
            color: message.startsWith('✅') ? '#155724' : '#721c24'
          }}>
            {message}
          </div>
        )}
      </form>

      {/* Sign Out Button */}
      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.reload();
          }}
          style={{
            padding: '10px 24px',
            backgroundColor: 'transparent',
            color: '#dc3545',
            border: '1px solid #dc3545',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;

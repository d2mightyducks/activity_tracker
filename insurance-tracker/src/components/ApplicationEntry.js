import React, { useState } from 'react';
import { supabase, CARRIERS } from '../supabaseClient';
import { format } from 'date-fns';
import './Modal.css';

function ApplicationEntry({ agentId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    app_date: format(new Date(), 'yyyy-MM-dd'),
    client_name: '',
    carrier: '',
    annualized_premium: '',
    status: 'Pending'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!formData.carrier) {
      setError('Please select a carrier');
      setSaving(false);
      return;
    }

    if (!formData.annualized_premium || parseFloat(formData.annualized_premium) <= 0) {
      setError('Please enter a valid premium amount');
      setSaving(false);
      return;
    }

    const dataToSave = {
      agent_id: agentId,
      app_date: formData.app_date,
      client_name: formData.client_name || null,
      carrier: formData.carrier,
      annualized_premium: parseFloat(formData.annualized_premium),
      status: formData.status
    };

    const { error: insertError } = await supabase
      .from('applications')
      .insert([dataToSave]);

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
    } else {
      onSave();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Application</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Application Date</label>
            <input
              type="date"
              value={formData.app_date}
              onChange={(e) => handleChange('app_date', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Client Name (Optional)</label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => handleChange('client_name', e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Carrier *</label>
            <select
              value={formData.carrier}
              onChange={(e) => handleChange('carrier', e.target.value)}
              required
            >
              <option value="">Select a carrier...</option>
              {CARRIERS.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Annualized Premium *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.annualized_premium}
              onChange={(e) => handleChange('annualized_premium', e.target.value)}
              placeholder="2400.00"
              required
            />
          </div>

          <div className="form-group">
            <label>Status *</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              required
            >
              <option value="Pending">Pending</option>
              <option value="Issued">Issued</option>
            </select>
          </div>

          <div className="info-message">
            This will automatically add +1 to your Applications and Closed count for this date.
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplicationEntry;

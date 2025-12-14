import React, { useState } from 'react';
import { supabase, CARRIERS } from '../supabaseClient';
import { format } from 'date-fns';
import './Modal.css';

function EditApplication({ application, onClose }) {
  const [formData, setFormData] = useState({
    app_date: application.app_date,
    client_name: application.client_name || '',
    carrier: application.carrier || '',
    annualized_premium: application.annualized_premium,
    status: application.status
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

    if (!formData.annualized_premium || parseFloat(formData.annualized_premium) <= 0) {
      setError('Please enter a valid premium amount');
      setSaving(false);
      return;
    }

    const dataToUpdate = {
      app_date: formData.app_date,
      client_name: formData.client_name || null,
      carrier: formData.carrier || null,
      annualized_premium: parseFloat(formData.annualized_premium),
      status: formData.status
    };

    const { error: updateError } = await supabase
      .from('applications')
      .update(dataToUpdate)
      .eq('id', application.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
    } else {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this sale? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', application.id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => {
  if (e.target === e.currentTarget) onClose();
}}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Sale</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Application Date *</label>
            <input
              type="date"
              value={formData.app_date}
              onChange={(e) => handleChange('app_date', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Annualized Premium *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.annualized_premium}
              onChange={(e) => handleChange('annualized_premium', e.target.value)}
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
            <label>Carrier (Optional)</label>
            <select
              value={formData.carrier}
              onChange={(e) => handleChange('carrier', e.target.value)}
            >
              <option value="">Select a carrier (optional)...</option>
              {CARRIERS.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
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

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleDelete} 
              disabled={deleting}
              className="btn-delete"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <div style={{ flex: 1 }}></div>
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

export default EditApplication;

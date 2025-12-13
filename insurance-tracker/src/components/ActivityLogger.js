import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { format } from 'date-fns';
import './Modal.css';

function ActivityLogger({ agentId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    log_date: format(new Date(), 'yyyy-MM-dd'),
    dials: 0,
    pickups: 0,
    quotes: 0,
    talk_time_minutes: 0,
    submitted_ap: 0
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

    const dataToSave = {
      agent_id: agentId,
      ...formData
    };

    // Try to update first (if log exists for this date), otherwise insert
    const { data: existing } = await supabase
      .from('activity_logs')
      .select('id')
      .eq('agent_id', agentId)
      .eq('log_date', formData.log_date)
      .single();

    let result;
    if (existing) {
      // Update existing log
      result = await supabase
        .from('activity_logs')
        .update(formData)
        .eq('id', existing.id);
    } else {
      // Insert new log
      result = await supabase
        .from('activity_logs')
        .insert([dataToSave]);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
    } else {
      onSave();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Log Activity</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.log_date}
              onChange={(e) => handleChange('log_date', e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dials</label>
              <input
                type="number"
                min="0"
                value={formData.dials}
                onChange={(e) => handleChange('dials', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label>Pick-ups</label>
              <input
                type="number"
                min="0"
                value={formData.pickups}
                onChange={(e) => handleChange('pickups', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quotes</label>
              <input
                type="number"
                min="0"
                value={formData.quotes}
                onChange={(e) => handleChange('quotes', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label>Talk Time (minutes)</label>
              <input
                type="number"
                min="0"
                value={formData.talk_time_minutes}
                onChange={(e) => handleChange('talk_time_minutes', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Submitted AP ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.submitted_ap}
              onChange={(e) => handleChange('submitted_ap', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="info-message">
            Note: Applications and Closed counts are automatically calculated when you add applications.
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ActivityLogger;

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import './Modal.css';

function AgentDetailModal({ agent, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentDetails();
  }, [agent]);

  const fetchAgentDetails = async () => {
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');
    
    const lastMonthStart = format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');
    const lastMonthEnd = format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');

    // Current month stats
    const { data: thisMonthLogs } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('agent_id', agent.id)
      .gte('log_date', monthStart)
      .lte('log_date', monthEnd);

    // Last month stats
    const { data: lastMonthLogs } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('agent_id', agent.id)
      .gte('log_date', lastMonthStart)
      .lte('log_date', lastMonthEnd);

    // Recent applications
    const { data: recentApps } = await supabase
      .from('applications')
      .select('*')
      .eq('agent_id', agent.id)
      .order('app_date', { ascending: false })
      .limit(10);

    const calculateTotals = (logs) => {
      return (logs || []).reduce((acc, log) => ({
        dials: acc.dials + (log.dials || 0),
        pickups: acc.pickups + (log.pickups || 0),
        quotes: acc.quotes + (log.quotes || 0),
        applications: acc.applications + (log.applications || 0),
        total_premium: acc.total_premium + (parseFloat(log.total_premium) || 0),
      }), { dials: 0, pickups: 0, quotes: 0, applications: 0, total_premium: 0 });
    };

    const thisMonth = calculateTotals(thisMonthLogs);
    const lastMonth = calculateTotals(lastMonthLogs);

    thisMonth.pickupRate = thisMonth.dials > 0 ? ((thisMonth.pickups / thisMonth.dials) * 100).toFixed(1) : 0;
    thisMonth.quoteRate = thisMonth.pickups > 0 ? ((thisMonth.quotes / thisMonth.pickups) * 100).toFixed(1) : 0;
    thisMonth.closeRate = thisMonth.quotes > 0 ? ((thisMonth.applications / thisMonth.quotes) * 100).toFixed(1) : 0;

    lastMonth.pickupRate = lastMonth.dials > 0 ? ((lastMonth.pickups / lastMonth.dials) * 100).toFixed(1) : 0;
    lastMonth.quoteRate = lastMonth.pickups > 0 ? ((lastMonth.quotes / lastMonth.pickups) * 100).toFixed(1) : 0;
    lastMonth.closeRate = lastMonth.quotes > 0 ? ((lastMonth.applications / lastMonth.quotes) * 100).toFixed(1) : 0;

    setStats({
      thisMonth,
      lastMonth,
      recentApps: recentApps || []
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Loading agent details...</div>
        </div>
      </div>
    );
  }

  const { thisMonth, lastMonth, recentApps } = stats;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{agent.full_name} - Performance Details</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="agent-detail-content">
          {/* This Month vs Last Month Comparison */}
          <div className="comparison-section">
            <div className="comparison-column">
              <h3>This Month</h3>
              <div className="stat-row">
                <span>Dials:</span>
                <strong>{thisMonth.dials}</strong>
              </div>
              <div className="stat-row">
                <span>Pick-ups:</span>
                <strong>{thisMonth.pickups}</strong>
              </div>
              <div className="stat-row">
                <span>Quotes:</span>
                <strong>{thisMonth.quotes}</strong>
              </div>
              <div className="stat-row">
                <span>Applications:</span>
                <strong>{thisMonth.applications}</strong>
              </div>
              <div className="stat-row">
                <span>Total Premium:</span>
                <strong>${thisMonth.total_premium.toLocaleString()}</strong>
              </div>
              <hr />
              <div className="stat-row">
                <span>Pick-up Rate:</span>
                <strong>{thisMonth.pickupRate}%</strong>
              </div>
              <div className="stat-row">
                <span>Quote Rate:</span>
                <strong>{thisMonth.quoteRate}%</strong>
              </div>
              <div className="stat-row">
                <span>Close Rate:</span>
                <strong>{thisMonth.closeRate}%</strong>
              </div>
            </div>

            <div className="comparison-column">
              <h3>Last Month</h3>
              <div className="stat-row">
                <span>Dials:</span>
                <strong>{lastMonth.dials}</strong>
              </div>
              <div className="stat-row">
                <span>Pick-ups:</span>
                <strong>{lastMonth.pickups}</strong>
              </div>
              <div className="stat-row">
                <span>Quotes:</span>
                <strong>{lastMonth.quotes}</strong>
              </div>
              <div className="stat-row">
                <span>Applications:</span>
                <strong>{lastMonth.applications}</strong>
              </div>
              <div className="stat-row">
                <span>Total Premium:</span>
                <strong>${lastMonth.total_premium.toLocaleString()}</strong>
              </div>
              <hr />
              <div className="stat-row">
                <span>Pick-up Rate:</span>
                <strong>{lastMonth.pickupRate}%</strong>
              </div>
              <div className="stat-row">
                <span>Quote Rate:</span>
                <strong>{lastMonth.quoteRate}%</strong>
              </div>
              <div className="stat-row">
                <span>Close Rate:</span>
                <strong>{lastMonth.closeRate}%</strong>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="recent-apps-section">
            <h3>Recent Applications</h3>
            {recentApps.length === 0 ? (
              <p className="no-data">No applications yet</p>
            ) : (
              <table className="apps-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Carrier</th>
                    <th>Premium</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map(app => (
                    <tr key={app.id}>
                      <td>{format(new Date(app.app_date), 'MMM d, yyyy')}</td>
                      <td>{app.client_name || '-'}</td>
                      <td>{app.carrier}</td>
                      <td>${parseFloat(app.annualized_premium).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
}

export default AgentDetailModal;

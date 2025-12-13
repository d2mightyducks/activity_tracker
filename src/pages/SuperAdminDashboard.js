import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import './Dashboard.css';
import './SuperAdminDashboard.css';

function SuperAdminDashboard() {
  const { profile, signOut } = useAuth();
  const [managers, setManagers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteAgency, setInviteAgency] = useState('');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: managersData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'manager')
      .order('full_name');

    const { data: agentsData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'agent')
      .order('full_name');

    setManagers(managersData || []);
    setAgents(agentsData || []);
    setLoading(false);
  };

  const handleInviteManager = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInviting(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: inviteEmail,
        password: invitePassword,
        email_confirm: true
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email: inviteEmail,
          full_name: inviteName,
          role: 'manager',
          agency_name: inviteAgency || null
        }]);

      if (profileError) throw profileError;

      setSuccess('Manager invited successfully!');
      setInviteEmail('');
      setInvitePassword('');
      setInviteName('');
      setInviteAgency('');
      setShowInviteModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Super Admin Dashboard</h1>
        <div className="header-right">
          <span className="user-name">Welcome, {profile.full_name}!</span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="admin-actions">
        <button onClick={() => setShowInviteModal(true)} className="btn-primary">
          Invite Manager
        </button>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>System Overview</h3>
          <div className="stat-row">
            <span>Total Managers:</span>
            <strong>{managers.length}</strong>
          </div>
          <div className="stat-row">
            <span>Total Agents:</span>
            <strong>{agents.length}</strong>
          </div>
        </div>
      </div>

      <div className="managers-section">
        <h2>Managers</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Agency</th>
              <th>Agents</th>
            </tr>
          </thead>
          <tbody>
            {managers.map(manager => {
              const agentCount = agents.filter(a => a.manager_id === manager.id).length;
              return (
                <tr key={manager.id}>
                  <td><strong>{manager.full_name}</strong></td>
                  <td>{manager.email}</td>
                  <td>{manager.agency_name || '-'}</td>
                  <td>{agentCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="agents-section">
        <h2>All Agents</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Manager</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => {
              const manager = managers.find(m => m.id === agent.manager_id);
              return (
                <tr key={agent.id}>
                  <td><strong>{agent.full_name}</strong></td>
                  <td>{agent.email}</td>
                  <td>{manager ? manager.full_name : 'Independent'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invite Manager</h2>
              <button onClick={() => setShowInviteModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleInviteManager} style={{ padding: '24px' }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                  placeholder="John Smith"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="manager@example.com"
                />
              </div>

              <div className="form-group">
                <label>Temporary Password *</label>
                <input
                  type="password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Agency Name (Optional)</label>
                <input
                  type="text"
                  value={inviteAgency}
                  onChange={(e) => setInviteAgency(e.target.value)}
                  placeholder="ABC Insurance Agency"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={inviting} className="btn-primary">
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminDashboard;

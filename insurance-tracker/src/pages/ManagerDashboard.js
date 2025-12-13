import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import AgentDetailModal from '../components/AgentDetailModal';
import './Dashboard.css';
import './ManagerDashboard.css';

function ManagerDashboard() {
  const { profile, signOut } = useAuth();
  const [agents, setAgents] = useState([]);
  const [agentStats, setAgentStats] = useState([]);
  const [teamStats, setTeamStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [signupLink, setSignupLink] = useState('');

  useEffect(() => {
    if (profile) {
      fetchData();
      generateSignupLink();
    }
  }, [profile]);

  const generateSignupLink = async () => {
    // Check if manager already has a signup code
    const { data: existing } = await supabase
      .from('manager_signup_codes')
      .select('code')
      .eq('manager_id', profile.id)
      .eq('is_active', true)
      .single();

    let code;
    if (existing) {
      code = existing.code;
    } else {
      // Generate new code
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await supabase
        .from('manager_signup_codes')
        .insert([{
          manager_id: profile.id,
          code: code
        }]);
    }

    const baseUrl = window.location.origin;
    setSignupLink(`${baseUrl}/signup?code=${code}`);
  };

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch agents
    const { data: agentsData } = await supabase
      .from('profiles')
      .select('*')
      .eq('manager_id', profile.id)
      .eq('role', 'agent')
      .order('full_name');

    if (agentsData) {
      setAgents(agentsData);
      await fetchAgentStats(agentsData);
    }

    setLoading(false);
  };

  const fetchAgentStats = async (agentsList) => {
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

    const statsPromises = agentsList.map(async (agent) => {
      // Get activity logs for this month
      const { data: logs } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('agent_id', agent.id)
        .gte('log_date', monthStart)
        .lte('log_date', monthEnd);

      // Get applications for this month
      const { data: apps } = await supabase
        .from('applications')
        .select('*')
        .eq('agent_id', agent.id)
        .gte('app_date', monthStart)
        .lte('app_date', monthEnd);

      const monthTotals = (logs || []).reduce((acc, log) => ({
        dials: acc.dials + (log.dials || 0),
        pickups: acc.pickups + (log.pickups || 0),
        quotes: acc.quotes + (log.quotes || 0),
        applications: acc.applications + (log.applications || 0),
        total_premium: acc.total_premium + (parseFloat(log.total_premium) || 0),
      }), { dials: 0, pickups: 0, quotes: 0, applications: 0, total_premium: 0 });

      // Get most recent activity
      const { data: recentLog } = await supabase
        .from('activity_logs')
        .select('log_date')
        .eq('agent_id', agent.id)
        .order('log_date', { ascending: false })
        .limit(1)
        .single();

      return {
        agent,
        ...monthTotals,
        lastActivity: recentLog?.log_date || 'Never',
        pickupRate: monthTotals.dials > 0 ? ((monthTotals.pickups / monthTotals.dials) * 100).toFixed(1) : 0,
        quoteRate: monthTotals.pickups > 0 ? ((monthTotals.quotes / monthTotals.pickups) * 100).toFixed(1) : 0,
        closeRate: monthTotals.quotes > 0 ? ((monthTotals.applications / monthTotals.quotes) * 100).toFixed(1) : 0,
      };
    });

    const stats = await Promise.all(statsPromises);
    setAgentStats(stats);

    // Calculate team totals
    const teamTotals = stats.reduce((acc, stat) => ({
      dials: acc.dials + stat.dials,
      pickups: acc.pickups + stat.pickups,
      quotes: acc.quotes + stat.quotes,
      applications: acc.applications + stat.applications,
      total_premium: acc.total_premium + stat.total_premium,
    }), { dials: 0, pickups: 0, quotes: 0, applications: 0, total_premium: 0 });

    teamTotals.pickupRate = teamTotals.dials > 0 ? ((teamTotals.pickups / teamTotals.dials) * 100).toFixed(1) : 0;
    teamTotals.quoteRate = teamTotals.pickups > 0 ? ((teamTotals.quotes / teamTotals.pickups) * 100).toFixed(1) : 0;
    teamTotals.closeRate = teamTotals.quotes > 0 ? ((teamTotals.applications / teamTotals.quotes) * 100).toFixed(1) : 0;

    setTeamStats(teamTotals);
  };

  const getRedFlags = () => {
    const today = new Date();
    const threeDaysAgo = new Date(today.setDate(today.getDate() - 3));
    
    return agentStats.filter(stat => {
      const lastActivityDate = stat.lastActivity !== 'Never' ? new Date(stat.lastActivity) : null;
      const noRecentActivity = !lastActivityDate || lastActivityDate < threeDaysAgo;
      const noPolicies = stat.applications === 0;
      const lowDials = stat.dials < 50; // Configurable threshold
      
      return noRecentActivity || noPolicies || lowDials;
    });
  };

  const handleLogout = async () => {
    await signOut();
  };

  const copySignupLink = () => {
    navigator.clipboard.writeText(signupLink);
    alert('Signup link copied to clipboard!');
  };

  if (loading) {
    return <div className="loading">Loading manager dashboard...</div>;
  }

  const redFlags = getRedFlags();
  const sortedByApps = [...agentStats].sort((a, b) => b.applications - a.applications);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Manager Dashboard</h1>
        <div className="header-right">
          <span className="user-name">Welcome, {profile.full_name}!</span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      {/* Agent Signup Link */}
      <div className="signup-link-card">
        <h3>Agent Signup Link</h3>
        <p>Share this link with agents to have them join your team:</p>
        <div className="link-display">
          <input type="text" value={signupLink} readOnly />
          <button onClick={copySignupLink} className="btn-primary">Copy Link</button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="team-stats-card">
        <h2>Team Performance (This Month)</h2>
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-value">{teamStats.dials}</div>
            <div className="stat-label">Total Dials</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{teamStats.pickups}</div>
            <div className="stat-label">Total Pick-ups</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{teamStats.quotes}</div>
            <div className="stat-label">Total Quotes</div>
          </div>
          <div className="stat-box highlight">
            <div className="stat-value">{teamStats.applications}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">${teamStats.total_premium?.toLocaleString() || 0}</div>
            <div className="stat-label">Total Premium</div>
          </div>
        </div>
        <div className="conversion-summary">
          <div>Pick-up Rate: <strong>{teamStats.pickupRate}%</strong></div>
          <div>Quote Rate: <strong>{teamStats.quoteRate}%</strong></div>
          <div>Close Rate: <strong>{teamStats.closeRate}%</strong></div>
        </div>
      </div>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="red-flags-card">
          <h3>⚠️ Agents Needing Attention</h3>
          <div className="red-flags-list">
            {redFlags.map(stat => (
              <div key={stat.agent.id} className="red-flag-item">
                <strong>{stat.agent.full_name}</strong>
                <div className="red-flag-reasons">
                  {stat.lastActivity === 'Never' && <span className="flag-badge">No activity</span>}
                  {stat.lastActivity !== 'Never' && new Date(stat.lastActivity) < new Date(new Date().setDate(new Date().getDate() - 3)) && 
                    <span className="flag-badge">Inactive 3+ days</span>}
                  {stat.applications === 0 && <span className="flag-badge">No policies</span>}
                  {stat.dials < 50 && <span className="flag-badge">Low dials ({stat.dials})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="leaderboard-card">
        <h3>🏆 Top Performers (By Applications)</h3>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Agent</th>
              <th>Applications</th>
              <th>Premium</th>
              <th>Close Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedByApps.map((stat, index) => (
              <tr key={stat.agent.id}>
                <td>
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && index + 1}
                </td>
                <td><strong>{stat.agent.full_name}</strong></td>
                <td>{stat.applications}</td>
                <td>${stat.total_premium.toLocaleString()}</td>
                <td>{stat.closeRate}%</td>
                <td>
                  <button 
                    onClick={() => setSelectedAgent(stat.agent)}
                    className="btn-link"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}

export default ManagerDashboard;

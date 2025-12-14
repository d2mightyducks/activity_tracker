import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import ActivityLogger from '../components/ActivityLogger';
import ApplicationEntry from '../components/ApplicationEntry';
import ConversionFunnel from '../components/ConversionFunnel';
import TodayStats from '../components/TodayStats';
import ApplicationsList from '../components/ApplicationsList';
import './Dashboard.css';

function AgentDashboard() {
  const { profile, signOut } = useAuth();
  const [activityLogs, setActivityLogs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchActivityLogs(),
      fetchApplications()
    ]);
    setLoading(false);
  };

  const fetchActivityLogs = async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('agent_id', profile.id)
      .order('log_date', { ascending: false })
      .limit(90); // Last 90 days

    if (data && !error) {
      setActivityLogs(data);
    }
  };

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('agent_id', profile.id)
      .order('app_date', { ascending: false });

    if (data && !error) {
      setApplications(data);
    }
  };

  const getTodayStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayLog = activityLogs.find(log => log.log_date === today);
    return todayLog || {
      dials: 0,
      pickups: 0,
      quotes: 0,
      applications: 0,
      talk_time_minutes: 0
    };
  };

  const getWeekStats = () => {
    const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
    const weekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');
    
    const weekLogs = activityLogs.filter(log => 
      log.log_date >= weekStart && log.log_date <= weekEnd
    );

    return weekLogs.reduce((acc, log) => ({
      dials: acc.dials + (log.dials || 0),
      pickups: acc.pickups + (log.pickups || 0),
      quotes: acc.quotes + (log.quotes || 0),
      applications: acc.applications + (log.applications || 0),
    }), { dials: 0, pickups: 0, quotes: 0, applications: 0 });
  };

  const getMonthStats = () => {
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');
    
    const monthLogs = activityLogs.filter(log => 
      log.log_date >= monthStart && log.log_date <= monthEnd
    );

    return monthLogs.reduce((acc, log) => ({
      dials: acc.dials + (log.dials || 0),
      pickups: acc.pickups + (log.pickups || 0),
      quotes: acc.quotes + (log.quotes || 0),
      applications: acc.applications + (log.applications || 0),
      total_premium: acc.total_premium + (parseFloat(log.total_premium) || 0),
    }), { dials: 0, pickups: 0, quotes: 0, applications: 0, total_premium: 0 });
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  const todayStats = getTodayStats();
  const weekStats = getWeekStats();
  const monthStats = getMonthStats();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Agent Dashboard</h1>
        <div className="header-right">
          <span className="user-name">Welcome, {profile.full_name}!</span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <div className="quick-actions">
        <button onClick={() => setShowActivityModal(true)} className="btn-primary">
          Log Activity
        </button>
        <button onClick={() => setShowAppModal(true)} className="btn-primary">
          Submit a Sale
        </button>
      </div>

      <TodayStats stats={todayStats} />

      <div className="stats-grid">
        <div className="stat-card">
          <h3>This Week</h3>
          <div className="stat-row">
            <span>Dials:</span>
            <strong>{weekStats.dials}</strong>
          </div>
          <div className="stat-row">
            <span>Pick-ups:</span>
            <strong>{weekStats.pickups}</strong>
          </div>
          <div className="stat-row">
            <span>Quotes:</span>
            <strong>{weekStats.quotes}</strong>
          </div>
          <div className="stat-row">
            <span>Applications:</span>
            <strong>{weekStats.applications}</strong>
          </div>
        </div>

        <div className="stat-card">
          <h3>This Month</h3>
          <div className="stat-row">
            <span>Dials:</span>
            <strong>{monthStats.dials}</strong>
          </div>
          <div className="stat-row">
            <span>Pick-ups:</span>
            <strong>{monthStats.pickups}</strong>
          </div>
          <div className="stat-row">
            <span>Quotes:</span>
            <strong>{monthStats.quotes}</strong>
          </div>
          <div className="stat-row">
            <span>Applications:</span>
            <strong>{monthStats.applications}</strong>
          </div>
          <div className="stat-row">
            <span>Total Premium:</span>
            <strong>${monthStats.total_premium.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <ConversionFunnel stats={monthStats} />

      <ApplicationsList 
        applications={applications} 
        onEdit={fetchApplications}
      />

      {showActivityModal && (
        <ActivityLogger
          agentId={profile.id}
          onClose={() => setShowActivityModal(false)}
          onSave={() => {
            setShowActivityModal(false);
            fetchActivityLogs();
          }}
        />
      )}

      {showAppModal && (
        <ApplicationEntry
          agentId={profile.id}
          onClose={() => setShowAppModal(false)}
          onSave={() => {
            setShowAppModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

export default AgentDashboard;

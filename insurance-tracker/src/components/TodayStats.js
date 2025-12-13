import React from 'react';
import './TodayStats.css';

function TodayStats({ stats }) {
  const { dials = 0, pickups = 0, quotes = 0, applications = 0, talk_time_minutes = 0 } = stats;

  return (
    <div className="today-stats">
      <h2>Today's Activity</h2>
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-value">{dials}</div>
          <div className="stat-label">Dials</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{pickups}</div>
          <div className="stat-label">Pick-ups</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{quotes}</div>
          <div className="stat-label">Quotes</div>
        </div>
        <div className="stat-box highlight">
          <div className="stat-value">{applications}</div>
          <div className="stat-label">Applications</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{talk_time_minutes}</div>
          <div className="stat-label">Talk Time (min)</div>
        </div>
      </div>
    </div>
  );
}

export default TodayStats;

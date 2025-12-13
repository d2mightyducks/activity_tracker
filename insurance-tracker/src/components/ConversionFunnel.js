import React from 'react';
import './ConversionFunnel.css';

function ConversionFunnel({ stats }) {
  const { dials = 0, pickups = 0, quotes = 0, applications = 0 } = stats;

  const pickupRate = dials > 0 ? ((pickups / dials) * 100).toFixed(1) : 0;
  const quoteRate = pickups > 0 ? ((quotes / pickups) * 100).toFixed(1) : 0;
  const closeRate = quotes > 0 ? ((applications / quotes) * 100).toFixed(1) : 0;

  return (
    <div className="conversion-funnel">
      <h3>Conversion Funnel (This Month)</h3>
      
      <div className="funnel-container">
        <div className="funnel-stage" style={{ width: '100%' }}>
          <div className="funnel-bar">
            <div className="funnel-content">
              <strong>{dials}</strong> Dials
            </div>
          </div>
        </div>

        <div className="funnel-arrow">
          <div className="conversion-rate">{pickupRate}%</div>
        </div>

        <div className="funnel-stage" style={{ width: '80%' }}>
          <div className="funnel-bar">
            <div className="funnel-content">
              <strong>{pickups}</strong> Pick-ups
            </div>
          </div>
        </div>

        <div className="funnel-arrow">
          <div className="conversion-rate">{quoteRate}%</div>
        </div>

        <div className="funnel-stage" style={{ width: '60%' }}>
          <div className="funnel-bar">
            <div className="funnel-content">
              <strong>{quotes}</strong> Quotes
            </div>
          </div>
        </div>

        <div className="funnel-arrow">
          <div className="conversion-rate">{closeRate}%</div>
        </div>

        <div className="funnel-stage" style={{ width: '40%' }}>
          <div className="funnel-bar funnel-success">
            <div className="funnel-content">
              <strong>{applications}</strong> Applications
            </div>
          </div>
        </div>
      </div>

      <div className="funnel-summary">
        <div className="summary-item">
          <span>Pick-up Rate:</span>
          <strong>{pickupRate}%</strong>
        </div>
        <div className="summary-item">
          <span>Quote Rate:</span>
          <strong>{quoteRate}%</strong>
        </div>
        <div className="summary-item">
          <span>Close Rate:</span>
          <strong>{closeRate}%</strong>
        </div>
      </div>
    </div>
  );
}

export default ConversionFunnel;

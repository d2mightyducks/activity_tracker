import React, { useState } from 'react';
import { format } from 'date-fns';
import EditApplication from './EditApplication';
import './ApplicationsList.css';

function ApplicationsList({ applications, onEdit }) {
  const [selectedApp, setSelectedApp] = useState(null);

  const handleEdit = (app) => {
    setSelectedApp(app);
  };

  const handleCloseEdit = () => {
    setSelectedApp(null);
    onEdit(); // Refresh the list
  };

  if (applications.length === 0) {
    return (
      <div className="applications-list">
        <h3>My Sales</h3>
        <p className="no-data">No sales submitted yet. Click "Submit a Sale" to add your first one!</p>
      </div>
    );
  }

  return (
    <div className="applications-list">
      <h3>My Sales</h3>
      <div className="table-container">
        <table className="applications-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Carrier</th>
              <th>Premium</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td>{format(new Date(app.app_date), 'MMM d, yyyy')}</td>
                <td>{app.client_name || <span className="empty-field">Not set</span>}</td>
                <td>{app.carrier || <span className="empty-field">Not set</span>}</td>
                <td>${parseFloat(app.annualized_premium).toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleEdit(app)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <EditApplication
          application={selectedApp}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
}

export default ApplicationsList;

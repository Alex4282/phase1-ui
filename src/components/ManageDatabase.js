import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ManageDatabase.css';
import axiosInstance from '../axiosInstance';

function DatabasePage() {
  const [path, setPath] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const deleteAllActiveTests = async () => {
    try {
      const response = await axiosInstance.delete('/api/tests/deleteActive', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true
      });
      if (response.status === 200) {
        alert('All active tests have been deleted.');
      } else {
        alert('Failed to delete active tests.');
      }
    } catch (error) {
      console.error('Error deleting active tests:', error);
      alert('Failed to delete active tests.');
    }
  };

  const updateStatus = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Not authenticated. Please log in.');
        navigate('/');
        return;
      }

      const response = await axiosInstance.put('/api/tests/update-status', { path, status }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      });
      if (response.status === 200) {
        alert('Status updated successfully.');
      } else {
        alert('Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post(
        '/api/auth/logout',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
      alert('An error occurred during logout.');
    }
  };

  return (
    <div className="database-page-container">
      <div className="top-buttons">
        <button type="button" className="dashboard-button" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
        <button type="button" className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="left-half">
        <button onClick={deleteAllActiveTests} className="delete-button">Delete All Active Tests</button>
      </div>
      <div className="right-half">
        <h2>Change Status of a Test</h2>
        <form onSubmit={updateStatus}>
          <div className="form-group">
            <label>Path:</label>
            <input type="text" value={path} onChange={(e) => setPath(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Status:</label>
            <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
          <button type="submit" className="update-button">Update Status</button>
        </form>
      </div>
    </div>
  );
}

export default DatabasePage;

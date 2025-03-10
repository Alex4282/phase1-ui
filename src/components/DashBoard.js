import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import './DashBoard.css'; // Import the CSS file for styling

const Dashboard = () => {
    const navigate = useNavigate();
    
    // reviewed
    const handleLogout = async () => {
        try {
            const response = await axiosInstance.post('/api/auth/logout', {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                withCredentials: true
            });

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
    // reviewed
    const openJmxPage = () => {
        const token = localStorage.getItem('token');
        navigate('/JmxForm', { state: { headers: { 'Authorization': `Bearer ${token}` },withCredentials:true } });
    };

    // reviewed
    const viewResultsPage = () => {
        const token = localStorage.getItem('token');
        navigate('/results', { state: { headers: { 'Authorization': `Bearer ${token}` },withCredentials:true  } });
    };

    const viewManageDatabasePage = () => {
        const token = localStorage.getItem('token');
        navigate('/manageDatabase', { state: { headers: { 'Authorization': `Bearer ${token}` } ,withCredentials:true } });
    };
    // reviewed
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome to Your Dashboard</h1>
                <p>Your gateway to managing files and actions!</p>
            </div>
            <div className="dashboard-buttons">
                <button className="btn primary-btn" onClick={openJmxPage}>
                    Add JMX and CSV Files
                </button>
                <button className="btn secondary-btn" onClick={viewResultsPage}>
                    View Results
                </button>
                <button className="btn secondary-btn" onClick={viewManageDatabasePage}>
                    Manage Database
                </button>
                <button className="btn secondary-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard;

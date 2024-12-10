import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await axios.post('http://localhost:8080/auth/api/logout', {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
                },
                withCredentials: true // Ensure cookies are sent with the request for session-based authentication
            });

            if (response.status === 200) {
                // Clear the JWT token from localStorage
                localStorage.removeItem('token');
                navigate('/'); // Redirect to login page after successful logout
            } else {
                alert('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('An error occurred during logout:', error);
            alert('An error occurred during logout.');
        }
    };

    const openJmxPage = () => 
        { const token = localStorage.getItem('token');
          navigate('/JmxForm', { state: { headers: { 'Authorization': `Bearer ${token}` } } }); };

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome to the secured dashboard!</p>
            <button onClick={openJmxPage}>Add Jmx file and Csv file</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;

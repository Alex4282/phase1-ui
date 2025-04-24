import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import './DashBoard.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [recentRuns, setRecentRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentRuns = async () => {
            try {
                const response = await axiosInstance.get('/api/recentRuns', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setRecentRuns(response.data);
            } catch (err) {
                setError('Failed to fetch recent runs');
                console.error('Error fetching recent runs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentRuns();
    }, []);

    const handleNewProject = () => {
        navigate('/jmxform');
    };

    return (
        <div className="dashboard-container">
            {/* Welcome Section */}
            <div className="welcome-section">
                <h1>Welcome Jatin!</h1>
                <p>Hi! We're happy to have you on board! Everything is set up for you to start testing.</p>
            </div>

            {/* Cards Section */}
            <div className="cards-container">
                {/* User Profile Card - Modified Recent Runs */}
                <div className="card recent-runs">
                    <h2>Your Recent Runs</h2>
                    {loading ? (
                        <p>Loading recent runs...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : recentRuns.length === 0 ? (
                        <p>No recent runs found</p>
                    ) : (
                        <ul className="run-links">
                            {recentRuns.map((run) => (
                                <li key={run.id}>
                                    <Link to={`/final-report/${run.id}`}>
                                        {run.projectName}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Active Projects Card */}
                <div className="card active-projects">
                    <h2>Your Active Projects</h2>
                    <ul className="project-list">
                        <li className="project-item">
                            <Link to="/project-dashboard" className="plain-link">
                                <h3>Website Load Test</h3>
                                <p>Status: In Progress</p>
                            </Link>
                        </li>
                        <li className="project-item">
                            <Link to="/project-dashboard" className="plain-link">
                                <h3>API Stress Test</h3>
                                <p>Status: Completed</p>
                            </Link>
                        </li>
                        <li className="project-item">
                            <Link to="/project-dashboard" className="plain-link">
                                <h3>Backend Performance Test</h3>
                                <p>Status: In Progress</p>
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Start New Project Card */}
                <div className="card start-project">
                    <h2>Start a New Project</h2>
                    <p>Upload your JMeter file to start a new test project.</p>
                    <button className="new-project-button" onClick={handleNewProject}>
                        Start New Project
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
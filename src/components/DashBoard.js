import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import './DashBoard.css'; // Import the CSS file for styling
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

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
                {/* User Profile Card */}
                <div className="card recent-runs">
                    <h2>Your Recent Runs</h2>
                    <ul className="run-links">
                        <li><Link to="/final-report/70">Run #245 - April 3, 2023</Link></li>
                        <li><Link to="/final-report/69">Run #244 - April 2, 2023</Link></li>
                        <li><Link to="/final-report/68">Run #243 - April 1, 2023</Link></li>
                        <li><Link to="/final-report/67">Run #242 - March 31, 2023</Link></li>
                    </ul>
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

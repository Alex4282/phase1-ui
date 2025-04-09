import React from 'react';
import { Link } from 'react-router-dom';
import './ProjectDashboard.css';

const ProjectDashboard = () => {
  const projectName = "Website Load Test"; // You can make this dynamic
  
  return (
    <div className="project-dashboard">
      {/* Project Header */}
      <div className="project-header">
        <h1>{projectName}</h1>
        <div className="project-meta">
          <span className="project-status">Status: Running</span>
          <span className="project-date">Last run: April 3, 2023</span>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Left Side - Recent Runs */}
        <div className="recent-runs-section">
          <h2>Your Recent Runs</h2>
          <ul className="run-links">
            <li><Link to="/final-report/70">Run #245 - April 3, 2023</Link></li>
            <li><Link to="/final-report/69">Run #244 - April 2, 2023</Link></li>
            <li><Link to="/final-report/68">Run #243 - April 1, 2023</Link></li>
            <li><Link to="/final-report/67">Run #242 - March 31, 2023</Link></li>
          </ul>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="action-buttons-section">
          <button className="action-button rerun-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6"></path>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Rerun Last Test</span>
          </button>

          <button className="action-button new-test-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New Test</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
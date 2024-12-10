import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';

const FileUploadForm = () => {
    const [projectName, setProjectName] = useState('');
    const [jmxFile, setJmxFile] = useState(null);
    const [csvFile, setCsvFile] = useState(null);
    const [totalUsers, setTotalUsers] = useState('');
    const [rampUpTime, setRampUpTime] = useState('');
    const [duration, setDuration] = useState('');
    const [iterations, setIterations] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate input: Ensure either duration or iterations is filled
        if (!duration && !iterations) {
            setMessage('Please provide either Duration or Number of Iterations.');
            return;
        }

        const formData = new FormData();
        formData.append('projectName', projectName);
        formData.append('jmxFile', jmxFile);
        formData.append('csvFile', csvFile);
        formData.append('totalUsers', totalUsers);
        formData.append('rampUpTime', rampUpTime);
        if (duration) formData.append('duration', duration);
        if (iterations) formData.append('iterations', iterations);

        try {
            const token = localStorage.getItem('token'); // Get the token from localStorage
            const response = await axios.post('http://localhost:8080/api/uploadJmx', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` // Include the token in the headers
                },
                withCredentials: true,
            });

            if (response.status === 200) {
                setMessage('Files uploaded successfully!');
            } else {
                setMessage('Failed to upload files.');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            setMessage('Failed to upload files.');
        }
    };

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

    return (
        <div>
            <h2>Upload Files</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Project Name:</label>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>JMX File:</label>
                    <input
                        type="file"
                        accept=".jmx"
                        onChange={(e) => setJmxFile(e.target.files[0])}
                        required
                    />
                </div>
                <div>
                    <label>CSV File:</label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files[0])}
                        required
                    />
                </div>
                <div>
                    <label>Total Users:</label>
                    <input
                        type="number"
                        value={totalUsers}
                        onChange={(e) => setTotalUsers(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Ramp Up Time (seconds):</label>
                    <input
                        type="number"
                        value={rampUpTime}
                        onChange={(e) => setRampUpTime(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Duration (minutes):</label>
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        disabled={iterations !== ''} // Disable if iterations is filled
                    />
                </div>
                <div>
                    <label>Number of Iterations:</label>
                    <input
                        type="number"
                        value={iterations}
                        onChange={(e) => setIterations(e.target.value)}
                        disabled={duration !== ''} // Disable if duration is filled
                    />
                </div>
                <button type="submit">Upload</button>
                <button type="button" onClick={handleLogout}>Logout</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default FileUploadForm;

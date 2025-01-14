import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';
import './JmxForm.css'; // Import the CSS file for styling

const FileUploadForm = () => {
    const [projectName, setProjectName] = useState('');
    const [jmxFile, setJmxFile] = useState(null);
    const [csvFiles, setCsvFiles] = useState([]);
    const [totalUsers, setTotalUsers] = useState('');
    const [rampUpTime, setRampUpTime] = useState('');
    const [duration, setDuration] = useState('');
    const [iterations, setIterations] = useState('');
    const [numAwsMachines, setNumAwsMachines] = useState('');
    const [message, setMessage] = useState('');
    const [fileUploaded, setFileUploaded] = useState(false);

    const navigate = useNavigate();

    const handleCsvFilesChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setCsvFiles((prevFiles) => [...prevFiles, ...newFiles]);
        e.target.value = ''; // Clear the input to allow adding the same file again
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!duration && !iterations) {
            setMessage('Please provide either Duration or Number of Iterations.');
            return;
        }
        if (!jmxFile || csvFiles.length === 0) {
            setMessage('Please upload a JMX file and at least one CSV file.');
            return;
        }
        
        const formData = new FormData();
        formData.append('projectName', projectName);
        formData.append('jmxFile', jmxFile);
        csvFiles.forEach((file) => {
            formData.append('csvFiles', file);
        });
        formData.append('totalUsers', totalUsers);
        formData.append('rampUpTime', rampUpTime);
        formData.append('numAwsMachines', numAwsMachines);
        if (duration) formData.append('duration', duration);
        if (iterations) formData.append('iterations', iterations);

        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post('/api/uploadAndSaveJmx', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: true,
            });

            if (response.status === 200) {
                setMessage('Files uploaded successfully!');
                setFileUploaded(true);
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
            const response = await axiosInstance.post('/auth/api/logout', {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                withCredentials: true,
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

    return (
        <div className="file-upload-container">
            {/* Top buttons */}
            <div className="top-buttons">
                <button type="button" className="dashboard-button" onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                </button>
                <button type="button" className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {/* File upload card */}
            <div className="file-upload-card">
                <h2>Upload Files</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Project Name:</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>JMX File:</label>
                        <input
                            type="file"
                            accept=".jmx"
                            onChange={(e) => setJmxFile(e.target.files[0])}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>CSV Files:</label>
                        <input
                            type="file"
                            accept=".csv"
                            multiple
                            onChange={handleCsvFilesChange}
                        />
                        <div className="csv-file-list">
                            {csvFiles.length > 0 ? (
                                <ul>
                                    {csvFiles.map((file, index) => (
                                        <li key={index}>
                                            {file.name}
                                            <button
                                                type="button"
                                                className="remove-button"
                                                onClick={() => {
                                                    setCsvFiles((prevFiles) =>
                                                        prevFiles.filter((_, i) => i !== index)
                                                    );
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No CSV files added yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Total Users:</label>
                        <input
                            type="number"
                            value={totalUsers}
                            onChange={(e) => setTotalUsers(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Ramp Up Time (seconds):</label>
                        <input
                            type="number"
                            value={rampUpTime}
                            onChange={(e) => setRampUpTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Number of AWS Machines:</label>
                        <input
                            type="number"
                            value={numAwsMachines}
                            onChange={(e) => setNumAwsMachines(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Duration (minutes):</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            disabled={iterations !== ''}
                        />
                    </div>
                    <div className="form-group">
                        <label>Number of Iterations:</label>
                        <input
                            type="number"
                            value={iterations}
                            onChange={(e) => setIterations(e.target.value)}
                            disabled={duration !== ''}
                        />
                    </div>
                    <button type="submit" className="btn primary-btn">Upload</button>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default FileUploadForm;

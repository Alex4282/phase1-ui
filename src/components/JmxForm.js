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
    const [validationStatus, setValidationStatus] = useState(null); // null: not validated, true: success, false: failure
    const [isValidating, setIsValidating] = useState(false); // To show loading state during validation

    const navigate = useNavigate();

    const handleCsvFilesChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setCsvFiles((prevFiles) => [...prevFiles, ...newFiles]);
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!duration && !iterations) {
            setMessage('Please provide either Duration or Number of Iterations.');
            return;
        }
        if (!jmxFile) {
            setMessage('Please upload a JMX file');
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
                console.log(response.data.projectId);
                setTimeout(() => {
                    navigate(`/jtl-data/${response.data.projectId}`, { state: { headers: { 'Authorization': `Bearer ${token}` }, withCredentials: true } });
                }, 1000);
            } else {
                setMessage('Failed to upload files.');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            setMessage('Failed to upload files.');
        }
    };

    const handleValidateJmx = async () => {
        if (!jmxFile) {
            setMessage('Please upload a JMX file first.');
            return;
        }

        setIsValidating(true);
        setValidationStatus(null); // Reset validation status

        const formData = new FormData();
        formData.append('jmxFile', jmxFile);

        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post('/api/validateJmx', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: true,
            });

            if (response.status === 200 && response.data.valid) {
                setValidationStatus(true); // Validation successful
                setMessage('JMX file is valid.');
            } else {
                setValidationStatus(false); // Validation failed
                setMessage('JMX file is invalid.');
            }
        } catch (error) {
            console.error('Error validating JMX file:', error);
            setValidationStatus(false); // Validation failed
            setMessage('Failed to validate JMX file.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await axiosInstance.post('/api/auth/logout', {}, {
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

    const preventScroll = (e) => e.preventDefault();
    const addEventListeners = (element) => {
        if (element) {
            element.addEventListener('focus', (e) => e.target.addEventListener('wheel', preventScroll));
            element.addEventListener('blur', (e) => e.target.removeEventListener('wheel', preventScroll));
        }
    };

    return (
        <div className="file-upload-container">
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
                        {jmxFile && (
                            <button
                                type="button"
                                className={`validate-button ${validationStatus === true ? 'success' : validationStatus === false ? 'failure' : ''}`}
                                onClick={handleValidateJmx}
                                disabled={isValidating}
                            >
                                {isValidating ? 'Validating...' : validationStatus === true ? 'Validation Successful' : validationStatus === false ? 'Validation Unsuccessful' : 'Validate'}
                            </button>
                        )}
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
                            ref={addEventListeners}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Ramp Up Time (seconds):</label>
                        <input
                            type="number"
                            value={rampUpTime}
                            onChange={(e) => setRampUpTime(e.target.value)}
                            ref={addEventListeners}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Number of AWS Machines:</label>
                        <input
                            type="number"
                            value={numAwsMachines}
                            onChange={(e) => setNumAwsMachines(e.target.value)}
                            ref={addEventListeners}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Duration (minutes):</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            ref={addEventListeners}
                            disabled={iterations !== ''}
                        />
                    </div>
                    <div className="form-group">
                        <label>Number of Iterations:</label>
                        <input
                            type="number"
                            value={iterations}
                            onChange={(e) => setIterations(e.target.value)}
                            ref={addEventListeners}
                            disabled={duration !== ''}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn primary-btn"
                        disabled={!validationStatus} // Disable submit button until validation is successful
                    >
                        Upload
                    </button>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default FileUploadForm;
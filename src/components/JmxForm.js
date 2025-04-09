import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';
import './JmxForm.css'; // Import the CSS file for styling

const FileUploadForm = () => {
    const [projectName, setProjectName] = useState('default_project');
    const [performanceTestName, setPerformanceTestName] = useState('performance_test_1');
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
    const [remarks, setRemarks] = useState('');
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
        formData.append('performanceTestName', performanceTestName);
        formData.append('jmxFile', jmxFile);
        csvFiles.forEach((file) => {
            formData.append('csvFiles', file);
        });
        formData.append('totalUsers', totalUsers);
        formData.append('rampUpTime', rampUpTime);
        formData.append('numAwsMachines', numAwsMachines);
        if (duration) formData.append('duration', duration);
        if (iterations) formData.append('iterations', iterations);
        formData.append('remarks', remarks);

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
    const handleJmxFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setJmxFile(file);
            e.target.value = ''; 
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
                
            } else {
                setValidationStatus(false); // Validation failed
                
            }
        } catch (error) {
            console.error('Error validating JMX file:', error);
            setValidationStatus(false); // Validation failed
          
        } finally {
            setIsValidating(false);
        }
    };
    const [userCount,setUserCount] = useState(0);
    return (
        <div className="file-upload-container">
            <div className="layout">
                {/* Part 1: Project and Test Name */}
                <div className="part1">
                    <div className="editable-field">
                        <label>Project Name:</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />
                    </div>
                    <div className="editable-field">
                        <label>Performance Test Name:</label>
                        <input
                            type="text"
                            value={performanceTestName}
                            onChange={(e) => setPerformanceTestName(e.target.value)}
                        />
                    </div>
                    <div className="editable-field">
                        <label>Remarks</label>
                        <input
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>
                </div>

                {/* Part 2: File Upload and Load Configuration */}
                <div className="part2">
                    <div className="file-upload-section">
                        <div className="upload-box" onClick={() => document.getElementById('jmx-upload').click()}>
                            <span>+</span>
                            <p>Upload JMX Script</p>
                            <input
                                id="jmx-upload"
                                type="file"
                                accept=".jmx"
                                onChange={(e) => handleJmxFileChange(e)}
                                style={{ display: 'none' }}
                            />
                        </div>
                        {jmxFile && (
                                <div className="jmx-file-item">
                                    <span>{jmxFile.name}</span>
                                    <button
                                    type="button"
                                    className="remove-button"
                                    onClick={() => {
                                        setJmxFile(null);
                                        setValidationStatus(null);
                                        document.getElementById('jmx-upload').value = ''; // Clear the file input
                                    }}
                                >
                                    Remove
                                </button>

                                </div>
                            )}
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
            
                        <div className="upload-box" onClick={() => document.getElementById('csv-upload').click()}>
                            <span>+</span>
                            <p>Upload CSV(s)</p>
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                multiple
                                onChange={handleCsvFilesChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className="csv-file-list">
                            {csvFiles.map((file, index) => (
                                <div key={index} className="csv-file-item">
                                    <span>{file.name}</span>
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
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="load-configuration">
                        <h2>Load Configuration</h2>
                        <div className="form-group">
                        <label>Total Users:</label>
                        <div className="slider-input">
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={totalUsers}
                                onChange={(e) => setTotalUsers(e.target.value)}
                            />
                            <input
                                type="number"
                                value={totalUsers}
                                onChange={(e) => setTotalUsers(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Duration (seconds)</label>
                        <div className="slider-input">
                            <input
                                type="range"
                                min="0"
                                max="3600"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                disabled={iterations !== ''}
                            />
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="Duration"
                                disabled={iterations !== ''}
                            />
                        </div>
                        <div className='form-group'>
                        <label>Iterations</label>
                        <div className="slider-input">
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={iterations}
                                onChange={(e) => setIterations(e.target.value)}
                                disabled={duration !== ''}
                            />
                            <input
                                type="number"
                                value={iterations}
                                onChange={(e) => setIterations(e.target.value)}
                                placeholder="Iterations"
                                disabled={duration !== ''}
                            />
                        </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Ramp Up Time (seconds):</label>
                        <div className="slider-input">
                            <input
                                type="range"
                                min="0"
                                max="3600"
                                value={rampUpTime}
                                onChange={(e) => setRampUpTime(e.target.value)}
                            />
                            <input
                                type="number"
                                value={rampUpTime}
                                onChange={(e) => setRampUpTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Number of AWS Machines:</label>
                        <div className="slider-input">
                            <input
                                type="range"
                                min="0"
                                max="50"
                                value={numAwsMachines}
                                onChange={(e) => setNumAwsMachines(e.target.value)}
                            />
                            <input
                                type="number"
                                value={numAwsMachines}
                                onChange={(e) => setNumAwsMachines(e.target.value)}
                            />
                        </div>
                    </div>
                     </div>       
                    <div className="load-distribution">
                <div className="distribution-header">
                    <h2>Load Distribution</h2>
                    <button type="button" className="add-location-button">
                        + Add Location
                    </button>
                </div>
                <table className="distribution-table">
                    <thead>
                        <tr>
                            <th>Locations</th>
                            <th>% of Traffic</th>
                            <th># of Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <select className="location-dropdown">
                                    <option value="">Select Location</option>
                                    <option value="US East (Virginia) - Google Cloud Platform">US East (Virginia) - Google Cloud Platform</option>
                                    <option value="US West (Oregon) - Google Cloud Platform">US West (Oregon) - Google Cloud Platform</option>
                                    <option value="Europe (London) - Google Cloud Platform">Europe (London) - Google Cloud Platform</option>
                                    <option value="Asia Pacific (Mumbai) - Google Cloud Platform">Asia Pacific (Mumbai) - Google Cloud Platform</option>
                                </select>
                            </td>
                            <td>
                                <input type="number" className="traffic-percentage" placeholder='100'/>
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="user-count"
                                    value={userCount}
                                    onChange={(e) => setUserCount(Number(e.target.value) || 0)}
                                    placeholder=''
                                />
                            </td>
                        </tr>
                        <tr className="total-row">
                            <td>Total:</td>
                            <td>100%</td>
                            <td>{userCount}</td>
                        </tr>
                    </tbody>
                </table>
            </div>       
                    
                </div>
            </div>

            <button
                type="submit"
                className="upload-button"
                onClick={handleSubmit}
                disabled={!validationStatus}
            >
                Execute Test
            </button>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default FileUploadForm;
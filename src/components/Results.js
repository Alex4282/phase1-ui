import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import './Results.css';
import { useNavigate } from 'react-router-dom';
import { UPLOAD_DIRECTORY } from './Constants';

const Results = () => {
    const [files, setFiles] = useState([]); // Ensure it starts as an array
    const [currentPath, setCurrentPath] = useState(UPLOAD_DIRECTORY); // Initial directory
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);
            setError(null); // Reset error before fetch
            try {
                const response = await axiosInstance.get('/api/files', {
                    params: { path: currentPath },
                });
                // Validate the response to ensure it's an array
                if (Array.isArray(response.data)) {
                    setFiles(response.data);
                } else {
                    console.error('Unexpected response format:', response.data);
                    setFiles([]); // Fallback to an empty array
                }
            } catch (error) {
                console.error('Error fetching file data:', error);
                setError('Failed to load files. Please try again.');
                setFiles([]); // Ensure files is always an array
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [currentPath]);

    const navigateToDirectory = (folderName) => {
        setCurrentPath(`${currentPath}/${folderName}`);
    };

    const navigateUp = () => {
        const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        setCurrentPath(parentPath || UPLOAD_DIRECTORY);
    };

    const downloadAsZip = async (folderName) => {
        try {
            const response = await axiosInstance.get('/api/download', {
                params: { path: `${currentPath}/${folderName}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${folderName}.zip`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading ZIP file:', error);
            setError(`Failed to download ZIP for ${folderName}`);
        }
    };

    const renderFiles = (fileStructure) => {
        if (!Array.isArray(fileStructure) || fileStructure.length === 0) {
            return <p>No files or folders available.</p>;
        }

        return fileStructure.map((file, index) => (
            <div key={index} className="file-item">
                {file.isDirectory ? (
                    <div className="folder" onClick={() => navigateToDirectory(file.name)}>
                        📁 <strong>{file.name}</strong>
                    </div>
                ) : (
                    <div className="file">
                        📄 {file.name}
                    </div>
                )}
                {file.isDirectory && (
                    <button onClick={() => downloadAsZip(file.name)}>Download as ZIP</button>
                )}
            </div>
        ));
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
        <div className="file-display-container">
            <div className="top-buttons">
                <button type="button" className="dashboard-button" onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                </button>
                <button type="button" className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            <h2>Files and Folders</h2>
            <div className="path-navigation">
                <button onClick={navigateUp} disabled={currentPath === 'D:/phase1/src/main/uploads'}>
                    🔙 Up
                </button>
                <span>Current Path: {currentPath}</span>
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="file-structure">{renderFiles(files)}</div>
            )}
        </div>
    );
};

export default Results;

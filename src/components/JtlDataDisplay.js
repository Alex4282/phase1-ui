import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "./JtlDataDisplay.css";
import axiosInstance from '../axiosInstance';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import { themeQuartz } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const JtlDataDisplay = ({ loadTestId }) => {
    const [rowData, setRowData] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const navigate = useNavigate();

    const columnDefs = [
        { field: 'label', filter: true, sortable: true },
        { field: 'samples', filter: true, sortable: true },
        { field: 'fail', filter: true, sortable: true },
        { field: 'errorPct', headerName: 'Error %', filter: true, sortable: true },
        { field: 'average', filter: true, sortable: true },
        { field: 'min', filter: true, sortable: true },
        { field: 'max', filter: true, sortable: true },
        { field: 'median', filter: true, sortable: true },
        { field: 'ninetyTh', filter: true, sortable: true },
        { field: 'ninetyFifth', filter: true, sortable: true },
        { field: 'ninetyNinth', filter: true, sortable: true },
        { field: 'transactionsPerSec', headerName: 'Transactions/s', filter: true, sortable: true },
        { field: 'receivedKB', headerName: 'Received KB', filter: true, sortable: true },
        { field: 'sentKB', headerName: 'Sent KB', filter: true, sortable: true }
    ];

    useEffect(() => {
        if (!loadTestId || isNaN(loadTestId)) {
            setError("Invalid Load Test ID");
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosInstance.post('/api/jtl-results', { loadTestId }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                const fetchedData = Array.isArray(response.data) ? response.data : [];
                setRowData(fetchedData);
                setRowCount(fetchedData.length);
            } catch (error) {
                setError("Error fetching data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        if (autoRefresh) {
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval);
        }
    }, [loadTestId, autoRefresh]);

    const handleLogout = async () => {
        try {
            const response = await axiosInstance.post('/api/auth/logout', {}, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
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
            alert('An error occurred during logout.');
        }
    };

    return (
        <div className="jtl-container">
            <div className="top-buttons">
                <button className="dashboard-button" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
                <button className="refresh-toggle" onClick={() => setAutoRefresh(!autoRefresh)}>
                    {autoRefresh ? "Disable Auto-Refresh" : "Enable Auto-Refresh"}
                </button>
            </div>
            
            <h2>JTL Results (Load Test ID: {loadTestId})</h2>
            {error && <p className="error-message">{error}</p>}
            {loading && <p className="loading-message">Loading data...</p>}
            {!loading && rowData.length === 0 && <p>No Data Found</p>}
            
            <p><strong>Total Rows:</strong> {rowCount}</p>
            <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={50}
                    theme={themeQuartz}
                />
            </div>
        </div>
    );
};

export default JtlDataDisplay;

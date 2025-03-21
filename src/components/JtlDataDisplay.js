import { useState, useEffect, useRef } from "react"; // Import useRef
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
    const gridRef = useRef(); // Create a reference to the grid

    const columnDefs = [
        { field: 'label', filter: true, sortable: true },
        { field: 'samples', filter: true, sortable: true },
        { field: 'fail', filter: true, sortable: true },
        { field: 'errorPct', headerName: 'Error %', filter: true, sortable: true, valueFormatter: params => params.value !== undefined ? params.value.toFixed(2) : '' },
        { field: 'average', headerName: 'Average Time ms', filter: true, sortable: true, valueFormatter: params => params.value !== undefined ? params.value.toFixed(2) : '' },
        { field: 'min',  headerName: 'Min Time ms',filter: true, sortable: true, valueFormatter: params => params.value !== undefined ? params.value.toFixed(2) : '' },
        { field: 'max', headerName: 'Max Time ms', filter: true, sortable: true, valueFormatter: params => params.value !== undefined ? params.value.toFixed(2) : '' },
        { field: 'median', headerName: 'Median Time ms',filter: true, sortable: true, valueFormatter: params => params.value !== undefined ? params.value.toFixed(2) : '' },
        { field: 'ninetyth', headerName: '90th pct ms', filter: true, sortable: true, valueFormatter: params => params.value !== undefined ? params.value.toFixed(2) : '' },
        { field: 'ninetyFifth', headerName: '95th pct ms', filter: true, sortable: true, valueFormatter: params => params.value !== undefined ? params.value.toFixed(2) : '' },
        { field: 'ninetyninth', headerName: '99th pct ms', filter: true, sortable: true, valueFormatter: params => params.value !== undefined ? params.value.toFixed(2) : '' },
        { field: 'transactionsPerSec', headerName: 'Transactions/s', filter: true, sortable: true, valueFormatter: params => params.value !== undefined ? params.value.toFixed(2) : '' },
        { field: 'receivedKB', headerName: 'Received KB', filter: true, sortable: true, valueFormatter: params => params.value !== undefined ? params.value.toFixed(2) : '' },
        { field: 'sentKB', headerName: 'Sent KB', filter: true, sortable: true, valueFormatter: params => params.value !== undefined ? params.value.toFixed(2) : '' }
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

                // Resize columns to fit content after data is loaded
                if (gridRef.current && gridRef.current.api) {
                    gridRef.current.api.sizeColumnsToFit(); // Fit columns to the grid width
                    gridRef.current.api.autoSizeAllColumns(); // Auto-size columns based on content
                }
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
                    ref={gridRef} // Attach the reference to the grid
                    rowData={rowData}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={50}
                    theme={themeQuartz}
                    onGridReady={(params) => {
                        // Optional: Auto-size columns when the grid is ready
                        params.api.sizeColumnsToFit();
                        params.api.autoSizeAllColumns();
                    }}
                />
            </div>
        </div>
    );
};

export default JtlDataDisplay;
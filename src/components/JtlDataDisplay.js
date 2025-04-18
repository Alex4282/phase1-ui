import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "./JtlDataDisplay.css";
import axiosInstance from '../axiosInstance';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import { themeQuartz } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const JtlDataDisplay = ({ loadTestId, showRefreshButton = true }) => {
    const [rowData, setRowData] = useState([]);
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(showRefreshButton ? true : false);// Initialize with showRefreshButton value
    const navigate = useNavigate();
    const gridRef = useRef();

    const columnDefs = [
        { field: 'label', filter: true, sortable: true },
        { field: 'samples', filter: true, sortable: true },
        { field: 'fail', filter: true, sortable: true },
        { field: 'errorPct', headerName: 'Error %', filter: true, sortable: true, valueFormatter: params => (typeof params.value === "number" ? params.value.toFixed(2) : '') },
        { field: 'average', headerName: 'Avg Time ms', filter: true, sortable: true, valueFormatter: params => (typeof params.value === "number" ? params.value.toFixed(2) : '') },
        { field: 'min', headerName: 'Min Time ms', filter: true, sortable: true, valueFormatter: params => (typeof params.value === "number" ? params.value.toFixed(2) : '') },
        { field: 'max', headerName: 'Max Time ms', filter: true, sortable: true, valueFormatter: params => (typeof params.value === "number" ? params.value.toFixed(2) : '') },
        { field: 'median', headerName: 'Median Time ms', filter: true, sortable: true, valueFormatter: params => (typeof params.value === "number" ? params.value.toFixed(2) : '') },
        { field: 'ninetyth', headerName: '90th pct ms', filter: true, sortable: true, valueFormatter: params => (typeof params.value === "number" ? params.value.toFixed(2) : '') },
        { field: 'ninetyFifth', headerName: '95th pct ms', filter: true, sortable: true, valueFormatter: params => (typeof params.value === "number" ? params.value.toFixed(2) : '') },
        { field: 'ninetyninth', headerName: '99th pct ms', filter: true, sortable: true, valueFormatter: params => (typeof params.value === "number" ? params.value.toFixed(2) : '') },
        { field: 'transactionsPerSec', headerName: 'Transactions/s', filter: true, sortable: true, valueFormatter: params => (typeof params.value === "number" ? params.value.toFixed(2) : '') },
        { field: 'receivedKB', headerName: 'Received KB', filter: true, sortable: true, valueFormatter: params => (typeof params.value === "number" ? params.value.toFixed(2) : '') },
        { field: 'sentKB', headerName: 'Sent KB', filter: true, sortable: true, valueFormatter: params => (typeof params.value === "number" ? params.value.toFixed(2) : '') }
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

                if (gridRef.current && gridRef.current.api) {
                    gridRef.current.api.sizeColumnsToFit();
                    gridRef.current.api.autoSizeAllColumns();
                }
            } catch (error) {
                setError("Error fetching data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        if (autoRefresh && showRefreshButton) {
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval);
        }
    }, [loadTestId, autoRefresh,showRefreshButton]);

    return (
        <div className="jtl-container">
            <h2>JTL Results (Load Test ID: {loadTestId})</h2>
            
            {/* Conditionally render refresh button based on showRefreshButton prop */}
            {showRefreshButton && (
                <button className="refresh-toggle" onClick={() => setAutoRefresh(!autoRefresh)}>
                    {autoRefresh ? "Disable Auto-Refresh" : "Enable Auto-Refresh"}
                </button>
            )}
            
            {error && <p className="error-message">{error}</p>}
            {loading && <p className="loading-message">Loading data...</p>}
            {!loading && rowData.length === 0 && <p>No Data Found</p>}
            
            <p><strong>Total Rows:</strong> {rowCount}</p>
            <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={50}
                    theme={themeQuartz}
                    onGridReady={(params) => {
                        params.api.sizeColumnsToFit();
                        params.api.autoSizeAllColumns();
                    }}
                />
            </div>
        </div>
    );
};

export default JtlDataDisplay;
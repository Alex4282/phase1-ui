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
    const [autoRefresh, setAutoRefresh] = useState(showRefreshButton ? true : false);
    const [staleDataCount, setStaleDataCount] = useState(0);
    const [showStaleAlert, setShowStaleAlert] = useState(false);
    const [testDetails, setTestDetails] = useState(null);
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
    const [loaderTextIndex, setLoaderTextIndex] = useState(0);
    const loaderTexts = [
        "Validating your data...",
        "Starting the machines...",
        "Making connection...",
        "Getting things ready...",
        "Almost there... Please wait"
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
                
                // Check if data has changed
                if (JSON.stringify(fetchedData) === JSON.stringify(rowData)) {
                    // Data is the same - increment stale count
                    setStaleDataCount(prev => prev + 1);
                } else {
                    // Data has changed - reset stale count
                    setStaleDataCount(0);
                    setShowStaleAlert(false);
                    setRowData(fetchedData);
                    setRowCount(fetchedData.length);
                }

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
            const interval = setInterval(fetchData, 20000);
            return () => clearInterval(interval);
        }
    }, [loadTestId, autoRefresh, showRefreshButton, rowData]);

    // Show alert when staleDataCount reaches 3 and we have data
    useEffect(() => {
        if (staleDataCount >= 3 && rowData.length > 0) {
            setShowStaleAlert(true);
            navigate(`/final-report/${loadTestId}`);
        }
    }, [staleDataCount, rowData]);

    useEffect(() => {
        if (rowData.length === 0 && loading) {
            const interval = setInterval(() => {
                setLoaderTextIndex((prev) => (prev + 1) % loaderTexts.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [rowData.length, loading]);

    useEffect(() => {
        const fetchTestDetails = async () => {
            try {
                const response = await axiosInstance.get(`/api/jtl-results-test-details/${loadTestId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setTestDetails(response.data);
            } catch (error) {
                console.error("Error fetching test details:", error);
            }
        };

        if (loadTestId) {
            fetchTestDetails();
        }
    }, [loadTestId]);

    const loaderStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '10px',
        padding: '20px',
        margin: '20px 0',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        animation: 'pulse 2s infinite alternate'
    };

    const dotStyle = {
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: '#4a6baf',
        margin: '0 5px',
        animation: 'bounce 1.4s infinite ease-in-out'
    };
    return (
        <div className="jtl-container">
            <div className="test-header">
                <h2>
                    {testDetails ? (
                        <>
                            Project: <span className="project-name">{testDetails.projectName}</span> | 
                            Test ID: <span className="test-id">{loadTestId}</span>
                        </>
                    ) : (
                        `JTL Results (Load Test ID: ${loadTestId})`
                    )}
                </h2>
            </div>
            
            {showRefreshButton && (
                <button className="refresh-toggle" onClick={() => setAutoRefresh(!autoRefresh)}>
                    {autoRefresh ? "Disable Auto-Refresh" : "Enable Auto-Refresh"}
                </button>
            )}
            
            {showStaleAlert && (
                <div className="stale-alert">
                    <p>No new data received in the last 3 attempts. Data collection may be complete.</p>
                    <button onClick={() => setShowStaleAlert(false)}>Dismiss</button>
                </div>
            )}
            
            {error && <p className="error-message">{error}</p>}
            
            {rowData.length === 0 ? (
                <div style={loaderStyle}>
                    <h3 style={{ 
                        color: '#2c3e50',
                        marginBottom: '20px',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                    }}>
                        {loaderTexts[loaderTextIndex]}
                    </h3>
                    <div style={{ display: 'flex' }}>
                        <div style={{ ...dotStyle, animationDelay: '0s' }}></div>
                        <div style={{ ...dotStyle, animationDelay: '0.2s' }}></div>
                        <div style={{ ...dotStyle, animationDelay: '0.4s' }}></div>
                    </div>
                    <div style={{ 
                        marginTop: '20px',
                        fontSize: '14px',
                        color: '#7f8c8d'
                    }}>
                        Your test is being prepared...
                    </div>
                </div>
            ) : (
                <>                    
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
                </>
            )}
        </div>
    );
};


export default JtlDataDisplay;
import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import axiosInstance from '../../../axiosInstance';
import "./SummaryTab.css";

const SummaryTab = ({ loadTestId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeConsumingTransactions, setTimeConsumingTransactions] = useState([]);
    const [failedTransactions, setFailedTransactions] = useState([]);
    const [testDetails, setTestDetails] = useState({
        projectName: 'N/A',
        numUsers: 'N/A',
        rampUpTime: 'N/A',
        duration: 'N/A'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!loadTestId) {
                    throw new Error('No load test ID provided');
                }

                const [timeTrendsRes, failedRes, testDetailsRes] = await Promise.all([
                    axiosInstance.get(`/api/final-report-timeConsuming/${loadTestId}`)
                        .catch(() => ({ data: [] })),
                    axiosInstance.get(`/api/final-report-failed/${loadTestId}`)
                        .catch(() => ({ data: [] })),
                    axiosInstance.get(`/api/final-report-test-details/${loadTestId}`)
                        .catch(() => ({ data: {} }))
                ]);

                // Handle time consuming transactions
                const rawTimeTrends = Array.isArray(timeTrendsRes?.data) ? timeTrendsRes.data : [];
                setTimeConsumingTransactions(rawTimeTrends.slice(0, 5));

                // Handle failed transactions - account for both array and object responses
                let rawFailedData = [];
                if (Array.isArray(failedRes?.data)) {
                    rawFailedData = failedRes.data;
                } else if (failedRes?.data && typeof failedRes.data === 'object' && !Array.isArray(failedRes.data)) {
                    // If API returns an object with nested array, extract it here
                    rawFailedData = failedRes.data.transactions || failedRes.data.results || [];
                }
                setFailedTransactions(rawFailedData);

                // Handle test details with defaults
                setTestDetails({
                    projectName: testDetailsRes.data?.projectName || 'N/A',
                    numUsers: testDetailsRes.data?.numUsers || 'N/A',
                    rampUpTime: testDetailsRes.data?.rampUpTime || 'N/A',
                    duration: testDetailsRes.data?.duration || 'N/A'
                });

            } catch (err) {
                console.error("Error fetching summary data:", err);
                setError(err.message || 'Failed to load summary data');
                setTimeConsumingTransactions([]);
                setFailedTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [loadTestId]);

    // Prepare table data with null checks
    const timeConsumingData = (Array.isArray(timeConsumingTransactions) ? timeConsumingTransactions : []).map((transaction, index) => ({
        key: index,
        sno: index + 1,
        name: transaction?.[0] || 'Unknown Transaction',
        avgResponseTime: transaction?.[1] ? Math.round((transaction[1] / 1000) * 100) / 100 : 0
    }));

    const failedData = (Array.isArray(failedTransactions) ? failedTransactions : []).map((transaction, index) => ({
        key: index,
        sno: index + 1,
        name: transaction?.[0] || 'Unknown Transaction',
        totalTransactions: transaction?.[1] || 0,
        passTransactions: transaction?.[2] || 0,
        failedTransactions: transaction?.[3] || 0
    }));

    const timeConsumingColumns = [
        { title: 'S.No', dataIndex: 'sno', key: 'sno', width: 80 },
        { title: 'Transaction Name', dataIndex: 'name', key: 'name' },
        { 
            title: 'Avg Response Time (s)', 
            dataIndex: 'avgResponseTime', 
            key: 'avgResponseTime', 
            width: 200,
            render: (value) => value.toFixed(2) // Format to 2 decimal places
        }
    ];

    const failedColumns = [
        { title: 'S.No', dataIndex: 'sno', key: 'sno', width: 80 },
        { title: 'Transaction Name', dataIndex: 'name', key: 'name' },
        { title: 'Total', dataIndex: 'totalTransactions', key: 'total', width: 100 },
        { title: 'Passed', dataIndex: 'passTransactions', key: 'passed', width: 100 },
        { 
            title: 'Failed', 
            dataIndex: 'failedTransactions', 
            key: 'failed', 
            width: 100,
            render: (value, record) => (
                <span style={{ color: value > 0 ? 'red' : 'inherit' }}>
                    {value}
                </span>
            )
        }
    ];

    if (loading) return <div className="loading">Loading summary data...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="tab-content">
            <h2>Executive Summary</h2>
            
            <div className="summary-card">
                <p>The following is the summary of the test <strong>{testDetails.projectName}</strong> with a load of <strong>{testDetails.numUsers} users</strong> with <strong>{testDetails.rampUpTime} ramp-up Time</strong> seconds.</p>
                <p>At a load of <strong>{testDetails.numUsers} users</strong>, the application was able to successfully complete <strong>{failedData.reduce((sum, item) => sum + (item.passTransactions || 0), 0)} transactions</strong> within a span of <strong>{testDetails.duration} seconds</strong>.</p>
            </div>

            <div className="tables-container">
                <div className="table-wrapper">
                    <h3 className="table-heading">Top 5 Time-Consuming Transactions</h3>
                    <Table
                        className="transactions-table"
                        columns={timeConsumingColumns}
                        dataSource={timeConsumingData.length > 0 ? timeConsumingData : [{ key: 0, sno: 1, name: 'No data available', avgResponseTime: 0 }]}
                        pagination={false}
                        size="middle"
                        locale={{ emptyText: 'No time-consuming transactions data available' }}
                    />
                </div>
                
                <div className="table-wrapper">
                    <h3 className="table-heading">Transactions That Failed During Test</h3>
                    <Table
                        className="transactions-table"
                        columns={failedColumns}
                        dataSource={failedData.length > 0 ? failedData : [{ key: 0, sno: 1, name: 'No data available', totalTransactions: 0, passTransactions: 0, failedTransactions: 0 }]}
                        pagination={false}
                        size="middle"
                        locale={{ emptyText: 'No failed transactions data available' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default SummaryTab;
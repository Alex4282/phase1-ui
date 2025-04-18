import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axiosInstance from '../../../axiosInstance';
import "./PerformanceTrendsTab.css";

Chart.register(...registerables);

const PerformanceTrendsTab = ({ loadTestId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeTrends, setTimeTrends] = useState([]);
    const [passFailedData, setPassFailedData] = useState([]);
    const [jtlData, setJtlData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const [timeTrendsRes, passFailedRes, jtlDataRes] = await Promise.all([
                    axiosInstance.get(`/api/final-report-timeConsuming/${loadTestId}`).catch(() => ({ data: [] })),
                    axiosInstance.get(`/api/final-report-pass-failed/${loadTestId}`).catch(() => ({ data: [] })),
                    axiosInstance.get(`/api/report/${loadTestId}`).catch(() => ({ data: [] }))
                ]);

                setTimeTrends(Array.isArray(timeTrendsRes?.data) ? timeTrendsRes.data : []);
                setPassFailedData(Array.isArray(passFailedRes?.data) ? passFailedRes.data : []);
                setJtlData(Array.isArray(jtlDataRes?.data) ? jtlDataRes.data : []);
            } catch (err) {
                console.error("Error fetching performance data:", err);
                setError(err.message || 'Failed to load performance data');
                setTimeTrends([]);
                setPassFailedData([]);
                setJtlData([]);
            } finally {
                setLoading(false);
            }
        };

        if (loadTestId) {
            fetchData();
        } else {
            setError('No load test ID provided');
            setLoading(false);
        }
    }, [loadTestId]);

    const prepareTimeSeriesData = () => {
        const safeJtlData = Array.isArray(jtlData) ? jtlData : [];
        const labels = safeJtlData.map(entry => 
            entry?.timeStamp ? new Date(entry.timeStamp).toLocaleTimeString() : ''
        ).filter(Boolean);
        
        return {
            labels,
            datasets: [
                {
                    label: 'Response Time (ms)',
                    data: safeJtlData.map(entry => entry?.elapsed || 0),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: 'Active Threads',
                    data: safeJtlData.map(entry => entry?.allThreads || 0),
                    borderColor: 'rgb(255, 99, 132)',
                    yAxisID: 'y1'
                }
            ]
        };
    };

    const prepareErrorDistributionData = () => {
        const safeJtlData = Array.isArray(jtlData) ? jtlData : [];
        const errorCodes = {};
        
        safeJtlData.forEach(entry => {
            if (entry && !entry.success && entry.responseCode) {
                errorCodes[entry.responseCode] = (errorCodes[entry.responseCode] || 0) + 1;
            }
        });
        
        const errorLabels = Object.keys(errorCodes);
        if (errorLabels.length === 0) {
            errorLabels.push('No Errors');
            errorCodes['No Errors'] = 1;
        }
        
        return {
            labels: errorLabels,
            datasets: [{
                label: 'Error Distribution',
                data: Object.values(errorCodes),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ]
            }]
        };
    };

    const prepareThroughputData = () => {
        const safeJtlData = Array.isArray(jtlData) ? jtlData : [];
        if (safeJtlData.length === 0) {
            return {
                labels: ['No Data'],
                datasets: [{
                    label: 'Requests per Interval',
                    data: [0],
                    backgroundColor: 'rgba(53, 162, 235, 0.5)'
                }]
            };
        }

        const interval = Math.max(1, Math.floor(safeJtlData.length / 10));
        const labels = [];
        const data = [];
        
        for (let i = 0; i < safeJtlData.length; i += interval) {
            const end = Math.min(i + interval, safeJtlData.length);
            labels.push(`${i}-${end}`);
            data.push(end - i);
        }
        
        return {
            labels,
            datasets: [{
                label: 'Requests per Interval',
                data,
                backgroundColor: 'rgba(53, 162, 235, 0.5)'
            }]
        };
    };

    const prepareTimeTrendsChartData = () => {
        const safeTimeTrends = Array.isArray(timeTrends) ? timeTrends : [];
        if (safeTimeTrends.length === 0) {
            return {
                labels: ['No Data'],
                datasets: [{
                    label: 'Average Response Time (ms)',
                    data: [0],
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            };
        }

        return {
            labels: safeTimeTrends.map(item => item?.[0] || 'Unknown'),
            datasets: [{
                label: 'Average Response Time (ms)',
                data: safeTimeTrends.map(item => Math.round(item?.[1] || 0)),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
    };

    const preparePassFailData = () => {
        const safePassFailedData = Array.isArray(passFailedData) ? passFailedData : [];
        if (safePassFailedData.length === 0) {
            return {
                labels: ['No Data'],
                datasets: [
                    {
                        label: 'Total Samples',
                        data: [0],
                        backgroundColor: 'rgba(54, 162, 235, 0.7)'
                    },
                    {
                        label: 'Passed',
                        data: [0],
                        backgroundColor: 'rgba(75, 192, 192, 0.7)'
                    },
                    {
                        label: 'Failed',
                        data: [0],
                        backgroundColor: 'rgba(255, 99, 132, 0.7)'
                    }
                ]
            };
        }

        return {
            labels: safePassFailedData.map(item => item?.[0] || 'Unknown'),
            datasets: [
                {
                    label: 'Total Samples',
                    data: safePassFailedData.map(item => item?.[1] || 0),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                },
                {
                    label: 'Passed',
                    data: safePassFailedData.map(item => item?.[2] || 0),
                    backgroundColor: 'rgba(75, 192, 192, 0.7)'
                },
                {
                    label: 'Failed',
                    data: safePassFailedData.map(item => item?.[3] || 0),
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                }
            ]
        };
    };

    if (loading) return <div className="loading">Loading performance data...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="tab-content">
            <h2>Performance Trends</h2>
            <div className="performance-chart-group"> 
                <div className="chart-row-full">
                    <div className="chart-container">
                        <h3>Response Time vs Threads</h3>
                        <Line 
                            data={prepareTimeSeriesData()}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        type: 'linear',
                                        display: true,
                                        position: 'left',
                                        title: { display: true, text: 'Response Time (ms)' }
                                    },
                                    y1: {
                                        type: 'linear',
                                        display: true,
                                        position: 'right',
                                        title: { display: true, text: 'Thread Count' },
                                        grid: {
                                            drawOnChartArea: false
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
                
                <div className="chart-row-split">
                    <div className="chart-container error-distribution-container">
                        <h3>Error Distribution</h3>
                        <Pie 
                            data={prepareErrorDistributionData()}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            boxWidth: 12,
                                            font: {
                                                size: 10
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                    
                    <div className="chart-container throughput-container">
                        <h3>Request Throughput</h3>
                        <Bar 
                            data={prepareThroughputData()}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Requests'
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
            
            <div className="performance-chart-group">
                <div className="trends-container">
                    <div className="chart-container">
                        <h3>Average Response Time Trends</h3>
                        <div style={{ height: '400px' }}>
                            <Bar 
                                data={prepareTimeTrendsChartData()} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Response Time (ms)'
                                            }
                                        },
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Transaction Name'
                                            }
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    
                    <div className="chart-container">
                        <h3>Pass/Fail Transaction Trends</h3>
                        <div style={{ height: '400px' }}>
                            <Bar 
                                data={preparePassFailData()}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Number of Samples'
                                            }
                                        },
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Transaction Name'
                                            }
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            position: 'top'
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceTrendsTab;
import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import "./Report.css";

// Register Chart.js components
Chart.register(...registerables);

const Report = ({ loadTestId }) => {
    const [jtlData, setJtlData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const response = await axiosInstance.get(`/api/report/${loadTestId}`);
                setJtlData(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error("Error fetching report data:", err);
            }
        };

        fetchReportData();
    }, [loadTestId]);

    const prepareTimeSeriesData = () => {
        const labels = jtlData.map(entry => new Date(entry.timeStamp).toLocaleTimeString());
        return {
            labels,
            datasets: [
                {
                    label: 'Response Time (ms)',
                    data: jtlData.map(entry => entry.elapsed),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: 'Active Threads',
                    data: jtlData.map(entry => entry.allThreads),
                    borderColor: 'rgb(255, 99, 132)',
                    yAxisID: 'y1'
                }
            ]
        };
    };

    const prepareErrorDistributionData = () => {
        const errorCodes = {};
        jtlData.forEach(entry => {
            if (!entry.success) {
                errorCodes[entry.responseCode] = (errorCodes[entry.responseCode] || 0) + 1;
            }
        });
        
        return {
            labels: Object.keys(errorCodes),
            datasets: [{
                label: 'Error Distribution',
                data: Object.values(errorCodes),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ]
            }]
        };
    };

    const prepareThroughputData = () => {
        const interval = Math.floor(jtlData.length / 10);
        const labels = [];
        const data = [];
        
        for (let i = 0; i < jtlData.length; i += interval) {
            const end = Math.min(i + interval, jtlData.length);
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

    if (loading) return <div className="loading">Loading report data...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!jtlData.length) return <div className="no-data">No data available for this test</div>;

    return (
        <div className="report-container">
        <h2>Performance Test Report - ID: {loadTestId}</h2>
        
        {/* Full-width Response Time chart */}
        <div className="chart-row-full">
            <div className="chart-container">
                <h3>Response Time vs Threads</h3>
                <Line 
    data={prepareTimeSeriesData()}
    options={{
        responsive: true,
        maintainAspectRatio: false, // Add this
        onHover: (e) => {
            // Prevent height changes on hover
            const chart = e.chart;
            chart.options.maintainAspectRatio = false;
            chart.update();
        },
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
        
        {/* Split charts row */}
        <div className="chart-row-split">
            {/* Error Distribution Pie Chart (40%) */}
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
            
            {/* Request Throughput Bar Chart (60%) */}
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
            <div className="metrics-summary">
                <h3>Key Metrics</h3>
                <div className="metrics-grid">
                    <div className="metric-card">
                        <h4>Average Response Time</h4>
                        <p>
                            {Math.round(jtlData.reduce((sum, entry) => sum + entry.elapsed, 0) / jtlData.length)} ms
                        </p>
                    </div>
                    <div className="metric-card">
                        <h4>Error Rate</h4>
                        <p>
                            {((jtlData.filter(entry => !entry.success).length / jtlData.length * 100).toFixed(2))}%
                        </p>
                    </div>
                    <div className="metric-card">
                        <h4>Peak Throughput</h4>
                        <p>
                            {Math.max(...prepareThroughputData().datasets[0].data)} req/s
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Report;
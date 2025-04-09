import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';
import { Table, Tabs, Card } from 'antd';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import JtlDataDisplay from '../JtlDataDisplay';
import "./FinalReport.css";
import "../Report.css"; 

// Register Chart.js components
Chart.register(...registerables);

const { TabPane } = Tabs;

const FinalReport = ({ loadTestId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeConsumingTransactions, setTimeConsumingTransactions] = useState([]);
    const [timeTrends, setTimeTrends] = useState([]);
    const [failedTransactions, setFailedTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('1');
    const [passFailedData, setPassFailedData] = useState([]);
    const [jtlData, setJtlData] = useState([]); // Added for new charts
    const [testDetails,setTestDetails] = useState({});

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const [timeTrendsRes, failedRes, passFailedData, jtlDataRes,testDetails] = await Promise.all([
                    axiosInstance.get(`/api/final-report-timeConsuming/${loadTestId}`),
                    axiosInstance.get(`/api/final-report-failed/${loadTestId}`),
                    axiosInstance.get(`/api/final-report-pass-failed/${loadTestId}`),
                    axiosInstance.get(`/api/report/${loadTestId}`),
                    axiosInstance.get(`/api/final-report-test-details/${loadTestId}`)
                ]);

                setTimeTrends(timeTrendsRes.data);
                setTimeConsumingTransactions(timeTrendsRes.data.slice(0,5));
                setFailedTransactions(failedRes.data);
                setPassFailedData(passFailedData.data);
                setJtlData(jtlDataRes.data);
                setTestDetails(testDetails.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error("Error fetching report data:", err);
            }
        };

        fetchReportData();
    }, [loadTestId]);

    // Chart data preparation functions from Report component
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

    const prepareTimeTrendsChartData = () => {
        return {
            labels: timeTrends.map(item => item[0]),
            datasets: [{
                label: 'Average Response Time (ms)',
                data: timeTrends.map(item => Math.round(item[1])),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
    };

    // Calculate metrics for summary
    const calculateMetrics = () => {
        if (!jtlData.length) return {};
        
        const avgResponseTime = Math.round(jtlData.reduce((sum, entry) => sum + entry.elapsed, 0) / jtlData.length);
        const errorRate = ((jtlData.filter(entry => !entry.success).length / jtlData.length * 100).toFixed(2));
        const peakThroughput = Math.max(...(prepareThroughputData().datasets[0].data));
        
        return { avgResponseTime, errorRate, peakThroughput };
    };

    const metrics = calculateMetrics();

    if (loading) return <div className="loading">Loading report data...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    // Prepare table data
    const timeConsumingData = timeConsumingTransactions.map((transaction, index) => ({
        key: index,
        sno: index + 1,
        name: transaction[0],
        avgResponseTime: Math.round(transaction[1] / 1000 * 100) / 100

    }));

    const failedData = failedTransactions.map((transaction, index) => ({
        key: index,
        sno: index + 1,
        name: transaction[0],
        totalTransactions: transaction[1],
        passTransactions: transaction[2],
        failedTransactions: transaction[3]
    }));

    const timeConsumingColumns = [
        { title: 'S.No', dataIndex: 'sno', key: 'sno', width: 80 },
        { title: 'Transaction Name', dataIndex: 'name', key: 'name' },
        { title: 'Avg Response Time (s)', dataIndex: 'avgResponseTime', key: 'avgResponseTime', width: 200 }
    ];

    const failedColumns = [
        { title: 'S.No', dataIndex: 'sno', key: 'sno', width: 80 },
        { title: 'Transaction Name', dataIndex: 'name', key: 'name' },
        { title: 'Total', dataIndex: 'totalTransactions', key: 'total', width: 100 },
        { title: 'Passed', dataIndex: 'passTransactions', key: 'passed', width: 100 },
        { title: 'Failed', dataIndex: 'failedTransactions', key: 'failed', width: 100 }
    ];

    return (
        <div className="final-report-container">
            <div className='export-button'><button>Export as CSV</button> </div>
            <div className='export-button-pdf'><button>Export as PDF</button> </div>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Summary Report" key="1">
                    <div className="tab-content">
                        <h2>Executive Summary</h2>
                        
                        <div className="summary-card">
                            <p>The following is the summary of the test <strong>{testDetails.projectName}</strong> with a load of <strong>{testDetails.numUsers} users</strong> with <strong>{testDetails.rampUpTime} ramp-up Time</strong>.</p>
                            <p>At a load of <strong>{testDetails.numUsers} users</strong>, the application was able to successfully complete <strong>5 transactions</strong> within a span of <strong>{testDetails.duration} minutes</strong>.</p>
                        </div>

                        {/* Added metrics cards */}
                        <div className="metrics-summary">
                            <h3>Key Metrics</h3>
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <h4>Average Response Time</h4>
                                    <p>{metrics.avgResponseTime || 'N/A'} ms</p>
                                </div>
                                <div className="metric-card">
                                    <h4>Error Rate</h4>
                                    <p>{metrics.errorRate || '0'}%</p>
                                </div>
                                <div className="metric-card">
                                    <h4>Peak Throughput</h4>
                                    <p>{metrics.peakThroughput || 'N/A'} req/s</p>
                                </div>
                            </div>
                        </div>

                        <div className="tables-container">
                            <div className="table-wrapper">
                                <h3 className="table-heading">Top 5 Time-Consuming Transactions</h3>
                                <Table
                                    className="transactions-table"
                                    columns={timeConsumingColumns}
                                    dataSource={timeConsumingData}
                                    pagination={false}
                                    size="middle"
                                />
                            </div>
                            
                            <div className="table-wrapper">
                                <h3 className="table-heading">Transactions That Failed During Test</h3>
                                <Table
                                    className="transactions-table"
                                    columns={failedColumns}
                                    dataSource={failedData}
                                    pagination={false}
                                    size="middle"
                                />
                            </div>
                        </div>
                    </div>
                </TabPane>

                <TabPane tab="Performance Trends" key="2">
                    <div className="tab-content">
                        <h2>Performance Trends</h2>
                        <div className="performance-chart-group"> 
                        {/* Added new charts from Report component */}
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
                        {/* Existing charts */}
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
                                        data={{
                                            labels: passFailedData.map(item => item[0]),
                                            datasets: [
                                                {
                                                    label: 'Total Samples',
                                                    data: passFailedData.map(item => item[1]),
                                                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                                                },
                                                {
                                                    label: 'Passed',
                                                    data: passFailedData.map(item => item[2]),
                                                    backgroundColor: 'rgba(75, 192, 192, 0.7)'
                                                },
                                                {
                                                    label: 'Failed',
                                                    data: passFailedData.map(item => item[3]),
                                                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                                                }
                                            ]
                                        }}
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
                </TabPane>

                <TabPane tab="Detailed Results" key="3">
                    <div className="tab-content">
                        <h2>Detailed Test Results</h2>
                        <JtlDataDisplay loadTestId={loadTestId} showRefreshButton={false} />
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default FinalReport;
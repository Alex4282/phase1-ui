import React, { useState } from 'react';
import { Tabs } from 'antd';
import SummaryTab from './summaryTab/SummaryTab';
import PerformanceTrendsTab from './performanceTrendsTab/PerformanceTrendsTab';
import DetailedResultsTab from './detailedResultsTab/DetailedResultsTab';
import "./FinalReport.css";

const { TabPane } = Tabs;

const FinalReport = ({ loadTestId }) => {
    const [activeTab, setActiveTab] = useState('1');

    return (
        <div className="final-report-container">
            <div className='export-button'><button>Export as CSV</button></div>
            <div className='export-button-pdf'><button>Export as PDF</button></div>
            
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Summary Report" key="1">
                    <SummaryTab loadTestId={loadTestId} />
                </TabPane>

                <TabPane tab="Performance Trends" key="2">
                    <PerformanceTrendsTab loadTestId={loadTestId} />
                </TabPane>

                <TabPane tab="Detailed Results" key="3">
                    <DetailedResultsTab loadTestId={loadTestId} />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default FinalReport;
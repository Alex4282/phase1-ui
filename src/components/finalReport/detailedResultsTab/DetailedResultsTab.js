import React from 'react';
import JtlDataDisplay from '../../JtlDataDisplay';
import "./DetailedResultsTab.css";

const DetailedResultsTab = ({ loadTestId }) => {
    return (
        <div className="tab-content">
            <h2>Detailed Test Results</h2>
            <JtlDataDisplay loadTestId={loadTestId} showRefreshButton={false} />
        </div>
    );
};

export default DetailedResultsTab;
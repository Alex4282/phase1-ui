import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useParams, Link } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/DashBoard";
import PrivateRoute from "./components/PrivateRoute";
import FileUploadForm from "./components/JmxForm";
import Results from "./components/Results";
import DatabasePage from "./components/ManageDatabase";
import JtlDataDisplay from "./components/JtlDataDisplay";
import Navbar from "./components/Navbar";
import Report from "./components/Report";
import FinalReport from "./components/finalReport/FinalReport";
import "./App.css";
import ProjectDashboard from "./components/ProjectDashboard";

const JtlDataWrapper = () => {
    const { loadTestId } = useParams();

    if (!loadTestId || isNaN(loadTestId)) {
        console.error("Invalid or missing loadTestId:", loadTestId);
        return <p>Error: Invalid Load Test ID</p>;
    }

    return <JtlDataDisplay loadTestId={parseInt(loadTestId, 10)} />;
};

const ReportWrapper = () => {
    const { loadTestId } = useParams();

    if (!loadTestId || isNaN(loadTestId)) {
        console.error("Invalid or missing loadTestId:", loadTestId);
        return <p>Error: Invalid Load Test ID</p>;
    }

    return <Report loadTestId={parseInt(loadTestId, 10)} />;
};
const FinalReportWrapper = () => {
    const { loadTestId } = useParams();

    if (!loadTestId || isNaN(loadTestId)) {
        console.error("Invalid or missing loadTestId:", loadTestId);
        return <p>Error: Invalid Load Test ID</p>;
    }

    return <FinalReport loadTestId={parseInt(loadTestId, 10)} />;
};

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
    };

    return (
        <Router>
           <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} /> {/* Use the Navbar component */}
            <Routes>
                <Route path="/" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PrivateRoute element={Dashboard} isAuthenticated={isAuthenticated} />} />
                <Route path="/jmxform" element={<PrivateRoute element={FileUploadForm} isAuthenticated={isAuthenticated} />} />
                <Route path="/results" element={<PrivateRoute element={Results} isAuthenticated={isAuthenticated} />} />
                <Route path="/manageDatabase" element={<PrivateRoute element={DatabasePage} isAuthenticated={isAuthenticated} />} />
                <Route path="/report/:loadTestId" element={<PrivateRoute element={ReportWrapper} isAuthenticated={isAuthenticated} />} />
                <Route path="/jtl-data/:loadTestId" element={<PrivateRoute element={JtlDataWrapper} isAuthenticated={isAuthenticated} />} />
                <Route path="/final-report/:loadTestId" element={<PrivateRoute element={FinalReportWrapper} isAuthenticated={isAuthenticated} />} />
                <Route path="/project-dashboard" element={<PrivateRoute element={ProjectDashboard} isAuthenticated={isAuthenticated} />} />
            </Routes>
        </Router>
    );
};

export default App;
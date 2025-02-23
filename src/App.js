import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/DashBoard";
import PrivateRoute from "./components/PrivateRoute";
import FileUploadForm from "./components/JmxForm";
import Results from "./components/Results";
import DatabasePage from "./components/ManageDatabase";
import JtlDataDisplay from "./components/JtlDataDisplay";

const JtlDataWrapper = () => {
    const { loadTestId } = useParams();
    
    if (!loadTestId || isNaN(loadTestId)) {
        console.error("Invalid or missing loadTestId:", loadTestId);
        return <p>Error: Invalid Load Test ID</p>;
    }

    return <JtlDataDisplay loadTestId={parseInt(loadTestId, 10)} />;
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

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<PrivateRoute element={Dashboard} isAuthenticated={isAuthenticated} />} />
                <Route path="/jmxform" element={<PrivateRoute element={FileUploadForm} isAuthenticated={isAuthenticated} />} />
                <Route path="/results" element={<PrivateRoute element={Results} isAuthenticated={isAuthenticated} />} />
                <Route path="/manageDatabase" element={<PrivateRoute element={DatabasePage} isAuthenticated={isAuthenticated} />} />
                <Route path="/jtl-data/:loadTestId" element={<PrivateRoute element={JtlDataWrapper} isAuthenticated={isAuthenticated} />} />
            </Routes>
        </Router>
    );
};

export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/DashBoard';
import PrivateRoute from './components/PrivateRoute';
import JmxForm from './components/JmxForm';
import FileUploadForm from './components/JmxForm';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
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
                
            </Routes>
        </Router>
    );
};

export default App;

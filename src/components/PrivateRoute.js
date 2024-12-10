import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component, isAuthenticated, ...rest }) => {
    const token = localStorage.getItem('token');
    return token ? <Component {...rest} /> : <Navigate to="/" />;
};

export default PrivateRoute;

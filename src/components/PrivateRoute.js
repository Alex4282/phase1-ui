import React from "react";
import { Navigate, useParams } from "react-router-dom";

const PrivateRoute = ({ element: Component, isAuthenticated }) => {
    const token = localStorage.getItem("token");
    const params = useParams(); // Extract route params

    return token ? <Component {...params} /> : <Navigate to="/" />;
};

export default PrivateRoute;

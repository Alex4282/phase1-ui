import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isAuthenticated, handleLogout }) => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">Perfeasy</div>
            <ul className="navbar-links">
                {isAuthenticated ? (
                    <>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/jmxform">Performance Test</Link></li>
                        <li>
                            <Link 
                                to="#" 
                                onClick={handleLogout} 
                                className="logout-link"
                            >
                                Logout
                            </Link>
                        </li>
                    </>
                ) : (
                    <>
                        <li><Link to="/">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;

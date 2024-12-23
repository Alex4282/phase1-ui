import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Ensure this line is present
import axios from 'axios';
import './Login.css';
import axiosInstance from '../../axiosInstance';

const Login = ({onLogin}) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate(); // <-- Ensure you have this line for the navigation hook

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axiosInstance.post('/api/auth/login', credentials, {
                withCredentials: true, // Include credentials if required (cookies, etc.)
            });
    
            if (response.status === 200) {
                // alert('Login successful!');
                const token = response.data.accessToken; 
                console.log(token);
                localStorage.setItem('token', token); // Store token for future requests
                onLogin();
                navigate('/dashboard'); // Redirect on success
            } else {
                alert('Login failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred. Please try again.');
        }
    };
    

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login</h2>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                    className="login-input"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    className="login-input"
                />
                <button type="submit" className="login-button">
                    Login
                </button>
                <p className="redirect-text">
                    Not a user?{' '}
                    <span
                        className="redirect-link"
                        onClick={() => navigate('/register')}
                    >
                        Register
                    </span>
                </p>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;





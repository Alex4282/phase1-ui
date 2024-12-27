import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Import the CSS file
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(formData.username);
            console.log(formData.email);
            console.log(formData.password);
            
            const response = await axiosInstance.post('/api/auth/register', formData);
            alert('Registration successful');
            navigate('/');
        } catch (err) {
            alert('Registration failed');
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleSubmit} className="register-form">
                <h2>Register</h2>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                    className="register-input"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    className="register-input"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    className="register-input"
                />
                <button type="submit" className="register-button">
                    Register
                </button>
                <p>
                    Already have an account?{' '}
                    <Link to="/" className="back-to-login-link">
                        Back to Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Register;

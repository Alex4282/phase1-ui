import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; // Use consistent CSS styling

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
            const response = await axiosInstance.post('/api/auth/register', formData);
            alert('Registration successful');
            navigate('/');
        } catch (err) {
            alert('Registration failed. Please try again.');
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
                <p className="redirect-text">
                    Already have an account?{' '}
                    <Link to="/" className="redirect-link">
                        Back to Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Register;

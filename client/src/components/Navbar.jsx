import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const navigate = useNavigate();
    const { user, role, loading } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-title">GreatMiNDs</div>
            {!loading && (
                <div className="navbar-links">
                    {user ? (
                        <>
                            <button className="programs-btn">Programs</button>
                            <button className="programs-btn" onClick={() => navigate('/dashboard')}>
                                Calendar
                            </button>
                            {(role?.toLowerCase() === 'participant' || role?.toLowerCase() === 'volunteer') && (
                                <button className="programs-btn" onClick={() => navigate('/my-registrations')}>
                                    My Registrations
                                </button>
                            )}
                            <button className="programs-btn">About</button>
                            <button className="home-btn">Home</button>
                        </>
                    ) : (
                        <button className="home-btn" onClick={() => navigate('/login')}>Login</button>
                    )}
                </div>
            )}
        </nav>
    );
}
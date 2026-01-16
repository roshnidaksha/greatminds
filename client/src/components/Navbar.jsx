import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, role } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-title">GreatMiNDs</div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        {user && <Link to="/dashboard">Dashboard</Link>}
        {user && (role?.toLowerCase() === 'participant' || role?.toLowerCase() === 'volunteer') && (
          <Link to="/my-registrations">My Registrations</Link>
        )}
      </div>
    </nav>
  );
}

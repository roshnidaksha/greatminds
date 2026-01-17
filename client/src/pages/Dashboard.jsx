import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import ParticipantCalendar from "../components/calendar/ParticipantCalendar";
import StaffCalendar from "../components/calendar/StaffCalendar";
import VolunteerCalendar from "../components/calendar/VolunteerCalendar";
import "./Dashboard.css";

export default function Dashboard() {
    const navigate = useNavigate();
    const { role, loading, user } = useAuth();

    if (!user) {
        navigate("/login");
        return null;
    }

    const renderDashboardContent = () => {
        switch(role?.toLowerCase()) {
            case "staff":
                return <StaffCalendar />;
            
            case "volunteer":
                return <VolunteerCalendar />;
            
            case "participant":
                return <ParticipantCalendar />
            
            default:
                return <p>Invalid role</p>;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-header-info">
                    <h2>Welcome, {user.email}!</h2>
                    <p>
                        Logged in as <strong>{role}</strong>
                    </p>
                </div>

                <button
                    className="logout-btn"
                    onClick={async () => {
                        try {
                            await signOut(auth);
                            navigate("/login");
                        } catch (e) {
                            console.error("Logout failed", e);
                        }
                    }}
                >
                    🚪 Log out
                </button>
            </div>
            
            <div className="dashboard-content">
                {renderDashboardContent()}
            </div>
        </div>
    );
}
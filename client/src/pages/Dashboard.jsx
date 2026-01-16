import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import ParticipantCalendar from "../components/calendar/ParticipantCalendar";
import StaffCalendar from "../components/calendar/StaffCalendar";
import VolunteerCalendar from "../components/calendar/VolunteerCalendar";

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
        <div style={{ padding: "120px 32px 32px 32px" }}>
            <div
                style={{
                    background: "white",
                    padding: "20px 28px",
                    borderRadius: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    marginBottom: "24px"
                }}
            >
                <div>
                    <h2 style={{ margin: 0 }}>Welcome, {user.email} ({role})</h2>
                    <p style={{ margin: 0, color: "#555" }}>
                        Logged in as <strong>{role}</strong>
                    </p>
                </div>

                <button
                    onClick={async () => {
                        try {
                            await signOut(auth);
                            navigate("/login");
                        } catch (e) {
                            console.error("Logout failed", e);
                        }
                    }}
                    style={{
                        border: "none",
                        borderRadius: "12px",
                        padding: "10px 16px",
                        cursor: "pointer"
                    }}
                >
                    Log out
                </button>
            </div>
            
            {renderDashboardContent()}
        </div>
    );
}
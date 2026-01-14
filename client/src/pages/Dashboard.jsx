import { useNavigate } from "react-router-dom";
import StaffCalendar from "../components/StaffCalendar";

export default function Dashboard() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    const renderDashboardContent = () => {
        switch(role) {
            case "Staff":
                return <StaffCalendar />;
            
            case "Volunteer":
                return (
                    <div style={{ 
                        background: "white", 
                        padding: "40px", 
                        borderRadius: "16px",
                        textAlign: "center",
                        marginTop: "20px",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
                    }}>
                        <h2>Volunteer Dashboard</h2>
                        <p style={{ color: "#666" }}>Volunteer view coming soon...</p>
                    </div>
                );
            
            case "Participant":
                return (
                    <div style={{ 
                        background: "white", 
                        padding: "40px", 
                        borderRadius: "16px",
                        textAlign: "center",
                        marginTop: "20px",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
                    }}>
                        <h2>Participant Dashboard</h2>
                        <p style={{ color: "#666" }}>Participant view coming soon...</p>
                    </div>
                );
            
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
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
                }}
            >
                <div>
                    <h2 style={{ margin: 0 }}>Hello, user details</h2>
                    <p style={{ margin: 0, color: "#555" }}>
                        Logged in as <strong>{role}</strong>
                    </p>
                </div>

                <button
                    onClick={() => {
                        localStorage.clear();
                        navigate("/");
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
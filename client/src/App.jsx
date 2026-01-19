import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EventDetailsPage from "./pages/EventDetailsPage";
import MyRegistrations from "./pages/MyRegistrations";
import ParticipantRegistrations from "./pages/ParticipantRegistrations";
import VolunteerRegistrations from "./pages/VolunteerRegistrations";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

function AppRoutes() {
    const { user, role } = useAuth();

    if (!user) {
        return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/event-details" element={role === "staff" ? <EventDetailsPage /> : <Navigate to="/" replace />} />
            <Route path="/my-registrations" element={role === "participant" || role === "volunteer" ? <MyRegistrations /> : <Navigate to="/" replace />} />
            <Route path="/participant-registrations" element={role === "staff" ? <ParticipantRegistrations /> : <Navigate to="/" replace />} />
            <Route path="/volunteer-registrations" element={role === "staff" ? <VolunteerRegistrations /> : <Navigate to="/" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
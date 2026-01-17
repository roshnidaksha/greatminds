import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EventDetailsPage from "./pages/EventDetailsPage";
import MyRegistrations from "./pages/MyRegistrations";
import ParticipantRegistrations from "./pages/ParticipantRegistrations";
import VolunteerRegistrations from "./pages/VolunteerRegistrations";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/event-details" element={<EventDetailsPage />} />
                    <Route path="/my-registrations" element={<MyRegistrations />} />
                    <Route path="/participant-registrations" element={<ParticipantRegistrations />} />
                    <Route path="/volunteer-registrations" element={<VolunteerRegistrations />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
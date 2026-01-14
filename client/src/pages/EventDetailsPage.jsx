import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import activityImages from "../data/images.json";
import participantsData from "../data/participants.json";
import volunteersData from "../data/volunteers.json";

export default function EventDetailsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { event, onUpdate } = location.state || {};

    const [formData, setFormData] = useState({
        title: event?.title || "",
        startTime: event?.start ? new Date(event.start).toTimeString().slice(0, 5) : "09:00",
        endTime: event?.end ? new Date(event.end).toTimeString().slice(0, 5) : "10:00",
        isWheelchairAccessible: event?.extendedProps?.isWheelchairAccessible || false,
        imageUrl: event?.extendedProps?.imageUrl || activityImages[0].url,
        contactIc: event?.extendedProps?.contactIc || "",
        cost: event?.extendedProps?.cost || ""
    });

    // Load participants and volunteers for this event
    const [participants, setParticipants] = useState([]);
    const [volunteers, setVolunteers] = useState([]);

    useEffect(() => {
    
        if (event?.id) {
            // Filter participants and volunteers for this specific event
            const eventParticipants = participantsData.filter(p => p.eventId == event.id);
            const eventVolunteers = volunteersData.filter(v => v.eventId == event.id);
            
            // If no specific data found, show default participants/volunteers
            if (eventParticipants.length === 0) {
                setParticipants([
                    {
                        id: 1,
                        name: "John Doe",
                        caregiverName: "Jane Doe",
                        email: "john.doe@email.com",
                        phone: "+65 9123 4567",
                        status: "registered",
                        attendance: null
                    },
                    {
                        id: 2,
                        name: "Mary Smith",
                        caregiverName: "Tom Smith",
                        email: "mary.smith@email.com",
                        phone: "+65 9234 5678",
                        status: "registered",
                        attendance: null
                    },
                    {
                        id: 3,
                        name: "Robert Lee",
                        caregiverName: "Sarah Lee",
                        email: "robert.lee@email.com",
                        phone: "+65 9345 6789",
                        status: "registered",
                        attendance: null
                    }
                ]);
            } else {
                setParticipants(eventParticipants);
            }
            
            if (eventVolunteers.length === 0) {
                setVolunteers([
                    {
                        id: 1,
                        name: "Alice Wong",
                        email: "alice.wong@email.com",
                        phone: "+65 8123 4567",
                        status: "registered",
                        attendance: null
                    },
                    {
                        id: 2,
                        name: "David Tan",
                        email: "david.tan@email.com",
                        phone: "+65 8234 5678",
                        status: "registered",
                        attendance: null
                    }
                ]);
            } else {
                setVolunteers(eventVolunteers);
            }
        }
    }, [event?.id]);

    const [confirmationMessage, setConfirmationMessage] = useState("");
    const [attendanceMessage, setAttendanceMessage] = useState("");
    const [confirmationsSent, setConfirmationsSent] = useState(false);

    const handleSave = () => {
        const updatedEvent = {
            ...event,
            title: formData.title,
            start: `${event.start.split('T')[0]}T${formData.startTime}:00`,
            end: `${event.end.split('T')[0]}T${formData.endTime}:00`,
            extendedProps: {
                ...event.extendedProps,
                isWheelchairAccessible: formData.isWheelchairAccessible,
                imageUrl: formData.imageUrl,
                contactIc: formData.contactIc,
                cost: formData.cost === '' ? null : parseFloat(formData.cost)
            }
        };

        if (onUpdate) {
            onUpdate(updatedEvent);
        }

        alert("Event updated successfully!");
        navigate(-1);
    };

    const handleParticipantStatusChange = (id, newStatus) => {
        setParticipants(participants.map(p => 
            p.id === id ? { ...p, status: newStatus } : p
        ));
    };

    const handleVolunteerStatusChange = (id, newStatus) => {
        setVolunteers(volunteers.map(v => 
            v.id === id ? { ...v, status: newStatus } : v
        ));
    };

    const handleParticipantAttendanceChange = (id, attendance) => {
        setParticipants(participants.map(p => 
            p.id === id ? { ...p, attendance } : p
        ));
    };

    const handleVolunteerAttendanceChange = (id, attendance) => {
        setVolunteers(volunteers.map(v => 
            v.id === id ? { ...v, attendance } : v
        ));
    };

    const sendConfirmations = () => {
        const confirmedParticipants = participants.filter(p => 
            p.status === "confirmed" || p.status === "waitlisted"
        );
        const confirmedVolunteers = volunteers.filter(v => 
            v.status === "confirmed" || v.status === "waitlisted"
        );

        const emails = [
            ...confirmedParticipants.map(p => p.email),
            ...confirmedVolunteers.map(v => v.email)
        ];

        if (emails.length === 0) {
            setConfirmationMessage("No confirmations to send. Please set participants/volunteers to 'Confirmed' or 'Waitlisted' first.");
        } else {
            setConfirmationMessage(`✅ Confirmation and Waitlist emails sent to: ${emails.join(", ")}`);
            setConfirmationsSent(true);
        }

        setTimeout(() => setConfirmationMessage(""), 5000);
    };

    const submitAttendance = () => {
        const confirmedParticipants = participants.filter(p => p.status === "confirmed");
        const confirmedVolunteers = volunteers.filter(v => v.status === "confirmed");

        const participantsWithAttendance = confirmedParticipants.filter(p => p.attendance !== null);
        const volunteersWithAttendance = confirmedVolunteers.filter(v => v.attendance !== null);

        const totalConfirmed = confirmedParticipants.length + confirmedVolunteers.length;
        const totalRecorded = participantsWithAttendance.length + volunteersWithAttendance.length;

        setAttendanceMessage(`✅ Attendance submitted! Recorded ${totalRecorded} out of ${totalConfirmed} confirmed attendees.`);
        
        setTimeout(() => setAttendanceMessage(""), 5000);
    };

    // Get confirmed participants and volunteers for attendance tracking
    const confirmedParticipants = participants.filter(p => p.status === "confirmed");
    const confirmedVolunteers = volunteers.filter(v => v.status === "confirmed");

    return (
        <div style={{ padding: "120px 32px 32px 32px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{
                        marginBottom: "20px",
                        padding: "10px 20px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        background: "white",
                        cursor: "pointer"
                    }}
                >
                    ← Back to Calendar
                </button>

                <div style={{
                    background: "white",
                    padding: "30px",
                    borderRadius: "16px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    marginBottom: "20px"
                }}>
                    <h2>Edit Event Details</h2>
                    
                    <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                                Event Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #ddd",
                                    borderRadius: "8px"
                                }}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ddd",
                                        borderRadius: "8px"
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ddd",
                                        borderRadius: "8px"
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                                    Contact IC
                                </label>
                                <input
                                    type="text"
                                    value={formData.contactIc}
                                    onChange={(e) => setFormData({ ...formData, contactIc: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ddd",
                                        borderRadius: "8px"
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                                    Cost ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ddd",
                                        borderRadius: "8px"
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                                Activity Image
                            </label>
                            <select
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "1px solid #ddd",
                                    borderRadius: "8px"
                                }}
                            >
                                {activityImages.map((img) => (
                                    <option key={img.id} value={img.url}>
                                        {img.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isWheelchairAccessible}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        isWheelchairAccessible: e.target.checked 
                                    })}
                                />
                                <span style={{ fontWeight: "500" }}>Wheelchair Accessible</span>
                            </label>
                        </div>

                        <button
                            onClick={handleSave}
                            style={{
                                padding: "12px 24px",
                                background: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "16px"
                            }}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Participants Section */}
                <div style={{
                    background: "white",
                    padding: "30px",
                    borderRadius: "16px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    marginBottom: "20px"
                }}>
                    <h2>Participants</h2>
                    <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #ddd" }}>
                                <th style={{ padding: "12px", textAlign: "left" }}>Participant Name</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>Caregiver Name</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>Phone</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.map((participant) => (
                                <tr key={participant.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "12px" }}>{participant.name}</td>
                                    <td style={{ padding: "12px" }}>{participant.caregiverName}</td>
                                    <td style={{ padding: "12px" }}>{participant.email}</td>
                                    <td style={{ padding: "12px" }}>{participant.phone}</td>
                                    <td style={{ padding: "12px" }}>
                                        <select
                                            value={participant.status}
                                            onChange={(e) => handleParticipantStatusChange(
                                                participant.id, 
                                                e.target.value
                                            )}
                                            style={{
                                                padding: "6px 12px",
                                                border: "1px solid #ddd",
                                                borderRadius: "6px",
                                                background: participant.status === "confirmed" 
                                                    ? "#d4edda" 
                                                    : participant.status === "waitlisted" 
                                                    ? "#fff3cd" 
                                                    : "white"
                                            }}
                                        >
                                            <option value="registered">Registered</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="waitlisted">Waitlisted</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Volunteers Section */}
                <div style={{
                    background: "white",
                    padding: "30px",
                    borderRadius: "16px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    marginBottom: "20px"
                }}>
                    <h2>Volunteers</h2>
                    <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #ddd" }}>
                                <th style={{ padding: "12px", textAlign: "left" }}>Volunteer Name</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>Phone</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {volunteers.map((volunteer) => (
                                <tr key={volunteer.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "12px" }}>{volunteer.name}</td>
                                    <td style={{ padding: "12px" }}>{volunteer.email}</td>
                                    <td style={{ padding: "12px" }}>{volunteer.phone}</td>
                                    <td style={{ padding: "12px" }}>
                                        <select
                                            value={volunteer.status}
                                            onChange={(e) => handleVolunteerStatusChange(
                                                volunteer.id, 
                                                e.target.value
                                            )}
                                            style={{
                                                padding: "6px 12px",
                                                border: "1px solid #ddd",
                                                borderRadius: "6px",
                                                background: volunteer.status === "confirmed" 
                                                    ? "#d4edda" 
                                                    : volunteer.status === "waitlisted" 
                                                    ? "#fff3cd" 
                                                    : "white"
                                            }}
                                        >
                                            <option value="registered">Registered</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="waitlisted">Waitlisted</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Send Confirmation Button */}
                <div style={{
                    background: "white",
                    padding: "30px",
                    borderRadius: "16px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    <button
                        onClick={sendConfirmations}
                        style={{
                            padding: "14px 32px",
                            background: "#2196F3",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "16px"
                        }}
                    >
                        Send Confirmations
                    </button>

                    {confirmationMessage && (
                        <div style={{
                            marginTop: "20px",
                            padding: "15px",
                            background: confirmationMessage.includes("✅") ? "#d4edda" : "#fff3cd",
                            borderRadius: "8px",
                            color: "#333"
                        }}>
                            {confirmationMessage}
                        </div>
                    )}
                </div>

                {/* Attendance Tracking Section - Only shows after confirmations sent */}
                {confirmationsSent && (confirmedParticipants.length > 0 || confirmedVolunteers.length > 0) && (
                    <>
                        <div style={{
                            background: "white",
                            padding: "30px",
                            borderRadius: "16px",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                            marginBottom: "20px"
                        }}>
                            <h2>Track Attendance</h2>
                            <p style={{ color: "#666", marginBottom: "20px" }}>
                                Record attendance for confirmed participants and volunteers
                            </p>

                            {/* Participants Attendance */}
                            {confirmedParticipants.length > 0 && (
                                <>
                                    <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Participants Attendance</h3>
                                    <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "2px solid #ddd" }}>
                                                <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                                                <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                                                <th style={{ padding: "12px", textAlign: "left" }}>Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {confirmedParticipants.map((participant) => (
                                                <tr key={participant.id} style={{ borderBottom: "1px solid #eee" }}>
                                                    <td style={{ padding: "12px" }}>{participant.name}</td>
                                                    <td style={{ padding: "12px" }}>{participant.email}</td>
                                                    <td style={{ padding: "12px" }}>
                                                        <select
                                                            value={participant.attendance || ""}
                                                            onChange={(e) => handleParticipantAttendanceChange(
                                                                participant.id, 
                                                                e.target.value
                                                            )}
                                                            style={{
                                                                padding: "6px 12px",
                                                                border: "1px solid #ddd",
                                                                borderRadius: "6px",
                                                                background: participant.attendance === "present" 
                                                                    ? "#d4edda" 
                                                                    : participant.attendance === "absent" 
                                                                    ? "#f8d7da" 
                                                                    : "white"
                                                            }}
                                                        >
                                                            <option value="">Not Recorded</option>
                                                            <option value="present">Present</option>
                                                            <option value="absent">Absent</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            {/* Volunteers Attendance */}
                            {confirmedVolunteers.length > 0 && (
                                <>
                                    <h3 style={{ marginTop: "30px", marginBottom: "10px" }}>Volunteers Attendance</h3>
                                    <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "2px solid #ddd" }}>
                                                <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                                                <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                                                <th style={{ padding: "12px", textAlign: "left" }}>Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {confirmedVolunteers.map((volunteer) => (
                                                <tr key={volunteer.id} style={{ borderBottom: "1px solid #eee" }}>
                                                    <td style={{ padding: "12px" }}>{volunteer.name}</td>
                                                    <td style={{ padding: "12px" }}>{volunteer.email}</td>
                                                    <td style={{ padding: "12px" }}>
                                                        <select
                                                            value={volunteer.attendance || ""}
                                                            onChange={(e) => handleVolunteerAttendanceChange(
                                                                volunteer.id, 
                                                                e.target.value
                                                            )}
                                                            style={{
                                                                padding: "6px 12px",
                                                                border: "1px solid #ddd",
                                                                borderRadius: "6px",
                                                                background: volunteer.attendance === "present" 
                                                                    ? "#d4edda" 
                                                                    : volunteer.attendance === "absent" 
                                                                    ? "#f8d7da" 
                                                                    : "white"
                                                            }}
                                                        >
                                                            <option value="">Not Recorded</option>
                                                            <option value="present">Present</option>
                                                            <option value="absent">Absent</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}

                            <button
                                onClick={submitAttendance}
                                style={{
                                    marginTop: "20px",
                                    padding: "14px 32px",
                                    background: "#FF9800",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "16px",
                                    width: "100%"
                                }}
                            >
                                Submit Attendance
                            </button>

                            {attendanceMessage && (
                                <div style={{
                                    marginTop: "20px",
                                    padding: "15px",
                                    background: "#d4edda",
                                    borderRadius: "8px",
                                    color: "#333"
                                }}>
                                    {attendanceMessage}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
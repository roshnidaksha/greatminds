import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UpdateEventForm from "../components/UpdateEventForm";
import { useEventRegistrations } from "../hooks/useEventRegistrations";
import { useConfirmation } from "../hooks/useConfirmation";
import RosterTable from "../components/RosterTable";
import AttendanceTracker from "../components/AttendanceTracker";
import "./EventDetailsPage.css";

export default function EventDetailsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { event, onUpdate } = location.state || {};

    const [formData, setFormData] = useState({
        title: event?.title || "",
        date: event?.start ? new Date(event.start).toISOString().slice(0, 10) : "",
        startTime: event?.start ? new Date(event.start).toTimeString().slice(0, 5) : "09:00",
        endTime: event?.end ? new Date(event.end).toTimeString().slice(0, 5) : "10:00",
        isWheelchairAccessible: event?.extendedProps?.isWheelchairAccessible || false,
        imageUrl: event?.extendedProps?.imageUrl || "",
        contactICName: event?.extendedProps?.contactICName || "",
        contactICPhone: event?.extendedProps?.contactICPhone || "",
        cost: event?.extendedProps?.cost || "",
        location: event?.extendedProps?.location || "",
        meetingPoint: event?.extendedProps?.meetingPoint || "",
        description: event?.extendedProps?.description || "",
        nVolunteersRequired: event?.extendedProps?.volunteerInfo?.nVolunteersRequired || 0,
        tasksDescription: event?.extendedProps?.volunteerInfo?.tasksDescription || ""
    });

    const { participants, setParticipants, volunteers, setVolunteers } = useEventRegistrations(event?.id);
    const { confirmationMessage, confirmationsSent, sendConfirmations } = useConfirmation(participants, volunteers);
    const [attendanceMessage, setAttendanceMessage] = useState("");

    const handleSave = () => {
        const updatedEvent = {
            ...event,
            title: formData.title,
            start: `${formData.date}T${formData.startTime}:00`,
            end: `${formData.date}T${formData.endTime}:00`,
            extendedProps: {
                ...event.extendedProps,
                isWheelchairAccessible: formData.isWheelchairAccessible,
                imageUrl: formData.imageUrl,
                contactICName: formData.contactICName,
                contactICPhone: formData.contactICPhone,
                cost: formData.cost === '' ? null : parseFloat(formData.cost),
                location: formData.location,
                meetingPoint: formData.meetingPoint,
                description: formData.description,
                volunteerInfo: {
                    ...event.extendedProps.volunteerInfo,
                    tasksDescription: formData.tasksDescription,
                    nVolunteersRequired: formData.nVolunteersRequired
                }
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

    const confirmedParticipants = participants.filter(p => p.status === "confirmed");
    const confirmedVolunteers = volunteers.filter(v => v.status === "confirmed");

    return (
        <div className="event-details-page">
            <div className="event-details-container">
                <button
                    onClick={() => navigate(-1)}
                    className="back-button"
                >
                    ← Back to Calendar
                </button>

                <UpdateEventForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSave={handleSave}
                />

                {/* Participants Section */}
                <RosterTable
                    title="Participants"
                    people={participants}
                    onStatusChange={handleParticipantStatusChange}
                    isParticipant={true}
                />

                {/* Volunteers Section */}
                <RosterTable
                    title="Volunteers"
                    people={volunteers}
                    onStatusChange={handleVolunteerStatusChange}
                    isParticipant={false}
                />

                {/* Send Confirmation Button */}
                <div className="details-card confirmation-section">
                    <button
                        onClick={sendConfirmations}
                        className="send-confirmations-button"
                    >
                        Send Confirmations
                    </button>

                    {confirmationMessage && (
                        <div className={`confirmation-message ${confirmationMessage.includes("✅") ? "success" : "warning"
                            }`}>
                            {confirmationMessage}
                        </div>
                    )}
                </div>

                {/* Attendance Tracking Section - Only shows after confirmations sent */}
                {confirmationsSent && (confirmedParticipants.length > 0 || confirmedVolunteers.length > 0) && (
                    <>
                        <AttendanceTracker
                            confirmedParticipants={confirmedParticipants}
                            confirmedVolunteers={confirmedVolunteers}
                            handleParticipantAttendanceChange={handleParticipantAttendanceChange}
                            handleVolunteerAttendanceChange={handleVolunteerAttendanceChange}
                            submitAttendance={submitAttendance}
                            attendanceMessage={attendanceMessage}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
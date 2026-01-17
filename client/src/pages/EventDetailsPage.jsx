import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { db } from '../firebase/firebaseConfig';
import { doc, updateDoc, writeBatch, collection, query, where, getDocs, Timestamp, deleteDoc } from "firebase/firestore";

import UpdateEventForm from "../components/UpdateEventForm";
import { useEventRegistrations } from "../hooks/useEventRegistrations";
import { useConfirmation } from "../hooks/useConfirmation";
import { RosterTable } from "../components/RosterTable.jsx";
import AttendanceTracker from "../components/AttendanceTracker";
import { showAlert } from '../utils/utils.js';
import "./EventDetailsPage.css";

export default function EventDetailsPage() {
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { event, onUpdate } = location.state || {};
    const isSeriesEvent = event?.isSeries ?? event?.extendedProps?.isSeries;

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
        minDaysRequired: event?.extendedProps?.minDaysRequired ?? 1,
        nVolunteersRequired: event?.extendedProps?.volunteerInfo?.nVolunteersRequired || 0,
        tasksDescription: event?.extendedProps?.volunteerInfo?.tasksDescription || ""
    });

    const { participants, setParticipants, volunteers, setVolunteers } = useEventRegistrations(event?.id);
    const { confirmationMessage, confirmationsSent, sendConfirmations } = useConfirmation(participants, volunteers);
    const [attendanceMessage, setAttendanceMessage] = useState("");

    const handleSave = async () => {
        const isSeriesEvent = event?.isSeries ?? event?.extendedProps?.isSeries;
        const seriesId = event?.seriesId ?? event?.extendedProps?.seriesId;
        const costValue = formData.cost === '' ? null : parseFloat(formData.cost);
        const updatedFields = {
            title: formData.title,
            start: Timestamp.fromDate(new Date(`${formData.date}T${formData.startTime}:00`)),
            end: Timestamp.fromDate(new Date(`${formData.date}T${formData.endTime}:00`)),
            'extendedProps.isWheelchairAccessible': formData.isWheelchairAccessible,
            'extendedProps.imageUrl': formData.imageUrl,
            'extendedProps.contactICName': formData.contactICName,
            'extendedProps.contactICPhone': formData.contactICPhone,
            'extendedProps.cost': Number.isFinite(costValue) ? costValue : null,
            'extendedProps.location': formData.location,
            'extendedProps.meetingPoint': formData.meetingPoint,
            'extendedProps.description': formData.description,
            'extendedProps.minDaysRequired': Number(formData.minDaysRequired) || 1,
            'extendedProps.volunteerInfo.tasksDescription': formData.tasksDescription,
            'extendedProps.volunteerInfo.nVolunteersRequired': formData.nVolunteersRequired,
        };

        try {
            if (isSeriesEvent && seriesId) {
                const batch = writeBatch(db);
                const q = query(
                    collection(db, "events"),
                    where("seriesId", "==", seriesId)
                );
                const querySnapshot = await getDocs(q);

                const seriesWideFields = {
                    title: formData.title,
                    'extendedProps.imageUrl': formData.imageUrl,
                    'extendedProps.contactICName': formData.contactICName,
                    'extendedProps.contactICPhone': formData.contactICPhone,
                    'extendedProps.minDaysRequired': Number(formData.minDaysRequired) || 1,
                };

                querySnapshot.forEach((document) => {
                    const docRef = doc(db, "events", document.id);
                    if (document.id === event.id) {
                        batch.update(docRef, updatedFields);
                    } else {
                        batch.update(docRef, seriesWideFields);
                    }
                });

                await batch.commit();
            } else {
                const docRef = doc(db, "events", event.id);
                await updateDoc(docRef, updatedFields);
            }
        } catch (error) {
            showAlert(setAlert, "Failed to update event. Please try again.", 'error');
        }

        navigate(-1)
    };

    const handleDelete = async () => {
        const isSeriesEvent = event?.isSeries ?? event?.extendedProps?.isSeries;
        const seriesId = event?.seriesId ?? event?.extendedProps?.seriesId;
        const eventId = event?.id;

        // Confirm deletion
        const confirmMessage = isSeriesEvent
            ? `Are you sure you want to delete ALL events in this series "${event.title}"?`
            : `Are you sure you want to delete "${event.title}"?`;

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            let alertMsg = "";
            let alertType = "info";
            if (isSeriesEvent && seriesId) {
                // Delete all events in the series
                const batch = writeBatch(db);
                const q = query(
                    collection(db, "events"),
                    where("seriesId", "==", seriesId)
                );
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    alertMsg = "No events found in the series.";
                    showAlert(setAlert, alertMsg, "info");
                    return;
                }

                querySnapshot.forEach((document) => {
                    const docRef = doc(db, "events", document.id);
                    batch.delete(docRef);
                });

                await batch.commit();
                alertMsg = `Successfully deleted ${querySnapshot.size} events in the series.`;
                alertType = "success";
            } else {
                // Delete single event
                if (!eventId) {
                    alertMsg = "Error: Event ID is missing.";
                    alertType = "error";
                    showAlert(setAlert, alertMsg, alertType);
                    return;
                }

                const docRef = doc(db, "events", eventId);
                await deleteDoc(docRef);
                alertMsg = "Event deleted successfully.";
                alertType = "success";
            }
            const alertDurationMs = 1000;
            showAlert(setAlert, alertMsg, alertType, alertDurationMs);
            setTimeout(() => navigate(-1), alertDurationMs);
        } catch (error) {
            showAlert(setAlert, `Failed to delete event: ${error.message}`, 'error');
        }
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
            {alert && (
                <div className={`toast toast-${alert.type}`}>
                    {alert.message}
                </div>
            )}
            <div className="event-details-container">
                <button
                    onClick={() => navigate(-1)}
                    className="back-button"
                >
                    ← Back to Calendar
                </button>

                <div className="event-actions-header">
                    <button
                        onClick={handleDelete}
                        className="delete-event-button"
                    >
                        🗑️ Delete Event{isSeriesEvent ? ' Series' : ''}
                    </button>
                </div>

                <UpdateEventForm
                    formData={formData}
                    setFormData={setFormData}
                    handleSave={handleSave}
                    isSeries={Boolean(isSeriesEvent)}
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
                {(confirmedParticipants.length > 0 || confirmedVolunteers.length > 0) && (
                    <>
                        <AttendanceTracker
                            eventTitle={event.title}
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
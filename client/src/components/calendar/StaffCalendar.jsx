import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, Timestamp } from "firebase/firestore";

import { useEvents } from '../../hooks/useEvents';
import activityImages from '../../data/images.json';
import './StaffCalendar.css';
import CalendarEventCard from './CalendarEventCard';
import CreateEventModal from '../modals/CreateEventModal';

const DAYS = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
    { label: 'Sun', value: 0 },
];

const StaffCalendar = () => {
    const navigate = useNavigate();
    const { events, loading } = useEvents();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        startTime: '09:00',
        endTime: '10:00',
        isWheelchairAccessible: false,
        selectedImage: activityImages[0].url,
        selectedDays: [],
        commitment: 1,
        contactICName: '',
        contactICPhone: '',
        cost: '',
        location: '',
        meetingPoint: '',
        description: '',
        nVolunteersRequired: 0,
        tasksDescription: ''
    });

    const handleDateClick = (arg) => {
        const dayValue = new Date(arg.dateStr).getDay();
        setFormData({ ...formData, startDate: arg.dateStr, selectedDays: [dayValue] });
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo) => {
        const eventData = {
            id: clickInfo.event.id,
            title: clickInfo.event.title,
            start: clickInfo.event.startStr,
            end: clickInfo.event.endStr,
            isSeries: clickInfo.event.extendedProps?.isSeries,
            seriesId: clickInfo.event.extendedProps?.seriesId,
            extendedProps: clickInfo.event.extendedProps
        };

        navigate('/event-details', {
            state: { event: eventData }
        });
    };

    const toggleDay = (dayValue) => {
        const current = formData.selectedDays;
        const newDays = current.includes(dayValue)
            ? current.filter(d => d !== dayValue)
            : [...current, dayValue];
        setFormData({ ...formData, selectedDays: newDays });
    }

    const handleSave = async () => {
        const isMultiDay = formData.selectedDays.length > 1;
        const costValue = formData.cost === '' ? null : Number.parseFloat(formData.cost);
        const seriesId = isMultiDay ? `series_${Date.now()}` : null;
        const newEventsBatch = [];

        const createEventObject = (dateStr, isSeries, sId, minDays) => ({
            isSeries: isSeries,
            seriesId: sId,
            title: formData.title,
            start: Timestamp.fromDate(new Date(`${dateStr}T${formData.startTime}:00`)),
            end: Timestamp.fromDate(new Date(`${dateStr}T${formData.endTime}:00`)),
            extendedProps: {
                isWheelchairAccessible: formData.isWheelchairAccessible,
                imageUrl: formData.selectedImage,
                minDaysRequired: minDays,
                contactICName: formData.contactICName,
                contactICPhone: formData.contactICPhone,
                cost: Number.isFinite(costValue) ? costValue : null,
                location: formData.location,
                meetingPoint: formData.meetingPoint,
                description: formData.description,
                volunteerInfo: {
                    tasksDescription: formData.tasksDescription,
                    nVolunteersRequired: Number(formData.nVolunteersRequired) || 0,
                }
            },
            createdAt: Timestamp.now()
        })

        if (!isMultiDay) {
            newEventsBatch.push(
                createEventObject(formData.startDate, false, null, 1)
            );
        } else {
            formData.selectedDays.forEach(dayOffset => {
                const baseDate = new Date(formData.startDate);
                const dayOfWeek = baseDate.getDay();
                const distance = (dayOffset + 7 - dayOfWeek) % 7;
                const eventDate = new Date(baseDate);
                eventDate.setDate(baseDate.getDate() + distance);
                const dateStr = eventDate.toISOString().split('T')[0];

                newEventsBatch.push(
                    createEventObject(dateStr, true, seriesId, formData.commitment)
                )
            });
        }

        try {
            const eventsRef = collection(db, "events");
            const uploadPromises = newEventsBatch.map(event => addDoc(eventsRef, event));

            await Promise.all(uploadPromises);

            setIsModalOpen(false);
            setFormData({
                title: '',
                startDate: '',
                startTime: '09:00',
                endTime: '10:00',
                isWheelchairAccessible: false,
                selectedImage: activityImages[0].url,
                selectedDays: [],
                commitment: 1,
                contactICName: '',
                contactICPhone: '',
                cost: '',
                location: '',
                meetingPoint: '',
                description: '',
                tasksDescription: '',
                nVolunteersRequired: 0
            });
        } catch (error) {
            console.error("Error adding events to Firebase: ", error);
            alert("Failed to save event. Please check your connection.");
        }
    };

    const renderEventContent = (eventInfo) => {
        const { imageUrl, isWheelchairAccessible } = eventInfo.event.extendedProps;
        return (
            <CalendarEventCard
                title={eventInfo.event.title}
                imageUrl={imageUrl}
                isWheelchairAccessible={isWheelchairAccessible}
            />
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Event Management Dashboard</h2>

            {loading ? (
                <div className="loading-container" aria-busy="true" aria-live="polite">
                    <div className="spinner" />
                    <p style={{ marginTop: 12, color: '#555' }}>Loading events…</p>
                </div>
            ) : (
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={events}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    eventContent={renderEventContent}
                    height="80vh"
                    eventDisplay="block"
                />
            )}

            {isModalOpen && (
                <CreateEventModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    formData={formData}
                    setFormData={setFormData}
                    DAYS={DAYS}
                    activityImages={activityImages}
                    toggleDay={toggleDay}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default StaffCalendar;
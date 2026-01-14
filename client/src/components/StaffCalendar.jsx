import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import initialEvents from '../data/events.json';
import activityImages from '../data/images.json';
import './StaffCalendar.css';

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
    const [events, setEvents] = useState(initialEvents);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        startTime: '09:00',
        endTime: '10:00',
        isWheelchairAccessible: false,
        selectedImage: activityImages[0].url,
        selectedDays: [],
        commitment: 1
    });

    const handleDateClick = (arg) => {
        const dayValue = new Date(arg.dateStr).getDay();
        setFormData({ ...formData, startDate: arg.dateStr, selectedDays: [dayValue] });
        setIsModalOpen(true);
    };

    const toggleDay = (dayValue) => {
        const current = formData.selectedDays;
        const newDays = current.includes(dayValue)
            ? current.filter(d => d !== dayValue)
            : [...current, dayValue];
        setFormData({ ...formData, selectedDays: newDays });
    }

    const handleSave = () => {
        const isMultiDay = formData.selectedDays.length > 1;
        const seriesId = isMultiDay ? `series_${Date.now()}` : null;
        const newEventsBatch = [];

        if (!isMultiDay) {
            newEventsBatch.push({
                id: `event_${Math.random().toString(36)}`,
                isSeries: false,
                seriesId: null,
                title: formData.title,
                start: `${formData.startDate}T${formData.startTime}:00`,
                end: `${formData.startDate}T${formData.endTime}:00`,
                extendedProps: {
                    isWheelchairAccessible: formData.isWheelchairAccessible,
                    imageUrl: formData.selectedImage,
                    minCommitment: 1
                }
            });
        } else {
            formData.selectedDays.forEach(dayOffset => {
                const baseDate = new Date(formData.startDate);
                const dayOfWeek = baseDate.getDay();
                const distance = (dayOffset + 7 - dayOfWeek) % 7;
                const eventDate = new Date(baseDate);
                eventDate.setDate(baseDate.getDate() + distance);
                const dateStr = eventDate.toISOString().split('T')[0];

                newEventsBatch.push({
                    id: `event_${Math.random().toString(36)}`,
                    isSeries: true,
                    seriesId: seriesId,
                    title: formData.title,
                    start: `${dateStr}T${formData.startTime}:00`,
                    end: `${dateStr}T${formData.endTime}:00`,
                    extendedProps: {
                        isWheelchairAccessible: formData.isWheelchairAccessible,
                        imageUrl: formData.selectedImage,
                        minCommitment: formData.commitment
                    }
                });
            });
        }

        setEvents([...events, ...newEventsBatch]);
        setIsModalOpen(false);
        setFormData({
            title: '',
            startDate: '',
            startTime: '09:00',
            endTime: '10:00',
            isWheelchairAccessible: false,
            selectedImage: activityImages[0].url,
            selectedDays: [],
            commitment: 1
        });
    };

    const renderEventContent = (eventInfo) => {
        const { imageUrl, isWheelchairAccessible } = eventInfo.event.extendedProps;
        return (
            <div className="event-card">
                <img src={imageUrl} alt="event" style={{ width: '30px', borderRadius: '4px' }} />
                <span>{eventInfo.event.title}</span>
                {isWheelchairAccessible && <span> ♿</span>}
            </div>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Event Management Dashboard</h2>

            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                dateClick={handleDateClick}
                eventContent={renderEventContent}
                height="80vh"
            />

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>New Activity for {formData.startDate}</h3>

                        <label>Select Activity Icon</label>
                        <div className="image-grid">
                            {activityImages.map((img) => (
                                <div
                                    key={img.label}
                                    className={`image-tile ${formData.selectedImage === img.url ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, selectedImage: img.url })}
                                >
                                    <img src={img.url} alt={img.label} />
                                    <span>{img.label}</span>
                                </div>
                            ))}
                        </div>

                        <label>Program Title</label>
                        <input type="text" value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })} />

                        <label>Repeat on:</label>
                        <div className="weekday-chips">
                            {DAYS.map(day => (
                                <button
                                    key={day.value}
                                    className={formData.selectedDays.includes(day.value) ? 'active' : ''}
                                    onClick={() => toggleDay(day.value)}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>

                        {formData.selectedDays.length > 1 && (
                            <>
                                <label>Commitment Requirement:</label>
                                <div className="commitment-input">
                                    <input
                                        type="number"
                                        min="1"
                                        max={formData.selectedDays.length}
                                        value={formData.commitment}
                                        onChange={(e) => setFormData({ ...formData, commitment: parseInt(e.target.value) })}
                                    />
                                </div>
                            </>
                        )}

                        <div className="time-row">
                            <div>
                                <label>Start Time</label>
                                <input type="time" value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                            </div>
                            <div>
                                <label>End Time</label>
                                <input type="time" value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                            </div>
                        </div>

                        <label className="checkbox-label">
                            <input type="checkbox" checked={formData.isWheelchairAccessible}
                                onChange={(e) => setFormData({ ...formData, isWheelchairAccessible: e.target.checked })} />
                            Wheelchair Accessible
                        </label>

                        <div className="modal-actions">
                            <button className="save-btn" onClick={handleSave}>Save Activity</button>
                            <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffCalendar;
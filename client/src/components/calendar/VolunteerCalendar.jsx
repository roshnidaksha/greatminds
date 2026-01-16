import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";

import { useAuth } from "../../context/AuthContext";
import { useEvents } from '../../hooks/useEvents';
import { validateEventSelection } from '../../utils/conflictChecker';
import './VolunteerCalendar.css';
import { showAlert } from '../../utils/alerts';
import CalendarEventCard from './CalendarEventCard';

const VolunteerCalendar = () => {
    const { user, role } = useAuth();
    const { events, loading } = useEvents();
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [basket, setBasket] = useState([]);
    const [isBasketOpen, setIsBasketOpen] = useState(false);
    const [currentView, setCurrentView] = useState('basket');
    const [alert, setAlert] = useState(null);

    const [userRegistrations, setUserRegistrations] = useState([]);

    useEffect(() => {
        const fetchRegistrations = async () => {
            if (!user?.uid) return;
            
            try {
                const q = query(
                    collection(db, "volunteerRegistrations"),
                    where("userId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const registrations = [];
                querySnapshot.forEach((doc) => {
                    registrations.push({ id: doc.id, ...doc.data() });
                });
                setUserRegistrations(registrations);
            } catch (error) {
                console.error("Error fetching volunteer registrations:", error);
            }
        };

        fetchRegistrations();
    }, [user?.uid]);

    const getRegistrationStatus = (eventId) => {
        const registration = userRegistrations.find(reg => reg.eventId === eventId);
        return registration?.status || null;
    };

    const flattenEvent = (event) => {
        if (!event) return null;
        const ext = event.extendedProps || {};
        return {
            ...ext,
            id: event.id,
            title: event.title,
            start: event.start ? new Date(event.start) : null,
            end: event.end ? new Date(event.end) : null,
        };
    };

    const handleEventClick = (info) => {
        const clickedEvent = info.event;
        const flattened = flattenEvent(clickedEvent);

        const volunteerInfo = flattened.volunteerInfo;
        const isVolunteerFull = volunteerInfo &&
            volunteerInfo.nVolunteersRegistered >= volunteerInfo.nVolunteersRequired;

        if (isVolunteerFull) {
            showAlert(setAlert, "Volunteer quota reached. Thank you for your interest!", 'info');
            return;
        }

        setSelectedEvent(flattened);
        setIsDetailModalOpen(true);
    };

    const handleSelectEvent = async (event) => {
        if (basket.some(e => e.id === event.id)) {
            showAlert(setAlert, "This event is already in your selected volunteer slots.", 'error');
            return;
        }

        const result = await validateEventSelection(event, basket, user.uid);
        if (!result.isValid) {
            showAlert(setAlert, result.message, 'error');
            return;
        }

        setBasket([...basket, event]);
        setIsDetailModalOpen(false);
        setIsBasketOpen(true);
        setCurrentView('basket');
        showAlert(setAlert, "Added to your volunteer schedule.", 'success');
    }

    const onRemove = (eventId) => {
        const newBasket = basket.filter(item => item.id !== eventId);
        setBasket(newBasket);
        if (newBasket.length === 0) {
            setIsBasketOpen(false);
            setCurrentView('calendar');
        }
    };

    const onCheckout = () => {
        setCurrentView('summary');
    };

    const handleFinalConfirm = async () => {
        const registrations = [];

        const createRegistrationObject = (eventId, seriesId) => ({
            userId: user.uid,
            eventId: eventId,
            seriesId: seriesId || null,
            timestamp: Timestamp.now(),
            status: 'registered',
            attendance: null,
            roleAtRegistration: 'volunteer'
        })

        basket.forEach(item => {
            registrations.push(
                createRegistrationObject(item.id, item.seriesId, item.meetingPreference)
            );
        });

        try {
            const registrationsRef = collection(db, "registrations");
            const uploadPromises = registrations.map(reg => addDoc(registrationsRef, reg));
            await Promise.all(uploadPromises);
        } catch (error) {
            showAlert(setAlert, "Error during registration. Please try again.", 'error');
            return;
        }

        showAlert(setAlert, "Success! Your volunteer registration is confirmed and staff have been notified.", 'success');
        setBasket([]);
        setIsBasketOpen(false);
        setCurrentView('calendar');
    };

    const renderEventContent = (eventInfo) => {
        const { imageUrl, isWheelchairAccessible, volunteerInfo } = eventInfo.event.extendedProps;
        const isVolunteerFull = volunteerInfo &&
            volunteerInfo.nVolunteersRegistered >= volunteerInfo.nVolunteersRequired;
        const registrationStatus = getRegistrationStatus(eventInfo.event.id);

        return (
            <div className={`volunteer-event-wrapper ${isVolunteerFull ? 'volunteer-full' : ''} ${registrationStatus ? `status-${registrationStatus}` : ''}`}>
                <CalendarEventCard
                    title={eventInfo.event.title}
                    imageUrl={imageUrl}
                    isWheelchairAccessible={isWheelchairAccessible}
                />
                {isVolunteerFull && !registrationStatus && (
                    <div className="volunteer-full-badge">✓ Full</div>
                )}
                {registrationStatus && (
                    <div className="registration-badge">
                        {registrationStatus === 'registered' && '📝 Registered'}
                        {registrationStatus === 'confirmed' && '✅ Confirmed'}
                        {registrationStatus === 'waitlisted' && '⏳ Waitlisted'}
                    </div>
                )}
            </div>
        );
    };

    const BasketView = ({ basket, onRemove, onCheckout }) => {
        return (
            <div className="basket-sidebar">
                <h3>Your Volunteer Slots ({basket.length})</h3>
                {basket.map(item => (
                    <div key={item.id} className="basket-item">
                        <span>{item.title} - {new Date(item.start).toLocaleDateString()}</span>
                        <button onClick={() => onRemove(item.id)}>❌</button>
                    </div>
                ))}

                <button
                    className="checkout-btn"
                    disabled={basket.length === 0}
                    onClick={onCheckout}
                >
                    Confirm Volunteer Slots
                </button>
            </div>
        );
    }

    const SummaryScreen = ({ basket, onBack, onConfirm }) => {
        return (
            <div className="summary-container">
                <button onClick={onBack}>← Back to Calendar</button>
                <h1>Review Your Volunteer Registration</h1>

                <div className="summary-list">
                    {basket.map(item => (
                        <div key={item.id} className="summary-card">
                            <img src={item.imageUrl} alt="" style={{ width: '50px' }} />
                            <div>
                                <h3>{item.title}</h3>
                                <p>{new Date(item.start).toLocaleDateString()} at {new Date(item.start).toLocaleTimeString()}</p>
                                {item.volunteerInfo && (
                                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                                        📍 {item.meetingPoint}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="total-section">
                    <p>Total Volunteer Slots: {basket.length}</p>
                    <button className="confirm-pay-btn" onClick={onConfirm}>
                        Confirm Registration
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="volunteer-container">
            {alert && (
                <div className={`toast toast-${alert.type}`}>
                    {alert.message}
                </div>
            )}
            <header className="volunteer-header">
                <h1>Volunteer Opportunities</h1>
                <p>Click on an activity to volunteer!</p>
            </header>

            {currentView === 'basket' && isBasketOpen && (
                <BasketView
                    basket={basket}
                    onRemove={onRemove}
                    onCheckout={onCheckout}
                />
            )}

            {currentView === 'summary' && (
                <div className="modal-overlay" onClick={() => setCurrentView('basket')}>
                    <div className="modal-content summary-modal" onClick={(e) => e.stopPropagation()}>
                        <SummaryScreen
                            basket={basket}
                            onBack={() => setCurrentView('basket')}
                            onConfirm={handleFinalConfirm}
                        />
                    </div>
                </div>
            )}

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
                    eventClick={handleEventClick}
                    eventContent={renderEventContent}
                    height="80vh"
                    selectable={false}
                />
            )}

            {isDetailModalOpen && selectedEvent && (
                <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
                    <div className="modal-content detail-view" onClick={(e) => e.stopPropagation()}>

                        <div className="modal-image-container">
                            <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="modal-hero-img" />
                            {selectedEvent.isWheelchairAccessible && (
                                <div className="accessibility-badge">♿ Wheelchair Accessible</div>
                            )}
                        </div>

                        <div className="modal-body">
                            <h1>{selectedEvent.title}</h1>
                            <p><strong>ℹ️ Description:</strong> {selectedEvent.description || 'No description available.'}</p>

                            <div className="info-section">
                                <p><strong>📅 Date:</strong> {selectedEvent?.start ? selectedEvent.start.toLocaleDateString() : 'TBA'}</p>
                                <p><strong>⏰ Time:</strong> {selectedEvent?.start && selectedEvent?.end
                                    ? `${selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${selectedEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : 'All day'}</p>
                                <p><strong>📍 Location:</strong> {selectedEvent.location || 'TBA'}</p>
                            </div>

                            {selectedEvent.volunteerInfo && (
                                <div className="volunteer-info-section">
                                    <h3 style={{ color: '#FF9800', marginTop: '20px', marginBottom: '10px' }}>🤝 Volunteer Information</h3>

                                    <div className="volunteer-details">
                                        <p><strong>📋 Tasks:</strong> {selectedEvent.volunteerInfo.tasksDescription}</p>

                                        {/*<p><strong>👥 Staff Present:</strong> {selectedEvent.volunteerInfo.staffPresent.join(', ')}</p>*/}

                                        <p><strong>📞 Contact Person:</strong> {selectedEvent.contactICName}</p>
                                        <p><strong>📱 Contact Phone:</strong> {selectedEvent.contactICPhone}</p>

                                        <p><strong>📍 Meeting Point:</strong> {selectedEvent.meetingPoint}</p>

                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="select-btn volunteer-select-btn" onClick={() => handleSelectEvent(selectedEvent)}>
                                Sign Up as Volunteer
                            </button>
                            <button className="cancel-btn" onClick={() => setIsDetailModalOpen(false)}>
                                Back to Calendar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VolunteerCalendar;
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";

import { useAuth } from "../../context/AuthContext";
import { useEvents } from '../../hooks/useEvents';
import { validateEventSelection } from '../../utils/conflictChecker';
import './ParticipantCalendar.css';
import { showAlert } from '../../utils/alerts';
import CalendarEventCard from './CalendarEventCard';

const ParticipantCalendar = () => {
    const { user, role } = useAuth();
    const { events: allEvents, loading } = useEvents();
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Add wheelchair filter toggle
    const [showOnlyWheelchairAccessible, setShowOnlyWheelchairAccessible] = useState(false);

    const [basket, setBasket] = useState([]);
    const [isBasketOpen, setIsBasketOpen] = useState(false);
    const [currentView, setCurrentView] = useState('basket'); // 'basket' or 'summary'
    const [alert, setAlert] = useState(null); // { message, type: 'success'|'error'|'info' }

    // Voice control state
    const [isListening, setIsListening] = useState(false);
    const [voiceCommand, setVoiceCommand] = useState('');

    // User registrations
    const [userRegistrations, setUserRegistrations] = useState([]);

    // Fetch user registrations from Firestore
    useEffect(() => {
        const fetchRegistrations = async () => {
            if (!user?.uid) return;
            
            try {
                const q = query(
                    collection(db, "registrations"),
                    where("userId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const registrations = [];
                querySnapshot.forEach((doc) => {
                    registrations.push({ id: doc.id, ...doc.data() });
                });
                setUserRegistrations(registrations);
            } catch (error) {
                console.error("Error fetching registrations:", error);
            }
        };

        fetchRegistrations();
    }, [user?.uid]);

    // Get registration status for an event
    const getRegistrationStatus = (eventId) => {
        const registration = userRegistrations.find(reg => reg.eventId === eventId);
        return registration?.status || null;
    };

    // Filter events based on wheelchair accessibility
    const events = showOnlyWheelchairAccessible 
        ? allEvents.filter(event => event.extendedProps?.isWheelchairAccessible === true)
        : allEvents;

    // Voice control functions
    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const startVoiceRecognition = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            showAlert(setAlert, "Voice recognition not supported in this browser. Please use Chrome or Edge.", 'error');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            speak("Listening for your command");
        };

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            setVoiceCommand(command);
            processVoiceCommand(command);
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            showAlert(setAlert, "Voice recognition error. Please try again.", 'error');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const processVoiceCommand = (command) => {

        // Toggle wheelchair accessible events
        if (command.includes("wheelchair") || command.includes("accessible")) {
            setShowOnlyWheelchairAccessible(!showOnlyWheelchairAccessible);
            speak(showOnlyWheelchairAccessible 
                ? "Showing all events" 
                : "Showing only wheelchair accessible events");
            return;
        }

        // Show basket
        if (command.includes("show basket") || command.includes("my selection")) {
            if (basket.length > 0) {
                setIsBasketOpen(true);
                speak(`You have ${basket.length} activities in your selection`);
            } else {
                speak("Your basket is empty");
            }
            return;
        }

        // Confirm and checkout
        if (command.includes("confirm") || command.includes("checkout")) {
            if (basket.length > 0) {
                onCheckout();
                speak("Please review your selection");
            } else {
                speak("Your basket is empty. Please select activities first.");
            }
            return;
        }

        // Read available events
        if (command.includes("read events") || command.includes("detail events")) {
            const eventTitles = events.slice(0, 5).map(e => e.title).join(", ");
            speak(`Available events include: ${eventTitles}`);
            return;
        }

        // Help command
        if (command.includes("help")) {
            speak("You can say: show wheelchair events, show basket, confirm registration, or detail events.");
            return;
        }

        // Default
        speak("Sorry, I didn't understand that command. Say help for available commands.");
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
        setSelectedEvent(flattenEvent(clickedEvent));
        setIsDetailModalOpen(true);
    };

    const handleSelectEvent = async (event) => {
        if (basket.some(e => e.id === event.id)) {
            showAlert(setAlert, "This event is already in your selected activities.", 'error');
            return;
        }

        const result = await validateEventSelection(event, basket, user.uid);
        if (!result.isValid) {
            showAlert(setAlert, result.message, 'error');
            return;
        }

        const eventWithPreference = {
            ...event,
            meetingPreference: null
        };
        setBasket([...basket, event]);
        setIsDetailModalOpen(false);
        setIsBasketOpen(true);
        setCurrentView('basket');
        showAlert(setAlert, "Added to your selection.", 'success');
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
        
        const createRegistrationObject = (eventId, seriesId, meetingPoint) => ({
            userId: user.uid,
            eventId: eventId,
            seriesId: seriesId || null,
            meetingPoint: meetingPoint,
            timestamp: Timestamp.now(),
            status: 'registered',
            attendance: null,
            roleAtRegistration: 'participant'
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

        showAlert(setAlert, "Success! Your registration is complete and staff have been notified.", 'success');
        setBasket([]);
        setIsBasketOpen(false);
        setCurrentView('calendar');
    };

    const renderEventContent = (eventInfo) => {
        const { imageUrl, isWheelchairAccessible } = eventInfo.event.extendedProps;
        const registrationStatus = getRegistrationStatus(eventInfo.event.id);
        
        return (
            <div className={`event-wrapper ${registrationStatus ? `status-${registrationStatus}` : ''}`}>
                <CalendarEventCard
                    title={eventInfo.event.title}
                    imageUrl={imageUrl}
                    isWheelchairAccessible={isWheelchairAccessible}
                />
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
        const [meetingPreferences, setMeetingPreferences] = useState(
            basket.reduce((acc, item) => {
                acc[item.id] = item.meetingPreference || 'meeting-point';
                return acc;
            }, {})
        );

        const updateMeetingPreference = (eventId, preference) => {
            setMeetingPreferences({
                ...meetingPreferences,
                [eventId]: preference
            });

            const updatedBasket = basket.map(item =>
                item.id === eventId ? { ...item, meetingPreference: preference } : item
            );
            setBasket(updatedBasket);
        };


        const validateCommitments = () => {
            const allHavePreference = basket.every(item =>
                meetingPreferences[item.id]
            );

            if (!allHavePreference) {
                return {
                    valid: false,
                    msg: 'Please select meeting point for all activities.'
                };
            }

            const groups = basket.reduce((acc, item) => {
                if (item.isSeries) {
                    acc[item.seriesId] = (acc[item.seriesId] || 0) + 1;
                }
                return acc;
            }, {});

            for (const item of basket) {
                if (item.isSeries) {
                    const count = groups[item.seriesId];
                    if (count !== item.minDaysRequired) {
                        return {
                            valid: false,
                            msg: `You must select exactly ${item.minDaysRequired} days for "${item.title}". You have selected ${count}.`
                        };
                    }
                }
            }
            return { valid: true, msg: '' };
        };

        const validation = validateCommitments();

        return (
            <div className="basket-sidebar">
                <h3>Your Selection ({basket.length})</h3>
                {basket.map(item => (
                    <div key={item.id} className="basket-item-container">
                        <div className="basket-item">
                            <span>{item.title} - {new Date(item.start).toLocaleDateString()}</span>
                            <button onClick={() => onRemove(item.id)}>❌</button>
                        </div>

                        {/* Meeting Point Selection */}
                        <div className="meeting-selection">
                            <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '5px' }}>
                                Meeting Point:
                            </label>
                            <select
                                value={meetingPreferences[item.id] || 'meeting-point'}
                                onChange={(e) => updateMeetingPreference(item.id, e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '5px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '11px'
                                }}
                            >
                                <option value="meeting-point">
                                    {item.meetingPoint || 'Designated Meeting Point'}
                                </option>
                                <option value="direct-location">
                                    Meet directly at {item.location || 'venue'}
                                </option>
                            </select>
                        </div>
                    </div>
                ))}

                {!validation.valid && (
                    <p className="warning-text">{validation.msg}</p>
                )}

                <button
                    className="checkout-btn"
                    disabled={!validation.valid || basket.length === 0}
                    onClick={onCheckout}
                >
                    Confirm & Pay
                </button>
            </div>
        );
    }


    const SummaryScreen = ({ basket, onBack, onConfirm }) => {
        return (
            <div className="summary-container">
                <button onClick={onBack}>← Back to Calendar</button>
                <h1>Review Your Registration</h1>

                <div className="summary-list">
                    {basket.map(item => (
                        <div key={item.id} className="summary-card">
                            <img src={item.imageUrl} alt="" style={{ width: '50px' }} />
                            <div>
                                <h3>{item.title}</h3>
                                <p>{new Date(item.start).toLocaleDateString()} at {new Date(item.start).toLocaleTimeString()}</p>
                                <p style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                                    📍 {item.meetingPreference === 'meeting-point'
                                        ? item.meetingPoint
                                        : `Direct at ${item.location}`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="total-section">
                    <p>Total Activities: {basket.length}</p>
                    <button className="confirm-pay-btn" onClick={onConfirm}>
                        Confirm and Book
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="participant-container">
            {alert && (
                <div className={`toast toast-${alert.type}`}>
                    {alert.message}
                </div>
            )}
            <header className="participant-header">
                <h1>Available Activities</h1>
                <p>Click on a picture to sign up!</p>

                <div className="wheelchair-filter">
                    <label className="toggle-label">
                        <input
                            type="checkbox"
                            checked={showOnlyWheelchairAccessible}
                            onChange={(e) => setShowOnlyWheelchairAccessible(e.target.checked)}
                            className="toggle-checkbox"
                        />
                        <span className="toggle-text">
                            Show only wheelchair accessible events ♿
                        </span>
                    </label>
                </div>

                {/* Voice Control Button */}
                <div className="voice-control-section">
                    <button 
                        className={`voice-button ${isListening ? 'listening' : ''}`}
                        onClick={startVoiceRecognition}
                        disabled={isListening}
                    >
                        {isListening ? '🎤 Listening...' : '🎤 Voice Command'}
                    </button>
                    {voiceCommand && (
                        <div className="voice-feedback">
                            You said: "{voiceCommand}"
                        </div>
                    )}
                    <button 
                        className="help-button"
                        onClick={() => speak("Say: show wheelchair events, show basket, confirm registration, or read events")}
                    >
                        ℹ️ Voice Help
                    </button>
                </div>
            </header>

            {currentView === 'basket' && isBasketOpen && (
                <BasketView
                    basket={basket}
                    setBasket={setBasket}
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

            {isDetailModalOpen && (
                <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
                    <div className="modal-content detail-view" onClick={(e) => e.stopPropagation()}>

                        {/* Large visual header for accessibility */}
                        <div className="modal-image-container">
                            <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="modal-hero-img" />
                            {selectedEvent.isWheelchairAccessible && (
                                <div className="accessibility-badge">♿ Wheelchair Accessible</div>
                            )}
                            {!selectedEvent.isWheelchairAccessible && (
                                <div className="accessibility-badge">!! Not Wheelchair Accessible</div>
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
                                <p><strong>📍Meeting Point:</strong> {selectedEvent.meetingPoint || 'TBA'}</p>
                                <p><strong>📞 Contact Person:</strong> {selectedEvent.contactICName}</p>
                                <p><strong>📱 Contact Phone:</strong> {selectedEvent.contactICPhone}</p>
                                <p><strong>💲 Cost:</strong> {selectedEvent.cost ? `$${selectedEvent.cost.toFixed(2)}` : 'Free'}</p>
                            </div>

                            {selectedEvent.isSeries && (
                                <div className="series-note">
                                    This activity is part of a weekly program.
                                    Select <strong>{selectedEvent.minDaysRequired} days</strong> to register.
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="select-btn" onClick={() => handleSelectEvent(selectedEvent)}>
                                Select Activity
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

export default ParticipantCalendar;
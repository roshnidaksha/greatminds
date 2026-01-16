import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useEvents } from '../hooks/useEvents';
import './MyRegistrations.css';

export default function MyRegistrations() {
    const { user, role } = useAuth();
    const { events: allEvents } = useEvents();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrations = async () => {
            if (!user?.uid) return;

            try {
                setLoading(true);
                
                const q = query(
                    collection(db, "registrations"),
                    where('userId', '==', user.uid)
                );

                const querySnapshot = await getDocs(q);
                const regs = [];
                querySnapshot.forEach((doc) => {
                    regs.push({ id: doc.id, ...doc.data() });
                });

                setRegistrations(regs);
            } catch (error) {
                console.error('Error fetching registrations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, [user?.uid, role]);

    // Get event details by eventId
    const getEventDetails = (eventId) => {
        return allEvents.find(event => event.id === eventId);
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        const statusConfig = {
            registered: { label: '📝 Registered', color: '#ff6f00' },
            confirmed: { label: '✅ Confirmed', color: '#2e7d32' },
            waitlisted: { label: '⏳ Waitlisted', color: '#1565c0' }
        };

        const config = statusConfig[status] || statusConfig.registered;
        
        return (
            <span 
                style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: config.color,
                    backgroundColor: `${config.color}20`,
                    border: `2px solid ${config.color}`
                }}
            >
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{ padding: '120px 32px', textAlign: 'center' }}>
                <p>Loading your registrations...</p>
            </div>
        );
    }

    return (
        <div className="my-registrations-container">
            <div className="registrations-header">
                <h1>My Registrations</h1>
                <p>View all your registered events and their status</p>
            </div>

            {registrations.length === 0 ? (
                <div className="empty-state">
                    <h2>No registrations yet</h2>
                    <p>You haven't registered for any events. Visit the calendar to sign up!</p>
                </div>
            ) : (
                <div className="registrations-grid">
                    {registrations.map((registration) => {
                        const event = getEventDetails(registration.eventId);
                        if (!event) return null;

                        return (
                            <div key={registration.id} className="registration-card">
                                <div className="registration-card-header">
                                    <img 
                                        src={event.extendedProps?.imageUrl} 
                                        alt={event.title}
                                        className="registration-card-image"
                                    />
                                    {event.extendedProps?.isWheelchairAccessible && (
                                        <div className="wheelchair-badge">♿</div>
                                    )}
                                </div>

                                <div className="registration-card-body">
                                    <h3>{event.title}</h3>
                                    
                                    <div className="registration-details">
                                        <div className="detail-row">
                                            <span className="detail-icon">📅</span>
                                            <span>{event.start ? new Date(event.start).toLocaleDateString() : 'TBA'}</span>
                                        </div>
                                        
                                        <div className="detail-row">
                                            <span className="detail-icon">⏰</span>
                                            <span>
                                                {event.start && event.end 
                                                    ? `${new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                    : 'TBA'
                                                }
                                            </span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-icon">📍</span>
                                            <span>{event.extendedProps?.location || 'TBA'}</span>
                                        </div>

                                        {registration.meetingPreference && (
                                            <div className="detail-row">
                                                <span className="detail-icon">🚶</span>
                                                <span>
                                                    {registration.meetingPreference === 'meeting-point' 
                                                        ? event.extendedProps?.meetingPoint 
                                                        : `Direct at ${event.extendedProps?.location}`
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        {event.extendedProps?.cost && (
                                            <div className="detail-row">
                                                <span className="detail-icon">💲</span>
                                                <span>${event.extendedProps.cost}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="registration-status">
                                        <strong>Status:</strong> {getStatusBadge(registration.status)}
                                    </div>

                                    <div className="registration-footer">
                                        <small>
                                            Registered on: {registration.timestamp 
                                                ? new Date(registration.timestamp.toDate()).toLocaleDateString() 
                                                : 'N/A'
                                            }
                                        </small>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

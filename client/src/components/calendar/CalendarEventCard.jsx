import React from 'react';
import './CalendarEventCard.css';

export default function CalendarEventCard({ title, imageUrl, isWheelchairAccessible }) {
    return (
        <div className="event-card" title={title} style={{ pointerEvents: 'auto' }}>
            <img className="event-thumb" src={imageUrl} alt="event" />
            <div className="event-bottom">
                <span className="event-title">{title}</span>
                {isWheelchairAccessible && (
                    <span className="badge badge-access" aria-label="Wheelchair accessible">♿</span>
                )}
            </div>
        </div>
    );
}

import React from 'react';
import './CreateEventModal.css';

export default function CreateEventModal({
    isOpen,
    onClose,
    formData,
    setFormData,
    DAYS,
    activityImages,
    toggleDay,
    onSave,
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>New Activity for {formData.startDate}</h3>
                    <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
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
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Music Therapy"
                    />

                    <div className="time-row">
                        <div>
                            <label>Contact IC Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Jane Doe"
                                value={formData.contactIC}
                                onChange={(e) => setFormData({ ...formData, contactIC: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>Contact IC Phone</label>
                            <input
                                type="text"
                                placeholder="e.g., +65 9123 4567"
                                value={formData.contactICPhone}
                                onChange={(e) => setFormData({ ...formData, contactICPhone: e.target.value })}
                            />
                        </div>
                    </div>

                    <label>Cost</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g., 10.00"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    />

                    <label>Location</label>
                    <input
                        type="text"
                        placeholder="e.g., Community Hall Room 2"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />

                    <label>Meeting Point</label>
                    <input
                        type="text"
                        placeholder="e.g., Woodlands MRT Exit B at 9am"
                        value={formData.meetingPoint}
                        onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
                    />

                    <label>Description</label>
                    <textarea
                        rows={3}
                        placeholder="Brief description of the activity"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <label>Repeat on:</label>
                    <div className="weekday-chips">
                        {DAYS.map((day) => (
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
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <label>End Time</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                    </div>

                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.isWheelchairAccessible}
                            onChange={(e) => setFormData({ ...formData, isWheelchairAccessible: e.target.checked })}
                        />
                        Wheelchair Accessible
                    </label>

                    {/* Show volunteer section only if user needs volunteers */}
                    <label>Number of Volunteers Required</label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g., 10"
                        value={formData.nVolunteersRequired}
                        onChange={(e) => setFormData({ ...formData, nVolunteersRequired: e.target.value })}
                    />

                    {formData.nVolunteersRequired > 0 && (
                        <div>
                            <label>Tasks Description</label>
                            <textarea
                                rows={3}
                                placeholder="Brief description of the volunteer tasks"
                                value={formData.tasksDescription}
                                onChange={(e) => setFormData({ ...formData, tasksDescription: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="modal-actions">
                        <button className="save-btn" onClick={onSave}>Save Activity</button>
                        <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

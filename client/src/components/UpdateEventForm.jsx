import activityImages from "../data/images.json";
import "./UpdateEventForm.css";

export default function UpdateEventForm({ formData, setFormData, handleSave, isSeries }) {
    return (
        <div className="details-card">
            <h2>Edit Event Details</h2>

            {isSeries && (
                <div className="series-warning" role="alert">
                    ⚠️ This is a series event. Changes to highlighted fields will apply to all events in the series.
                </div>
            )}

            <div className="form-grid">
                <div className={isSeries ? "series-field" : undefined}>
                    <label className="form-label">
                        Event Title
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="form-input"
                    />
                </div>

                <div className={isSeries ? "series-field" : undefined}>
                    <label className="form-label">
                        Activity Image
                    </label>
                    <select
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="form-select"
                    >
                        {activityImages.map((img) => (
                            <option key={img.id} value={img.url}>
                                {img.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="form-label">
                        Description
                    </label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="form-input"
                    />
                </div>

                <div className="form-grid-col-3">
                    <div>
                        <label className="form-label">
                            Date
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label className="form-label">
                            Start Time
                        </label>
                        <input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label className="form-label">
                            End Time
                        </label>
                        <input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            className="form-input"
                        />
                    </div>
                </div>

                {isSeries && (
                    <div className={isSeries ? "series-field" : undefined}>
                        <label className="form-label">
                            Minimum Days Required (series)
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={formData.minDaysRequired}
                            onChange={(e) => setFormData({ ...formData, minDaysRequired: e.target.value })}
                            className="form-input"
                        />
                    </div>
                )}

                <div className="form-grid-col-2">
                    <div>
                        <label className="form-label">
                            Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label className="form-label">
                            Meeting Point
                        </label>
                        <input
                            type="text"
                            value={formData.meetingPoint}
                            onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-grid-col-2">
                    <div className={isSeries ? "series-field" : undefined}>
                        <label className="form-label">
                            Contact IC Name
                        </label>
                        <input
                            type="text"
                            value={formData.contactICName}
                            onChange={(e) => setFormData({ ...formData, contactICName: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div className={isSeries ? "series-field" : undefined}>
                        <label className="form-label">
                            Contact IC Phone
                        </label>
                        <input
                            type="text"
                            value={formData.contactICPhone}
                            onChange={(e) => setFormData({ ...formData, contactICPhone: e.target.value })}
                            className="form-input"
                        />
                    </div>
                </div>

                <div>
                    <label className="form-label">
                        Cost ($)
                    </label>
                    <input
                        type="number"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="form-input"
                    />
                </div>

                {formData.nVolunteersRequired > 0 && (
                    <div className="form-grid-col-2">
                        <div>
                            <label className="form-label">
                                Tasks Description
                            </label>
                            <input
                                type="text"
                                value={formData.tasksDescription}
                                onChange={(e) => setFormData({ ...formData, tasksDescription: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="form-label">
                                Number of volunteers required
                            </label>
                            <input
                                type="number"
                                value={formData.nVolunteersRequired}
                                onChange={(e) => setFormData({ ...formData, nVolunteersRequired: e.target.value })}
                                className="form-input"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.isWheelchairAccessible}
                            onChange={(e) => setFormData({
                                ...formData,
                                isWheelchairAccessible: e.target.checked
                            })}
                        />
                        <span>Wheelchair Accessible</span>
                    </label>
                </div>

                <button
                    onClick={handleSave}
                    className="save-button"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}

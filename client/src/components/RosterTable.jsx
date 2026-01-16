import "./RosterTable.css";

export default function RosterTable({ title, people, onStatusChange, isParticipant = false }) {
    return (
        <div className="details-card">
            <h2>{title}</h2>
            <table className="roster-table">
                <thead>
                    <tr>
                        <th>{isParticipant ? "Participant Name" : "Volunteer Name"}</th>
                        {isParticipant && <th>Caregiver Name</th>}
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        {isParticipant && <th>Wheelchair?</th>}
                        {isParticipant && <th>Meeting Point</th>}
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {people.map((person) => (
                        <tr key={person.id}>
                            <td>{person.name}</td>
                            {isParticipant && <td>{person.caregiverName}</td>}
                            <td>{person.email}</td>
                            <td>{person.phone}</td>
                            <td>
                                <select
                                    value={person.status}
                                    onChange={(e) => onStatusChange(
                                        person.id,
                                        e.target.value
                                    )}
                                    className={`status-select ${person.status === "confirmed"
                                        ? "status-confirmed"
                                        : person.status === "waitlisted"
                                            ? "status-waitlisted"
                                            : ""
                                        }`}
                                >
                                    <option value="registered">Registered</option>
                                    <option value="confirmed">Confirmed</option>
                                    {isParticipant && <option value="waitlisted">Waitlisted</option>}
                                </select>
                            </td>
                            {isParticipant && (
                                <td className="icon-cell">
                                    {person.isWheelchairAccessible ? (
                                        <span
                                            className="wc-icon"
                                            title="Wheelchair"
                                            aria-label="Wheelchair"
                                        >
                                            ♿
                                        </span>
                                    ) : (
                                        <span
                                            className="wc-icon wc-none"
                                            title="No wheelchair"
                                            aria-label="No wheelchair"
                                        >
                                            —
                                        </span>
                                    )}
                                </td>
                            )}
                            {isParticipant && (<td>{person.meetingPoint || "N/A"}</td>)}
                            <td className="icon-cell">
                                {person.notes ? (
                                    <span
                                        className="note-icon"
                                        title={person.notes}
                                        aria-label={`Notes: ${person.notes}`}
                                    >
                                        📝
                                    </span>
                                ) : (
                                    "—"
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

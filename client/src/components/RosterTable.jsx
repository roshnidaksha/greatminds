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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

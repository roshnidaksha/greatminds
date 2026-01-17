import { exportToPDF } from "./RosterTable.jsx";
import "./AttendanceTracker.css";

export default function AttendanceTracker({
    eventTitle,
    confirmedParticipants,
    confirmedVolunteers,
    handleParticipantAttendanceChange,
    handleVolunteerAttendanceChange,
    submitAttendance,
    attendanceMessage
}) {
    return (
        <div className="details-card attendance-section">
            <h2>Track Attendance</h2>
            <p>
                Record attendance for confirmed participants and volunteers
            </p>
            <button
                className="back-button"
                onClick={() => exportToPDF(eventTitle, confirmedParticipants, confirmedVolunteers)}
            >
                📄 Export Attendance PDF
            </button>

            {confirmedParticipants.length > 0 && (
                <>
                    <h3>Participants Attendance</h3>
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {confirmedParticipants.map((participant) => (
                                <tr key={participant.id}>
                                    <td>{participant.name}</td>
                                    <td>{participant.email}</td>
                                    <td>
                                        <select
                                            value={participant.attendance || ""}
                                            onChange={(e) => handleParticipantAttendanceChange(
                                                participant.id,
                                                e.target.value
                                            )}
                                            className={`attendance-select ${participant.attendance === "present"
                                                ? "attendance-present"
                                                : participant.attendance === "absent"
                                                    ? "attendance-absent"
                                                    : ""
                                                }`}
                                        >
                                            <option value="">Not Recorded</option>
                                            <option value="present">Present</option>
                                            <option value="absent">Absent</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {confirmedVolunteers.length > 0 && (
                <div className="volunteers-attendance">
                    <h3>Volunteers Attendance</h3>
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {confirmedVolunteers.map((volunteer) => (
                                <tr key={volunteer.id}>
                                    <td>{volunteer.name}</td>
                                    <td>{volunteer.email}</td>
                                    <td>
                                        <select
                                            value={volunteer.attendance || ""}
                                            onChange={(e) => handleVolunteerAttendanceChange(
                                                volunteer.id,
                                                e.target.value
                                            )}
                                            className={`attendance-select ${volunteer.attendance === "present"
                                                ? "attendance-present"
                                                : volunteer.attendance === "absent"
                                                    ? "attendance-absent"
                                                    : ""
                                                }`}
                                        >
                                            <option value="">Not Recorded</option>
                                            <option value="present">Present</option>
                                            <option value="absent">Absent</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <button
                onClick={submitAttendance}
                className="submit-attendance-button"
            >
                Submit Attendance
            </button>

            {attendanceMessage && (
                <div className="attendance-message">
                    {attendanceMessage}
                </div>
            )}
        </div>
    );
}

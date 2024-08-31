import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

const AttendanceForm = ({ students, onAttendanceChange }) => {

    return (
        <div className="container mt-4 p-3 border rounded">
            <h6 className="mb-4">
                Mark Attendance
            </h6>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Enrollment</th>
                            <th>Name</th>
                            <th>Attendance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id}>
                                <td>{student.id}</td>
                                <td>{student.enrollment}</td>
                                <td>{student.name}</td>
                                <td>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name={`attendance-${student.id}`}
                                            id={`present-${student.id}`}
                                            value="present"
                                            checked={student.present}
                                            onChange={() => onAttendanceChange(student.id, true)}
                                        />
                                        <label className="form-check-label" htmlFor={`present-${student.id}`}>
                                            Present
                                        </label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name={`attendance-${student.id}`}
                                            id={`absent-${student.id}`}
                                            value="absent"
                                            checked={!student.present}
                                            onChange={() => onAttendanceChange(student.id, false)}
                                        />
                                        <label className="form-check-label" htmlFor={`absent-${student.id}`}>
                                            Absent
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceForm;

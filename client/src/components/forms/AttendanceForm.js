import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import axios from 'axios';

const AttendanceForm = ({ students, onAttendanceChange, selectedSemester, selectedCourseCode, date }) => {
    // Filter students based on the selected semester
    const filteredStudents = students.filter(student => student.semester === selectedSemester);

    const handleSaveAttendance = async () => {
        try {
            await Promise.all(filteredStudents.map(student =>
                axios.post(`${process.env.REACT_APP_API_URL}/api/attendance`, {
                    student_id: student.id,
                    course_code: selectedCourseCode,
                    date,
                    present: student.present === true,
                })
            ));
            alert('Attendance records saved successfully.');
        } catch (error) {
            console.error('Error saving attendance:', error.response ? error.response.data : error.message);
            alert('Failed to save attendance records.');
        }
    };

    const handleCheckboxChange = (id, present) => {
        onAttendanceChange(id, present); // Trigger attendance change
    };

    return (
        <div className="container mt-4 p-3 border rounded">
            <h6 className="mb-4">Mark Attendance</h6>
            <p><strong>Course Code:</strong> {selectedCourseCode}</p>
            <p><strong>Date:</strong> {date}</p>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Enrollment</th>
                            <th>Name</th>
                            <th>Present</th>
                            <th>Absent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => (
                            <tr key={student.id}>
                                <td>{student.id}</td>
                                <td>{student.enrollment}</td>
                                <td>{student.firstName} {student.lastName}</td>
                                <td>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            id={`present-${student.id}`}
                                            name={`attendance-${student.id}`}
                                            checked={student.present === true}
                                            onChange={() => handleCheckboxChange(student.id, true)}
                                        />
                                        <label className="form-check-label" htmlFor={`present-${student.id}`}>
                                            Present
                                        </label>
                                    </div>
                                </td>
                                <td>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            id={`absent-${student.id}`}
                                            name={`attendance-${student.id}`}
                                            checked={student.present === false}
                                            onChange={() => handleCheckboxChange(student.id, false)}
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
                <button className="btn btn-primary" onClick={handleSaveAttendance}>
                    Save Attendance
                </button>
            </div>
        </div>
    );
};

export default AttendanceForm;

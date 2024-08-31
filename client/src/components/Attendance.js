import React, { useState } from 'react';
import AttendanceForm from '../components/forms/AttendanceForm';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

const Attendance = () => {
    const [showAttendanceForm, setShowAttendanceForm] = useState(false);
    const [students, setStudents] = useState([
        { id: 1, name: "Meena Chouhan", enrollment: "0801CS21401", present: false },
        { id: 2, name: "Mohan Patel", enrollment: "0801CS21402", present: false },
        { id: 3, name: "Ram Sharma", enrollment: "0801CS21403", present: false },
        { id: 4, name: "Reena Sharma", enrollment: "0801CS21404", present: false },
        { id: 5, name: "Pallavi Patel", enrollment: "0801CS21405", present: false },
    ]);

    const handleShowClick = () => {
        setShowAttendanceForm(true);
    };

    const handleAttendanceChange = (id, isPresent) => {
        const updatedStudents = students.map(student =>
            student.id === id ? { ...student, present: isPresent } : student
        );
        setStudents(updatedStudents);
    };

    return (
        <div className="container mt-4">
            <h6 className="mb-4">
                Department of Computer Engineering
            </h6>
            <hr className="mb-4" style={{ height: '1px', border: 'none', backgroundColor: '#007bff', opacity: '0.75' }} />
            <div className="row">
                <div className="col-md-12">
                    <div className="mb-3">
                        <label htmlFor="course" className="form-label">Course</label>
                        <input type="text" className="form-control" id="course" name="course" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="semester" className="form-label">Semester</label>
                        <input type="text" className="form-control" id="semester" name="semester" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="subjectCode" className="form-label">Subject Code</label>
                        <input type="text" className="form-control" id="subjectCode" name="subjectCode" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="date" className="form-label">Date</label>
                        <input type="text" className="form-control" id="date" name="date" />
                    </div>
                    <button 
                        className="btn btn-primary btn-lg"
                        onClick={handleShowClick}
                    >
                        Show
                    </button>
                </div>
            </div>
            {showAttendanceForm && (
                <AttendanceForm 
                    students={students} 
                    onAttendanceChange={handleAttendanceChange} 
                />
            )}
        </div>
    );
};

export default Attendance;

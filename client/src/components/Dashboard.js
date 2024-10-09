import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import AttendanceRecords from './forms/AttendanceRecords';
import TeacherCourseSelection from './forms/TeacherSubjectSelectionPage'; // Adjust the path according to your structure
 // Adjust the path accordingly
import Marks from './Marks'; // This is a new component to show marks
import './stylesheets/Home.css';
import Builder from './Builder';
import Attendance from './Attendance';
// Dashboard.jsx

const Dashboard = () => {
    return (
        <div className="d-flex">
            {/* Sidebar */}
            <nav className="sidebar bg-light" style={{ width: '200px', height: '100vh', padding: '20px' }}>
                <h4>Dashboard</h4>
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link className="nav-link" to="/record">Attendance Records</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/teacher">Select Course</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/marks">Marks Entry</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/attendance">Mark Attendance</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/builder">Course and Student details</Link>
                    </li>
                </ul>
            </nav>

            {/* Main Content Area */}
            <div className="content flex-grow-1" style={{ padding: '20px', overflowY: 'auto' }}>
                <Routes>
                    <Route path="/record" element={<AttendanceRecords />} />
                    <Route path="/teacher" element={<TeacherCourseSelection />} />
                    <Route path="/marks" element={<Marks />} />
                    <Route path="/builder" element={<Builder />} />
                    <Route path="/attendance" element={<Attendance />} /> {/* Fixed duplicate path */}
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './StudentAttendancePage.css'; // Assuming you have some CSS for styling

const StudentAttendancePage = () => {
    const location = useLocation();
    const { enrollment } = location.state || {};
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [studentMarks, setStudentMarks] = useState([]); // To store marks
    const [monthlyAttendance, setMonthlyAttendance] = useState({});
    const [error, setError] = useState('');

    // Fetch both attendance and marks data
    useEffect(() => {
        const fetchStudentData = async () => {
            if (enrollment) {
                try {
                    const attendanceResponse = await axios.get(`http://localhost:5000/api/attendance/${enrollment}`);
                    setAttendanceRecords(attendanceResponse.data);

                    const marksResponse = await axios.get(`http://localhost:5000/api/marks/${enrollment}`); // Assuming this endpoint returns student marks
                    setStudentMarks(marksResponse.data);
                } catch (err) {
                    setError('No data found.');
                    console.error('Error fetching records:', err);
                }
            } else {
                setError('No enrollment information available.');
            }
        };

        fetchStudentData();
    }, [enrollment]);

    // Process attendance records to group by month
    useEffect(() => {
        const groupByMonth = (records) => {
            const attendanceMap = {};

            records.forEach(record => {
                const date = new Date(record.date);
                const month = date.toLocaleString('default', { month: 'long' });
                const year = date.getFullYear();
                const key = `${month} ${year}`;

                if (!attendanceMap[key]) {
                    attendanceMap[key] = { present: 0, absent: 0 };
                }

                if (record.present) {
                    attendanceMap[key].present += 1;
                } else {
                    attendanceMap[key].absent += 1;
                }
            });

            return attendanceMap;
        };

        if (attendanceRecords.length > 0) {
            const monthlyData = groupByMonth(attendanceRecords);
            setMonthlyAttendance(monthlyData);
        }
    }, [attendanceRecords]);

    return (
        <div className="attendance-container">
            <h2>Student Attendance and Marks Records</h2>
            {enrollment && <h3 className="welcome-text">Welcome, {enrollment}!</h3>}
            {error && <p className="error-text">{error}</p>}
            
            {/* Attendance Section */}
            <h4>Attendance Records</h4>
            {Object.keys(monthlyAttendance).length === 0 ? (
                <p>No attendance records found.</p>
            ) : (
                <ul className="attendance-list">
                    {Object.entries(monthlyAttendance).map(([monthYear, { present, absent }]) => (
                        <li key={monthYear} className="attendance-item">
                            {monthYear}: <strong>Present</strong> - {present}, <strong>Absent</strong> - {absent}
                        </li>
                    ))}
                </ul>
            )}

            {/* Marks Section */}
            <h4>Marks Records</h4>
            {studentMarks.length === 0 ? (
                <p>No marks records found.</p>
            ) : (
                <ul className="marks-list">
                    {studentMarks.map((markEntry, index) => (
                        <li key={index} className="marks-item">
                            <p>Subject: {markEntry.course_code}, Exam: {markEntry.examType}</p>
                            <ul>
                                {markEntry.marks.map((mark, i) => (
                                    <li key={i}>
                                        Ques {i + 1}: {mark ? mark : 'N/A'}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default StudentAttendancePage;

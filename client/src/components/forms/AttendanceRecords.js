import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../stylesheets/Home.css';

const AttendanceRecords = () => {
    const role = localStorage.getItem('role');
    console.log(role);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(''); // State for selected course
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch courses when the component mounts
    useEffect(() => {
        const fetchCourses = async () => {
            const enrollment = localStorage.getItem('enrollment'); // Get enrollment from local storage
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher-courses/${enrollment}`);
                setCourses(response.data);
                // Extract semesters from the courses and create a unique list
                const uniqueSemesters = [...new Set(response.data.map(course => course.semester))];
                setSemesters(uniqueSemesters);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setError('Error fetching courses');
            }
        };
        fetchCourses();
    }, []);

    const handleFetchRecords = async () => {
        if (!fromDate || !toDate || !selectedSemester) {
            alert('Please select from, to dates, and a semester.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/record`, {
                params: { fromDate, toDate, semester: selectedSemester }
            });
            setAttendanceRecords(response.data);
        } catch (error) {
            setError('Error fetching attendance records');
            console.error('Error fetching attendance records:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchCourseRecords = async () => {
        if (!fromDate || !toDate || !selectedSemester) {
            alert('Please select from, to dates, and a semester.');
            return;
        }

        console.log(`Fetching records for Course: ${selectedCourse}, From: ${fromDate}, To: ${toDate}, Semester: ${selectedSemester}`);

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/record`, {
                params: { fromDate, toDate, courseCode: selectedCourse === "All Courses" ? undefined : selectedCourse, semester: selectedSemester } // Handle "All Courses" option
            });
            setAttendanceRecords(response.data);
        } catch (error) {
            setError('Error fetching attendance records for the selected course');
            console.error('Error fetching attendance records for the selected course:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate present count, total days, and percentage for each student across all courses
    const calculateAttendanceSummary = () => {
        const summary = {};

        attendanceRecords.forEach(record => {
            const studentId = record.student_id;
            const courseCode = record.course_code;

            if (!summary[studentId]) {
                summary[studentId] = {};
            }

            if (!summary[studentId][courseCode]) {
                summary[studentId][courseCode] = { present: 0, total: 0 };
            }

            summary[studentId][courseCode].total += 1;
            if (record.present) {
                summary[studentId][courseCode].present += 1;
            }
        });

        return summary;
    };

    const attendanceSummary = calculateAttendanceSummary();

    return (
        <div className="container mt-4" style={{ maxWidth: '800px', padding: '20px' }}>
            <h3 className="mb-4">View Attendance Records</h3>

            {/* Semester Dropdown */}
            <div className="mb-3">
                <label className="form-label">Select Semester</label>
                <select
                    className="form-select"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                >
                    <option value="">Select Semester</option>
                    {semesters.map((semester) => (
                        <option key={semester} value={semester}>
                            {semester}
                        </option>
                    ))}
                </select>
            </div>

            {/* Date Inputs */}
            <div className="mb-3">
                <label htmlFor="fromDate" className="form-label">From Date</label>
                <input
                    type="date"
                    className="form-control"
                    id="fromDate"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="toDate" className="form-label">To Date</label>
                <input
                    type="date"
                    className="form-control"
                    id="toDate"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
            </div>

            <button className="btn btn-primary" onClick={handleFetchRecords}>
                Fetch Attendance Records
            </button>

            {/* List for Course Selection */}
            <div className="mb-3 mt-4">
                <label className="form-label">Select Course to View Specific Attendance</label>
                <ul className="list-group">
                    <li 
                        className={`list-group-item ${selectedCourse === "All Courses" ? 'active' : ''}`}
                        onClick={() => setSelectedCourse("All Courses")}
                        style={{ cursor: 'pointer' }}
                    >
                        All Courses
                    </li>
                    {courses.map((course) => (
                        <li 
                            key={course.courseCode} 
                            className={`list-group-item ${course.courseCode === selectedCourse ? 'active' : ''}`}
                            onClick={() => setSelectedCourse(course.courseCode)}
                            style={{ cursor: 'pointer' }}
                        >
                            {course.courseCode} (Semester: {course.semester})
                        </li>
                    ))}
                </ul>
            </div>

            <button className="btn btn-secondary" onClick={handleFetchCourseRecords}>
                Fetch Attendance for Selected Course
            </button>

            {/* Loading/Error Messages */}
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            {/* Summary of Attendance */}
            {attendanceRecords.length > 0 && (
                <div className="mt-4">
                    <h5>Attendance Summary</h5>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                {/* Dynamically render the course headers with sub-columns for Present, Total, and Percentage */}
                                {Object.keys(attendanceSummary[Object.keys(attendanceSummary)[0] || {}]).map(courseCode => (
                                    <th key={courseCode} colSpan="3">{courseCode}</th>
                                ))}
                            </tr>
                            <tr>
                                <th></th>
                                {Object.keys(attendanceSummary[Object.keys(attendanceSummary)[0] || {}]).map(courseCode => (
                                    <>
                                        <th key={`${courseCode}-present`}>Present</th>
                                        <th key={`${courseCode}-total`}>Total</th>
                                        <th key={`${courseCode}-percentage`}>Percentage</th>
                                    </>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(attendanceSummary).map((studentId) => (
                                <tr key={studentId}>
                                    <td>{studentId}</td>
                                    {Object.keys(attendanceSummary[studentId]).map(courseCode => {
                                        const { present, total } = attendanceSummary[studentId][courseCode];
                                        const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
                                        return (
                                            <>
                                                <td>{present}</td>
                                                <td>{total}</td>
                                                <td>{percentage}%</td>
                                            </>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AttendanceRecords;

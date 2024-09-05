import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AttendanceForm from '../components/forms/AttendanceForm';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

const Attendance = () => {
    const [showAttendanceForm, setShowAttendanceForm] = useState(false);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [courseCodes, setCourseCodes] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedCourseCode, setSelectedCourseCode] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch students
                const studentsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/students`);
                setStudents(studentsResponse.data);

                // Fetch course info including course codes
                const courseInfoResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/course-info`);
                const courses = Array.from(new Set(courseInfoResponse.data.map(info => info.courseName)));
                const courseCodes = courseInfoResponse.data.map(info => info.courseCode);

                // Populate semester options
                const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

                setCourses(courses);
                setCourseCodes(courseCodes);
                setSemesters(semesters);
            } catch (error) {
                setError('Error fetching data');
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleShowClick = () => {
        if (selectedCourse && selectedSemester && selectedCourseCode && date) {
            setShowAttendanceForm(true);
        } else {
            alert('Please select course, semester, course code, and date.');
        }
    };

    const handleAttendanceChange = (id, isPresent) => {
        const updatedStudents = students.map(student =>
            student.id === id ? { ...student, present: isPresent } : student
        );
        setStudents(updatedStudents);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

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
                        <select 
                            id="course" 
                            name="course" 
                            className="form-select" 
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">Select Course</option>
                            {courses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="semester" className="form-label">Semester</label>
                        <select 
                            id="semester" 
                            name="semester" 
                            className="form-select" 
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                            <option value="">Select Semester</option>
                            {semesters.map(semester => (
                                <option key={semester} value={semester}>{semester}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="courseCode" className="form-label">Course Code</label>
                        <select 
                            id="courseCode" 
                            name="courseCode" 
                            className="form-select" 
                            value={selectedCourseCode}
                            onChange={(e) => setSelectedCourseCode(e.target.value)}
                        >
                            <option value="">Select Course Code</option>
                            {courseCodes.map(courseCode => (
                                <option key={courseCode} value={courseCode}>{courseCode}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="date" className="form-label">Date</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            id="date" 
                            name="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
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
                    selectedSemester={selectedSemester}
                    selectedCourseCode={selectedCourseCode}
                    date={date}
                />
            )}
        </div>
    );
};

export default Attendance;

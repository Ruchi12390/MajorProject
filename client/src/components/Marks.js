import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { connect } from 'react-redux';
import { setPersonalDetails } from '../redux/actionCreators';
import MarksForm from '../components/forms/MarksForm';

const Marks = (props) => {
    const [showMarksForm, setShowMarksForm] = useState(false);
    const [numQuestions, setNumQuestions] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourseCode, setSelectedCourseCode] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const enrollment = localStorage.getItem('enrollment');
        console.log(enrollment); // Debugging enrollment
        const fetchCourses = async () => {
            try {
                // Fetch teacher's courses based on enrollment
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teacher-courses/${enrollment}`);
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setError('Error fetching courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        // Fetch students based on selected semester, course code, and exam type
        const fetchStudents = async () => {
            if (selectedSemester && selectedCourseCode && selectedType) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/students`, {
                        params: {
                            semester: selectedSemester,
                            courseCode: selectedCourseCode,
                            examType: selectedType
                        }
                    });
                    setStudents(response.data.filter(student => student.semester === selectedSemester)); // Filter for additional safety
                } catch (error) {
                    console.error('Error fetching students:', error);
                }
            }
        };

        fetchStudents();
    }, [selectedSemester, selectedCourseCode, selectedType]);

    const handleCourseClick = (courseCode, semester) => {
        setSelectedCourseCode(courseCode);
        setSelectedSemester(semester);
        setShowMarksForm(false); // Reset form visibility when new course is selected
    };

    const handleShowClick = () => {
        if (selectedCourseCode && selectedSemester && selectedType) {
            setShowMarksForm(true);
        } else {
            alert('Please select a course, semester, and exam type.');
        }
    };

    const handleMarksChange = (id, questionIndex, marks) => {
        const updatedStudents = students.map(student =>
            student.id === id ? { ...student, marks: student.marks.map((m, i) => i === questionIndex ? marks : m) } : student
        );
        setStudents(updatedStudents);
    };

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    const handleNumQuestionsChange = (event) => {
        const value = parseInt(event.target.value) || 0;
        setNumQuestions(value);
    
        setStudents(students.map(student => {
            const currentMarks = student.marks || []; // Ensure marks array exists
            const updatedMarks = currentMarks.length >= value
                ? currentMarks.slice(0, value) // Reduce size by slicing
                : [...currentMarks, ...Array(value - currentMarks.length).fill('')]; // Expand size by filling with empty strings
    
            return {
                ...student,
                marks: updatedMarks
            };
        }));
    };
    

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mt-4" style={{ maxWidth: '800px', marginTop: '20px', padding: '20px' }}>
            <h6>Department of Computer Engineering</h6>
            <hr className="my-4" style={{ height: '10px', backgroundColor: '#007bff', opacity: '0.75' }} />
            <div className="row">
                <div className="col-md-12">
                    <div className="mb-3">
                        <label className="form-label">Courses</label>
                        <ul className="list-group">
                            {courses.map(course => (
                                <li 
                                    key={course.courseCode} 
                                    className={`list-group-item ${course.courseCode === selectedCourseCode ? 'active' : ''}`}
                                    onClick={() => handleCourseClick(course.courseCode, course.semester)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {course.courseCode} (Semester: {course.semester})
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="examType" className="form-label">Select Exam Type</label>
                        <select
                            id="examType"
                            name="examType"
                            value={selectedType}
                            onChange={handleTypeChange}
                            className="form-select"
                        >
                            <option value="" disabled>Select Exam Type</option>
                            <option value="mst1">MST1</option>
                            <option value="mst2">MST2</option>
                            <option value="mst3">MST3</option>
                            <option value="end-sem">End-Sem</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="numQuestions" className="form-label">Number of Questions</label>
                        <input
                            type="number"
                            className="form-control"
                            id="numQuestions"
                            value={numQuestions}
                            onChange={handleNumQuestionsChange}
                        />
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={handleShowClick}
                    >
                        Show
                    </button>
                </div>
            </div>
            {showMarksForm && (
                <MarksForm 
                    students={students} 
                    onMarksChange={handleMarksChange} 
                    numQuestions={numQuestions}
                    selectedCourseCode={selectedCourseCode}
                    selectedType={selectedType}
                />
            )}
        </div>
    );
};

// Define mapStateToProps function
const mapStateToProps = (state) => {
    return {
        resume: state.resume.data
    };
};

// Define mapDispatchToProps function
const mapDispatchToProps = (dispatch) => ({
    setPersonalDetails: (details) => dispatch(setPersonalDetails(details)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Marks);

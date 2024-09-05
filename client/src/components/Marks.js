import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { connect } from 'react-redux';
import { setPersonalDetails } from '../redux/actionCreators';
import MarksForm from '../components/forms/MarksForm';

const Marks = (props) => {
    const [showMarksForm, setShowMarksForm] = useState(false);
    const [numQuestions, setNumQuestions] = useState(3);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedCourseCode, setSelectedCourseCode] = useState('');
    const [selectedType, setSelectedType] = useState('');

    useEffect(() => {
        // Fetch courses from the API
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/course-info`);
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
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

    const handleShowClick = () => {
        setShowMarksForm(true);
    };

    const handleMarksChange = (id, questionIndex, marks) => {
        const updatedStudents = students.map(student =>
            student.id === id ? { ...student, marks: student.marks.map((m, i) => i === questionIndex ? marks : m) } : student
        );
        setStudents(updatedStudents);
    };

    const handleSemesterChange = (event) => {
        setSelectedSemester(event.target.value);
    };

    const handleCourseCodeChange = (event) => {
        setSelectedCourseCode(event.target.value);
    };

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    const handleNumQuestionsChange = (event) => {
        const value = parseInt(event.target.value) || 0;
        setNumQuestions(value);
        setStudents(students.map(student => ({
            ...student,
            marks: Array(value).fill(''),
        })));
    };

    return (
        <div>
            <h6>Department of Computer Engineering</h6>
            <hr className="my-4" style={{ height: '10px', backgroundColor: '#007bff', opacity: '0.75' }} />
            <div className="container">
                <div className="mb-3">
                    <label htmlFor="course" className="form-label">Course</label>
                    <select
                        id="course"
                        name="course"
                        value={selectedCourseCode}
                        onChange={handleCourseCodeChange}
                        className="form-select"
                    >
                        <option value="" disabled>Select Course Code</option>
                        {courses.map(course => (
                            <option key={course.courseCode} value={course.courseCode}>
                                {course.courseName} ({course.courseCode})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="semester" className="form-label">Semester</label>
                    <select
                        id="semester"
                        name="semester"
                        value={selectedSemester}
                        onChange={handleSemesterChange}
                        className="form-select"
                    >
                        <option value="" disabled>Select Semester</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                    </select>
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

// Marks.js

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { connect } from 'react-redux';
import { setPersonalDetails } from '../redux/actionCreators';
import MarksForm from '../components/forms/MarksForm';  // Renamed component import

const Marks = (props) => {
    const [showMarksForm, setShowMarksForm] = useState(false);
    const [numQuestions, setNumQuestions] = useState(3); // Number of questions
    const [students, setStudents] = useState([
        { id: 1, name: "Meena Chouhan", enrollment: "0801CS21401", marks: Array(numQuestions).fill('') },
        { id: 2, name: "Mohan Patel", enrollment: "0801CS21402", marks: Array(numQuestions).fill('') },
        { id: 3, name: "Ram Sharma", enrollment: "0801CS21403", marks: Array(numQuestions).fill('') },
        { id: 4, name: "Reena Sharma", enrollment: "0801CS21404", marks: Array(numQuestions).fill('') },
        { id: 5, name: "Pallavi Patel", enrollment: "0801CS21405", marks: Array(numQuestions).fill('') },
    ]);
    const [selectedType, setSelectedType] = useState('');

    const handleShowClick = () => {
        setShowMarksForm(true);
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
                    <input type="text" className="form-control" id="course" name="course" />
                </div>
                <div className="mb-3">
                    <label htmlFor="semester" className="form-label">Semester</label>
                    <input type="text" className="form-control" id="semester" name="semester" />
                </div>
                <div className="mb-3">
                    <label htmlFor="semesterSelect" className="form-label">Select Semester</label>
                    <select
                        id="semesterSelect"
                        name="semesterSelect"
                        value={selectedType}
                        onChange={handleTypeChange}
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
                />
            )}
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        resume: state.resume.data
    };
};

const mapDispatchToProps = (dispatch) => ({
    setPersonalDetails: (details) => dispatch(setPersonalDetails(details)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Marks);

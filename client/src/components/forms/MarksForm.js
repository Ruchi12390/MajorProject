import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const MarksForm = ({ students, onMarksChange, numQuestions, selectedCourseCode, selectedType }) => {
    const [error, setError] = useState('');

    const handleSaveMarks = async () => {
        const marksData = students.map(student => ({
            studentId: student.enrollment,
            marks: student.marks,
        }));
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/save-marks`, {
                marksData,
                courseId: selectedCourseCode,
                examType: selectedType,
            });
    
            console.log(response.data); // Log the response data
            alert('Marks saved successfully!');
        } catch (error) {
            console.error('Error saving marks:', error.response ? error.response.data : error.message);
            alert(`Failed to save marks: ${error.response ? error.response.data : error.message}`);
        }
    };
    

    return (
        <div className="card p-3 mt-4">
            <h6 className="card-title">Enter Marks</h6>
            <div className="container">
                {students.map((student, index) => (
                    <div className="row mb-3" key={student.id}>
                        <div className="col-1">{index + 1}</div>
                        <div className="col-2">{student.name} ({student.enrollment})</div>
                        {Array.from({ length: numQuestions }).map((_, qIndex) => (
                            <div className="col" key={qIndex}>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder={`Q${qIndex + 1}`}
                                    value={student.marks[qIndex] || ''}
                                    onChange={(e) => onMarksChange(student.id, qIndex, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <button 
                className="btn btn-success mt-3"
                onClick={handleSaveMarks}
            >
                Save Marks
            </button>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
    );
};

export default MarksForm;

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const MarksForm = ({ students, onMarksChange, numQuestions }) => {
    return (
        <div className="card p-3 mt-4">
            <h6 className="card-title">Enter Marks</h6>
            <div className="container">
                {students.map((student, index) => (
                    <div className="row mb-3" key={student.id}>
                        {/* S.No. Column */}
                        <div className="col-1">
                            {index + 1}
                        </div>
                        {/* Name and Enrollment Column */}
                        <div className="col-2">
                            {student.name} ({student.enrollment})
                        </div>
                        {/* Marks Columns */}
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
        </div>
    );
};

export default MarksForm;

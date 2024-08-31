import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

function UpdateCourseDetail() {
  const [courseCode, setCourseCode] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');

  // Handle input change
  const handleInputChange = (event) => {
    setCourseCode(event.target.value);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!courseCode) {
      setUpdateStatus('Please enter a course code');
      return;
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/update-course`, {
        courseCode,
      });
      setUpdateStatus(response.data.message || 'Course updated successfully');
    } catch (error) {
      setUpdateStatus(error.response?.data?.message || 'Error updating course');
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={6} className="offset-md-3">
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formCourseCode">
              <Form.Label>Course Code</Form.Label>
              <Form.Control
                type="text"
                name="courseCode"
                value={courseCode}
                onChange={handleInputChange}
                placeholder="Enter course code"
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3">
              Update Course
            </Button>
          </Form>
          {updateStatus && (
            <Alert variant={updateStatus.startsWith('Error') ? 'danger' : 'success'} className="mt-3">
              {updateStatus}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default UpdateCourseDetail;

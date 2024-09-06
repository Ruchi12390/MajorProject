const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
});

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'student'
    }
}, {
    timestamps: true,
});
const Attendance = sequelize.define('Attendance', {
  student_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  course_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  present: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'course_code', 'date']
    }
  ]
});

const CourseInformation = sequelize.define('CourseInformation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, // Automatically increment the ID
    primaryKey: true, // Set this field as the primary key
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courseCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure course codes are unique
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});// Ensure the correct sequelize instance is used



const StudentInformation = sequelize.define('StudentInformation', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    enrollment: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    semester: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'StudentInformations', // Explicitly define the table name
    timestamps: true,
});


sequelize.sync().then(() => {
    console.log('Database & tables created!');
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Save files in 'uploads/' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);  // Unique filename
    }
});

const upload = multer({ storage });

app.post('/api/signup', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'An error occurred' });
    }
});
// server/routes/courses.js
app.post('/api/manual-course', async (req, res) => {
  const { courseName, courseCode, semester } = req.body;
  console.log('Received course data:', { courseName, courseCode, semester });
  if (!courseName || !courseCode || !semester) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await CourseInformation.create({
      courseName,
      courseCode,
      semester, 
    });
    res.status(201).json({ message: 'Course added successfully' });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Error adding course', error: error.message });
  }
});

app.post('/api/upload-courses', upload.single('file'), async (req, res) => {
  const { file } = req;
  const { semester } = req.body;

  if (!file) {
    console.error('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];

  try {
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (data) => {
        // Assuming CSV columns: courseName, courseCode
        results.push({
          courseName: data.courseName,
          courseCode: data.courseCode,
          semester:data.semester, // Convert to integer
        });
      })
      .on('end', async () => {
        try {
          await CourseInformation.bulkCreate(results);
          fs.unlinkSync(file.path); // Remove the uploaded file after processing
          res.status(200).json({ message: 'Courses uploaded successfully' });
        } catch (error) {
          console.error('Error saving data:', error);
          res.status(500).json({ error: 'Error saving data' });
        }
      });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        return res.json({ token, role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
app.post('/api/manual-entry', async (req, res) => {
    const { firstName, lastName, enrollment, semester } = req.body;

    try {
        const newStudent = await StudentInformation.create({
            firstName,
            lastName,
            enrollment,
            semester
        });

        res.status(201).json({ message: 'Student added successfully' });
    } catch (error) {
        console.error('Error adding student:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Enrollment number already exists' });
        }
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
    const { file } = req;
    const { semester } = req.body;

    if (!file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];

    try {
        fs.createReadStream(file.path)
            .pipe(csv())
            .on('data', (data) => {
                // Assuming CSV columns: firstName, lastName, enrollment
                results.push({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    enrollment: data.enrollment,
                    semester: semester,
                });
            })
            .on('end', async () => {
                try {
                    await StudentInformation.bulkCreate(results);
                    fs.unlinkSync(file.path); // Remove the uploaded file after processing
                    res.status(200).json({ message: 'File uploaded ' });
                } catch (error) {
                    console.error('Error saving data:', error);
                    res.status(500).json({ error: 'Error saving data' });
                }
            });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Error processing file' });
    }
});
app.delete('/api/delete-student', async (req, res) => {
    const { enrollment } = req.body;
  
    if (!enrollment) {
      return res.status(400).json({ message: 'Enrollment number is required' });
    }
  
    try {
      const result = await StudentInformation.destroy({
        where: { enrollment },
      });
  
      if (result === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({ message: 'Error deleting student', error: error.message });
    }
  });
  
  app.get('/api/get-student', async (req, res) => {
    const { enrollmentNumber } = req.query;
  
    if (!enrollmentNumber) {
      return res.status(400).json({ message: 'Enrollment number is required' });
    }
  
    try {
      const student = await StudentInformation.findOne({ where: { enrollment: enrollmentNumber } });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.status(200).json(student);
    } catch (error) {
      console.error('Error fetching student details:', error);
      res.status(500).json({ message: 'Error fetching student details', error: error.message });
    }
  });
  app.put('/api/update-student', async (req, res) => {
    const { enrollmentNumber, firstName, lastName, semester } = req.body;
  
    if (!enrollmentNumber) {
      return res.status(400).json({ message: 'Enrollment number is required' });
    }
  
    try {
      const [updated] = await StudentInformation.update({
        firstName,
        lastName,
        semester
      }, {
        where: { enrollment: enrollmentNumber }
      });
  
      if (updated) {
        res.status(200).json({ message: 'Student updated successfully' });
      } else {
        res.status(404).json({ message: 'Student not found' });
      }
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ message: 'Error updating student', error: error.message });
    }
  });
  app.put('/api/update-course', async (req, res) => {
    const { courseCode, courseName, semester } = req.body;
  
    try {
      // Find the course by courseCode
      const course = await CourseInformation.findOne({ where: { courseCode } });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Update course details
      await course.update({ courseName, semester });
  
      res.json({ message: 'Course updated successfully' });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Error updating course' });
    }
  });
  app.get('/api/course/:courseCode', async (req, res) => {
    const { courseCode } = req.params;
  
    try {
      // Find the course by courseCode
      const course = await CourseInformation.findOne({ where: { courseCode } });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      res.json(course);
    } catch (error) {
      console.error('Error fetching course details:', error);
      res.status(500).json({ message: 'Error fetching course details' });
    }
  }); 
  app.get('/api/students', async (req, res) => {
    try {
      const students = await StudentInformation.findAll();
      res.json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ message: 'Error fetching students' });
    }
  });
  app.get('/api/course-info', async (req, res) => {
    try {
      // Assuming CourseInformation is your model
      const courseInfos = await CourseInformation.findAll({
        attributes: ['courseCode', 'courseName'] // Adjust attributes as needed
      });
      res.json(courseInfos);
    } catch (error) {
      console.error('Error fetching course information:', error);
      res.status(500).json({ message: 'Error fetching course information' });
    }
  });
  app.post('/api/attendance', async (req, res) => {
    try {
        const { student_id, course_code, date, present } = req.body;

        // Validate input data
        if (!student_id || !course_code || !date || present === undefined) {
            return res.status(400).send('Missing required fields.');
        }

        // Ensure date is in a valid format
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).send('Invalid date format.');
        }

        // Upsert the attendance record
        await Attendance.upsert({
            student_id,
            course_code,
            date: parsedDate,
            present,
        });

        res.status(200).send('Attendance record saved.');
    } catch (error) {
        console.error('Error saving attendance record:', error.message || error);
        res.status(500).send(`Error saving attendance record: ${error.message || error}`);
    }
});
const StudentMarks = sequelize.define('StudentMarks', {
  id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
  studentId: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
          model: 'CourseInformations', // Ensure this matches your CourseInformation table name
          key: 'courseCode',
      },
  },
  examType: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  marks: {
      type: DataTypes.JSONB,
      allowNull: false,
  },
}, {
  timestamps: true,
});
app.post('/api/save-marks', async (req, res) => {
  try {
      const { marksData, courseId, examType } = req.body;

      if (!Array.isArray(marksData) || !courseId || !examType) {
          return res.status(400).json({ error: 'Invalid data' });
      }

      // Start a transaction
      const transaction = await sequelize.transaction();

      try {
          // Iterate over marksData and save each entry
          for (const { studentId, marks } of marksData) {
              await StudentMarks.create({
                  studentId,
                  courseCode: courseId,
                  examType,
                  marks
              }, { transaction });
          }

          // Commit the transaction
          await transaction.commit();

          res.status(200).json({ message: 'Marks saved successfully' });
      } catch (error) {
          // Rollback the transaction in case of error
          await transaction.rollback();
          console.error('Error saving marks:', error);
          res.status(500).json({ error: 'Error saving marks' });
      }
  } catch (error) {
      console.error('Error in /api/save-marks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/marks', async (req, res) => {
  const { semester, courseCode, examType } = req.query;

  try {
    const students = await StudentInformation.findAll({
      include: {
        model: StudentMarks,
        where: { examType },
        required: false,
      },
      where: { semester },
    });

    res.json(students);
  } catch (error) {
    console.error('Error fetching student marks:', error);
    res.status(500).json({ error: 'Failed to fetch student marks' });
  }
});
app.get('/api/attendance/count', async (req, res) => {
  const { student_id, course_code } = req.query;

  try {
      const attendanceCount = await Attendance.findOne({
          attributes: [
              [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN present = true THEN 1 ELSE 0 END`)), 'present'],
              [Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN present = false THEN 1 ELSE 0 END`)), 'absent']
          ],
          where: {
              student_id,
              course_code
          }
      });

      res.json({
          present: attendanceCount.dataValues.present || 0,
          absent: attendanceCount.dataValues.absent || 0
      });
  } catch (error) {
      console.error('Error fetching attendance count:', error);
      res.status(500).json({ error: 'Failed to fetch attendance count' });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

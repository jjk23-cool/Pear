const express = require('express');
const cors = require('cors');
const db = require('./db'); // connects to MySQL database

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // to parse JSON from requests

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Signup STUDENT Route
app.post('/signup', (req, res) => {
  const { name, email, dob, password, role, phone, major, university } = req.body;

  const sql = `
    INSERT INTO students (name, email, password, role, phone, major, university, dob)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, email, password, role, phone, major, university, dob], (err, result) => {
    if (err) {
      console.error('Signup error:', err);
      // If duplicate email (ER_DUP_ENTRY MySQL error code is 1062)
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      return res.status(500).json({ success: false, message: 'Signup failed' });
    }

    res.status(200).json({
      success: true,
      message: 'Signup successful!',
      student: {
        name, email, dob, role, phone, major, university
      }
    });
  });
});


//Login STUDENT route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM students WHERE email = ? AND password = ?';

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error during login' });
    }

    if (results.length > 0) {
      const student = results[0];
      res.status(200).json({
        message: 'Login successful!',
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          role: student.role
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});

//profile management
// Get student profile by ID
app.get('/student/:id', (req, res) => {
  const studentId = req.params.id;

  const sql = `
    SELECT name, email, phone, major, university, dob
    FROM students
    WHERE id = ?
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('Profile fetch error:', err);
      return res.status(500).json({ message: 'Failed to fetch student profile' });
    }

    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  });
});

// Update student profile
app.put('/student/:id', (req, res) => {
  const studentId = req.params.id;
  const { name, phone, major, university, dob } = req.body;
  console.log("Received profile update data:", req.body);
  const sql = `
    UPDATE students
    SET name = ?, phone = ?, major = ?, university = ?, dob = ?
    WHERE id = ?
  `;

  db.query(sql, [name, phone, major, university, dob, studentId], (err, result) => {
    if (err) {
      console.error('Profile update error:', err);
      return res.status(500).json({ message: 'Failed to update profile' });
    }

    res.status(200).json({ message: 'Profile updated successfully!' });
  });
});

// Update student password
app.put('/student/:id/password', (req, res) => {
  const studentId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  const checkSql = 'SELECT password FROM students WHERE id = ?';
  db.query(checkSql, [studentId], (err, results) => {
    if (err) {
      console.error('Password check error:', err);
      return res.status(500).json({ message: 'Error checking current password' });
    }

    console.log("Stored password:", results[0]?.password);
    console.log("Current password entered:", currentPassword);

    if (results.length === 0 || results[0].password.trim() !== currentPassword.trim()) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const updateSql = 'UPDATE students SET password = ? WHERE id = ?';
    db.query(updateSql, [newPassword, studentId], (err, result) => {
      if (err) {
        console.error('Password update error:', err);
        return res.status(500).json({ message: 'Failed to update password' });
      }

      res.status(200).json({ message: 'Password updated successfully!' });
    });
  });
});

//fetching all internships on dashbaord
app.get('/internships', (req, res) => {
  const sql = 'SELECT * FROM internships';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Internship fetch error:', err);
      return res.status(500).json({ message: 'Failed to fetch internships' });
    }
    res.status(200).json(results);
  });
});


//application form
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use('/uploads', express.static('uploads')); // for serving CV files

app.post('/apply/:internshipId', (req, res) => {
  const internshipId = req.params.internshipId;
  const { fullname, email, phone, coverLetter } = req.body;
  const cvFile = req.files?.cv;

  if (!cvFile) {
    return res.status(400).json({ message: 'CV file is required' });
  }

  const cvFilename = `${Date.now()}_${cvFile.name}`;
  const cvPath = `uploads/${cvFilename}`;

  // Save file
  cvFile.mv(cvPath, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ message: 'Failed to upload file' });
    }

    const sql = `
      INSERT INTO applications (student_name, student_email, phone, cover_letter, cv_filename, internship_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [fullname, email, phone, coverLetter, cvFilename, internshipId], (err, result) => {
      if (err) {
        console.error('Application submission error:', err);
        return res.status(500).json({ message: 'Failed to submit application' });
      }

      res.status(200).json({ message: 'Application submitted successfully!' });
    });
  });
});

//displaying student's applied applications
app.get('/applications/student-email/:email', (req, res) => {
  const studentEmail = req.params.email;

  const sql = `
  SELECT a.id, a.student_name, a.student_email, a.phone, a.cover_letter, a.created_at AS date_applied,
       i.title AS internship_title, c.name AS company_name, a.status
FROM applications a
JOIN internships i ON a.internship_id = i.id
JOIN companies c ON i.company_id = c.id
WHERE a.student_email = ?`;

  db.query(sql, [studentEmail], (err, results) => {
    if (err) {
      console.error('Error fetching student applications by email:', err);
      return res.status(500).json({ message: 'Failed to load applications' });
    }

    res.status(200).json(results);
  });
});


//COMAPNY SIGN UP
app.post('/company/signup', (req, res) => {
  const { name, email, address, phone, password } = req.body;

  const sql = `
    INSERT INTO companies (name, email, address, phone, password)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, email, address, phone, password], (err, result) => {
    if (err) {
      console.error('Company signup error:', err);
      return res.status(500).json({ message: 'Signup failed' });
    }
    res.status(200).json({ message: 'Company signup successful!' });
  });
});

//COMPANY LOGIN
app.post('/company-login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM companies WHERE email = ? AND password = ?';

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Company login error:', err);
      return res.status(500).json({ message: 'Server error during login' });
    }

    if (results.length > 0) {
      const company = results[0];
      res.status(200).json({
        message: 'Login successful!',
        company: {
          id: company.id,
          name: company.name,
          email: company.email,
          role: company.role
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});

//COMPNAY PROFILE MAAGMENT
// Get company profile by ID
app.get('/company/:id', (req, res) => {
  const companyId = req.params.id;

  const sql = `
    SELECT name, email, address
    FROM companies
    WHERE id = ?
  `;

  db.query(sql, [companyId], (err, results) => {
    if (err) {
      console.error('Company profile fetch error:', err);
      return res.status(500).json({ message: 'Failed to fetch company profile' });
    }

    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  });
});

// Update company profile
app.put('/company/:id', (req, res) => {
  const companyId = req.params.id;
  const { name, address } = req.body;

  const sql = `
    UPDATE companies
    SET name = ?, address = ?
    WHERE id = ?
  `;

  db.query(sql, [name, address, companyId], (err, result) => {
    if (err) {
      console.error('Company profile update error:', err);
      return res.status(500).json({ message: 'Failed to update company profile' });
    }

    res.status(200).json({ message: 'Company profile updated successfully!' });
  });
});

// Change company password
app.put('/company/:id/password', (req, res) => {
  const companyId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  const sql = 'SELECT password FROM companies WHERE id = ?';

  db.query(sql, [companyId], (err, results) => {
    if (err) {
      console.error('Password check error:', err);
      return res.status(500).json({ message: 'Password change failed' });
    }

    if (results.length === 0 || results[0].password !== currentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const updateSql = 'UPDATE companies SET password = ? WHERE id = ?';
    db.query(updateSql, [newPassword, companyId], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Password update error:', updateErr);
        return res.status(500).json({ message: 'Failed to update password' });
      }

      res.status(200).json({ message: 'Password updated successfully!' });
    });
  });
});

//Create internship offer
app.post('/company/:id/internship', (req, res) => {
  const companyId = req.params.id;
  const { title, description, duration, location, category, paid, type } = req.body;

  const sql = `
  INSERT INTO internships (company_id, title, description, duration, location, category, paid, type)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;


  db.query(sql, [companyId, title, description, duration, location, category, paid, type], (err, result) => {
    if (err) {
      console.error('Internship creation error:', err);
      return res.status(500).json({ message: 'Failed to create internship offer' });
    }
    res.status(200).json({ message: 'Internship offer created successfully!' });
  });
});

//fetching internship for company dashboard
app.get('/internships/:companyId', (req, res) => {
  const companyId = req.params.companyId;

  const sql = 'SELECT * FROM internships WHERE company_id = ?';
  db.query(sql, [companyId], (err, results) => {
    if (err) {
      console.error('Error fetching internships:', err);
      return res.status(500).json({ message: 'Error fetching internships' });
    }
    res.json(results);
  });
});

//editing internships
app.put('/company/internships/:id', (req, res) => {
  const internshipId = req.params.id;
  const { title, description, duration, location, category, paid, type } = req.body;

  const sql = `
    UPDATE internships 
    SET title = ?, description = ?, duration = ?, location = ?, category = ?, paid = ?, type = ?
    WHERE id = ?
  `;

  db.query(sql, [title, description, duration, location, category, paid, type, internshipId], (err, result) => {
    if (err) {
      console.error('Edit internship error:', err);
      return res.status(500).json({ message: 'Failed to edit internship' });
    }

    res.status(200).json({ message: 'Internship updated successfully!' });
  });
});


//deleting internships
app.delete('/company/internships/:id', (req, res) => {
  const internshipId = req.params.id;

  const sql = `DELETE FROM internships WHERE id = ?`;

  db.query(sql, [internshipId], (err, result) => {
    if (err) {
      console.error('Delete internship error:', err);
      return res.status(500).json({ message: 'Failed to delete internship' });
    }

    res.status(200).json({ message: 'Internship deleted successfully!' });
  });
});

//getting all applicaitons
app.get('/company/applications/:companyId', (req, res) => {
  const companyId = req.params.companyId;

  const sql = `
    SELECT 
      a.id AS application_id,
      a.student_name,
      a.student_email,
      a.phone,
      a.cover_letter,
      a.cv_filename,
      a.created_at,
      a.status,
      i.title AS internship_title,
      i.location
    FROM applications a
    JOIN internships i ON a.internship_id = i.id
    WHERE i.company_id = ?
    ORDER BY a.created_at DESC
  `;

  db.query(sql, [companyId], (err, results) => {
    if (err) {
      console.error('Error fetching company applications:', err);
      return res.status(500).json({ message: 'Failed to fetch applications' });
    }
    res.status(200).json(results);
  });
});

//updating status
app.put('/application/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  const query = 'UPDATE applications SET status = ? WHERE id = ?';
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Status update error:', err);
      return res.status(500).json({ message: 'Failed to update status.' });
    }
    res.json({ message: 'Application status updated!' });
  });
});
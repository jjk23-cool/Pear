CREATE DATABASE pear;
use pear;

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  major VARCHAR(100),
  university VARCHAR(255),
  dob DATE,
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  address VARCHAR(255),
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE internships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(255),
  department VARCHAR(255),
  description TEXT,
  duration INT,
  location VARCHAR(255),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(255),
  student_email VARCHAR(255),
  phone VARCHAR(20),
  cover_letter TEXT,
  cv_filename VARCHAR(255),
  internship_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE applications
ADD COLUMN status VARCHAR(20) DEFAULT 'Pending';

ALTER TABLE internships
ADD COLUMN category VARCHAR(100),
ADD COLUMN paid ENUM('paid', 'unpaid'),
ADD COLUMN type ENUM('fulltime', 'parttime');
ALTER TABLE internships DROP COLUMN department;

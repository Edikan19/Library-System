const Student = require("../models/Student");

// POST /students
const createStudent = async (req, res) => {
  try {
    const { name, email, studentId } = req.body;
    const student = await Student.create({ name, email, studentId });
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `A student with that ${field} already exists`,
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createStudent, getAllStudents, getStudentById };

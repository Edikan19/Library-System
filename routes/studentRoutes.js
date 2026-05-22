const express = require("express");
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudentById,
} = require("../controllers/studentController");
const { validateStudent } = require("../middleware/validate");

router.post("/", validateStudent, createStudent);
router.get("/", getAllStudents);
router.get("/:id", getStudentById);

module.exports = router;

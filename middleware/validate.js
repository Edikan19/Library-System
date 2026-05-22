const { body, validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Author validations
const validateAuthor = [
  body("name").trim().notEmpty().withMessage("Author name is required"),
  body("bio").optional().trim(),
  handleValidationErrors,
];

// Book validations
const validateBook = [
  body("title").trim().notEmpty().withMessage("Book title is required"),
  body("isbn").optional().trim(),
  body("authors")
    .isArray({ min: 1 })
    .withMessage("At least one author ID is required"),
  handleValidationErrors,
];

// Student validations
const validateStudent = [
  body("name").trim().notEmpty().withMessage("Student name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("studentId").trim().notEmpty().withMessage("Student ID is required"),
  handleValidationErrors,
];

// Attendant validations
const validateAttendant = [
  body("name").trim().notEmpty().withMessage("Attendant name is required"),
  body("staffId").trim().notEmpty().withMessage("Staff ID is required"),
  handleValidationErrors,
];

// Borrow validations
const validateBorrow = [
  body("studentId").trim().notEmpty().withMessage("studentId is required"),
  body("attendantId").trim().notEmpty().withMessage("attendantId is required"),
  body("returnDate").isISO8601().withMessage("returnDate must be a valid date (ISO 8601 format)"),
  handleValidationErrors,
];

module.exports = {
  validateAuthor,
  validateBook,
  validateStudent,
  validateAttendant,
  validateBorrow,
};

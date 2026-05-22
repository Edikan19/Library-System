const express = require("express");
const router = express.Router();
const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
} = require("../controllers/bookController");
const { validateBook, validateBorrow } = require("../middleware/validate");

router.post("/", validateBook, createBook);
router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

// Borrow & Return
router.post("/:id/borrow", validateBorrow, borrowBook);
router.post("/:id/return", returnBook);

module.exports = router;

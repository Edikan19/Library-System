const express = require("express");
const router = express.Router();
const {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
} = require("../controllers/authorController");
const { validateAuthor } = require("../middleware/validate");

router.post("/", validateAuthor, createAuthor);
router.get("/", getAllAuthors);
router.get("/:id", getAuthorById);
router.put("/:id", validateAuthor, updateAuthor);
router.delete("/:id", deleteAuthor);

module.exports = router;

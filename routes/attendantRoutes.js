const express = require("express");
const router = express.Router();
const {
  createAttendant,
  getAllAttendants,
} = require("../controllers/attendantController");
const { validateAttendant } = require("../middleware/validate");

router.post("/", validateAttendant, createAttendant);
router.get("/", getAllAttendants);

module.exports = router;

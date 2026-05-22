const LibraryAttendant = require("../models/LibraryAttendant");

// POST /attendants
const createAttendant = async (req, res) => {
  try {
    const { name, staffId } = req.body;
    const attendant = await LibraryAttendant.create({ name, staffId });
    res.status(201).json({ success: true, data: attendant });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An attendant with that staffId already exists",
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /attendants
const getAllAttendants = async (req, res) => {
  try {
    const attendants = await LibraryAttendant.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: attendants.length, data: attendants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createAttendant, getAllAttendants };

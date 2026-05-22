const mongoose = require("mongoose");

const libraryAttendantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Attendant name is required"],
      trim: true,
    },
    staffId: {
      type: String,
      unique: true,
      required: [true, "Staff ID is required"],
      trim: true,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("LibraryAttendant", libraryAttendantSchema);

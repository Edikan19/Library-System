const Book = require("../models/Book");
const Student = require("../models/Student");
const LibraryAttendant = require("../models/LibraryAttendant");

// POST /books
const createBook = async (req, res) => {
  try {
    const { title, isbn, authors } = req.body;

    if (!authors || !Array.isArray(authors) || authors.length === 0) {
      return res.status(400).json({ success: false, message: "At least one author ID is required" });
    }

    // Check for duplicate ISBN
    if (isbn) {
      const existing = await Book.findOne({ isbn });
      if (existing) {
        return res.status(400).json({ success: false, message: "A book with this ISBN already exists" });
      }
    }

    const book = await Book.create({ title, isbn, authors });
    await book.populate("authors");

    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /books  (with pagination + search bonus)
const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;

    const query = {};

    // Search by title (bonus)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Filter by status
    if (status && ["IN", "OUT"].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Book.countDocuments(query);

    const books = await Book.find(query)
      .populate("authors")
      .populate("borrowedBy")
      .populate("issuedBy")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add overdue flag (bonus)
    const now = new Date();
    const booksWithOverdue = books.map((book) => {
      const b = book.toObject();
      if (b.status === "OUT" && b.returnDate && new Date(b.returnDate) < now) {
        b.isOverdue = true;
      } else {
        b.isOverdue = false;
      }
      return b;
    });

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: booksWithOverdue,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("authors")
      .populate("borrowedBy")
      .populate("issuedBy");

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const bookData = book.toObject();

    // Add overdue flag if OUT
    if (bookData.status === "OUT" && bookData.returnDate) {
      bookData.isOverdue = new Date(bookData.returnDate) < new Date();
    }

    res.status(200).json({ success: true, data: bookData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /books/:id
const updateBook = async (req, res) => {
  try {
    const { title, isbn, authors } = req.body;

    // Prevent duplicate ISBN on update
    if (isbn) {
      const existing = await Book.findOne({ isbn, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: "A book with this ISBN already exists" });
      }
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, isbn, authors },
      { new: true, runValidators: true }
    ).populate("authors");

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }
    res.status(200).json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /books/:id/borrow
const borrowBook = async (req, res) => {
  try {
    const { studentId, attendantId, returnDate } = req.body;

    if (!studentId || !attendantId || !returnDate) {
      return res.status(400).json({
        success: false,
        message: "studentId, attendantId, and returnDate are required",
      });
    }

    // Find the book
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // Book must be IN
    if (book.status !== "IN") {
      return res.status(400).json({
        success: false,
        message: "Book is currently borrowed and not available",
      });
    }

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Validate attendant exists
    const attendant = await LibraryAttendant.findById(attendantId);
    if (!attendant) {
      return res.status(404).json({ success: false, message: "Library attendant not found" });
    }

    // Validate return date is in the future
    const parsedReturnDate = new Date(returnDate);
    if (parsedReturnDate <= new Date()) {
      return res.status(400).json({ success: false, message: "Return date must be in the future" });
    }

    // Update book
    book.status = "OUT";
    book.borrowedBy = studentId;
    book.issuedBy = attendantId;
    book.returnDate = parsedReturnDate;
    await book.save();

    await book.populate("authors");
    await book.populate("borrowedBy");
    await book.populate("issuedBy");

    res.status(200).json({
      success: true,
      message: "Book borrowed successfully",
      data: book,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /books/:id/return
const returnBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("borrowedBy")
      .populate("issuedBy");

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // Book must be OUT
    if (book.status !== "OUT") {
      return res.status(400).json({
        success: false,
        message: "Book is not currently borrowed",
      });
    }

    const wasOverdue = book.returnDate && new Date(book.returnDate) < new Date();

    // Clear borrow info
    book.status = "IN";
    book.borrowedBy = null;
    book.issuedBy = null;
    book.returnDate = null;
    await book.save();

    await book.populate("authors");

    res.status(200).json({
      success: true,
      message: wasOverdue
        ? "Book returned successfully (was overdue)"
        : "Book returned successfully",
      data: book,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
};

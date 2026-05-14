# School Library Management API

A RESTful API for a School Library System built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.


## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/library-system.git
cd library-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/library-system
```

### 4. Run the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start at `http://localhost:5000`

---

## Project Structure

```
/library-system
  /config
    db.js               # MongoDB connection
  /controllers
    authorController.js
    bookController.js
    studentController.js
    attendantController.js
  /middleware
    validate.js         # express-validator middleware
  /models
    Author.js
    Book.js
    Student.js
    LibraryAttendant.js
  /routes
    authorRoutes.js
    bookRoutes.js
    studentRoutes.js
    attendantRoutes.js
  server.js             # Entry point
  .env.example
  README.md
```

---

## API Documentation

### Base URL
```
http://localhost:5000
```

---

### Authors

#### Create Author
```
POST /authors
Content-Type: application/json

{
  "name": "Chinua Achebe",
  "bio": "Nigerian novelist and poet"
}
```

#### Get All Authors
```
GET /authors
```

#### Get Single Author
```
GET /authors/:id
```

#### Update Author
```
PUT /authors/:id
Content-Type: application/json

{
  "name": "Chinua Achebe",
  "bio": "Updated bio"
}
```

#### Delete Author
```
DELETE /authors/:id
```

---

### Books

#### Create Book
```
POST /books
Content-Type: application/json

{
  "title": "Things Fall Apart",
  "isbn": "978-0-385-47454-2",
  "authors": ["<authorId1>", "<authorId2>"]
}
```

#### Get All Books
Supports pagination and search:
```
GET /books
GET /books?page=1&limit=10
GET /books?search=things+fall
GET /books?status=OUT
GET /books?search=python&page=2&limit=5
```

**Response includes `isOverdue: true/false` for all books.**

#### Get Single Book
```
GET /books/:id
```
> If book is **OUT**, response includes full `borrowedBy` (student), `issuedBy` (attendant), and `returnDate`.

#### Update Book
```
PUT /books/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "isbn": "978-0-385-00000-0",
  "authors": ["<authorId>"]
}
```

#### Delete Book
```
DELETE /books/:id
```

---

### Borrow a Book
```
POST /books/:id/borrow
Content-Type: application/json

{
  "studentId": "<studentId>",
  "attendantId": "<attendantId>",
  "returnDate": "2026-06-01"
}
```
**Rules:**
- Book must have status `"IN"`
- Student and attendant must exist
- Return date must be in the future

**After borrowing:**
- `status` → `"OUT"`
- `borrowedBy` → student reference
- `issuedBy` → attendant reference
- `returnDate` → set to provided date

---

### Return a Book
```
POST /books/:id/return
```
**Rules:**
- Book must have status `"OUT"`

**After return:**
- `status` → `"IN"`
- `borrowedBy` → cleared
- `issuedBy` → cleared
- `returnDate` → cleared

---

### Students

#### Create Student
```
POST /students
Content-Type: application/json

{
  "name": "Ada Okonkwo",
  "email": "ada@school.edu",
  "studentId": "STU-2024-001"
}
```

#### Get All Students
```
GET /students
```

#### Get Single Student
```
GET /students/:id
```

---

### Library Attendants

#### Create Attendant
```
POST /attendants
Content-Type: application/json

{
  "name": "Mr. Emeka",
  "staffId": "STAFF-001"
}
```

#### Get All Attendants
```
GET /attendants
```

---

## Sample Workflow (Postman)

1. **Create an Author** → `POST /authors` → copy `_id`
2. **Create a Book** → `POST /books` with author `_id`
3. **Create a Student** → `POST /students` → copy `_id`
4. **Create an Attendant** → `POST /attendants` → copy `_id`
5. **Borrow the Book** → `POST /books/:bookId/borrow` with student and attendant IDs
6. **Check the Book** → `GET /books/:bookId` — see student, attendant, and return date populated
7. **Return the Book** → `POST /books/:bookId/return`

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: express-validator
- **Config**: dotenv

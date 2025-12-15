# Personal Book Tracker

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing your personal reading journey. Track books you're reading, completed books, and your wishlist with ratings and personal notes.

## Features

- 📚 **User Authentication** - Secure signup and login with JWT
- 📖 **Book Management** - Add, edit, and delete books
- 🔍 **Google Books API Integration** - Search and auto-fill book details
- ⭐ **Rating System** - Rate your books from 1-5 stars
- 📝 **Personal Notes** - Add personal thoughts and notes for each book
- 📊 **Dashboard Statistics** - View your reading stats at a glance
- 🎨 **Clean UI** - Modern, responsive design with custom CSS

## Tech Stack

**Frontend:**
- React.js (Hooks, Context API)
- React Router DOM
- Axios
- Custom CSS (no frameworks)

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

**External APIs:**
- Google Books API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (either locally installed or MongoDB Atlas)
- MongoDB Compass (for local database management)

## Installation & Setup

### 1. Clone or Download the Project

```bash
cd "d:\Web Projects\Personal Book Tracker"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configure Environment Variables:**

The `.env` file is already configured for your local setup:
- Database: `PersonalBooks` on `localhost:27017`
- Port: `5000`

**Start MongoDB** (if using locally):
- Open MongoDB Compass
- Ensure MongoDB is running on `localhost:27017`

**Run the Backend Server:**

```bash
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

Open a **new terminal** and run:

```bash
cd frontend
npm start
```

The React app will start on `http://localhost:3000`

## Usage Guide

### 1. Register a New Account
- Navigate to `http://localhost:3000`
- Click "Sign Up"
- Enter your name, email, and password
- You'll be automatically logged in and redirected to the dashboard

### 2. Add Books

**Option 1: Search with Google Books API**
- Click "Add New Book" button
- Search for a book by title, author, or ISBN
- Click on a result to auto-fill the details

**Option 2: Manual Entry**
- Fill in the book details manually
- Set reading status (Wishlist/Reading/Completed)
- Add a rating (1-5 stars)
- Write personal notes

### 3. Manage Your Collection
- **Dashboard**: View statistics and filter books by status
- **View Book**: Click any book card to see full details
- **Edit Book**: Update status, rating, or notes
- **Delete Book**: Remove books from your collection

## Project Structure

```
Personal Book Tracker/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema
│   │   └── Book.js          # Book schema
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   └── books.js         # Book CRUD routes
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   ├── server.js            # Express server
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js     # Axios configuration
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── BookCard.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AddBook.js
│   │   │   └── BookDetails.js
│   │   ├── App.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Books (Protected Routes)
- `GET /api/books` - Get all user's books
- `POST /api/books` - Add a new book
- `PUT /api/books/:id` - Update book details
- `DELETE /api/books/:id` - Delete a book

## Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Books Collection
```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  author: String,
  description: String,
  coverImage: String (URL),
  status: String (Reading|Completed|Wishlist),
  rating: Number (0-5),
  notes: String,
  createdAt: Date
}
```

## Features in Detail

### Authentication
- Secure password hashing with bcrypt
- JWT token-based authentication
- Automatic token refresh
- Protected routes

### Book Status Management
- **📖 Reading** - Books you're currently reading
- **✅ Completed** - Books you've finished
- **⭐ Wishlist** - Books you want to read

### Dashboard Analytics
- Total book count
- Books by status
- Recent additions
- Filter functionality

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running on `localhost:27017`
- Open MongoDB Compass and verify connection
- Check the database name is `PersonalBooks`

**CORS Error:**
- Backend and frontend must run on different ports
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

**Google Books API Not Working:**
- Check your internet connection
- The API is free and doesn't require a key for basic usage

## Future Enhancements

- Reading goals and progress tracking
- Analytics charts and visualizations
- Book recommendations
- Social sharing features
- Dark mode
- Export data functionality

## License

This project is open-source and available for educational purposes.

## Author

Created as a MERN stack learning project demonstrating:
- Full-stack development with MERN
- RESTful API design
- User authentication and authorization
- Third-party API integration
- Modern React patterns (Hooks, Context API)
- Custom CSS styling without frameworks

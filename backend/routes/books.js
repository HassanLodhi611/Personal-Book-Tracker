const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// Configure multer for PDF uploads
// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('📂 Multer destination called');
        const uploadDir = path.join(__dirname, '../uploads');
        console.log('📂 Upload directory target:', uploadDir);

        try {
            if (!fs.existsSync(uploadDir)) {
                console.log('📂 Creating uploads directory...');
                fs.mkdirSync(uploadDir, { recursive: true });
                console.log('✅ Uploads directory created');
            }
            cb(null, uploadDir);
        } catch (err) {
            console.error('❌ Error creating directory:', err);
            cb(err);
        }
    },
    filename: function (req, file, cb) {
        console.log('📄 Multer filename called for:', file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// All routes are protected with auth middleware

// @route   GET /api/books
// @desc    Get all books for logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const books = await Book.find({ userId: req.userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: books.length,
            books
        });

    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching books'
        });
    }
});

// @route   POST /api/books
// @desc    Add a new book
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { title, author, description, coverImage, status, rating, notes } = req.body;

        // Validation
        if (!title || !author) {
            return res.status(400).json({
                success: false,
                message: 'Title and author are required'
            });
        }

        const book = new Book({
            userId: req.userId,
            title,
            author,
            description,
            coverImage,
            status: status || 'Wishlist',
            rating: rating || 0,
            notes
        });

        await book.save();

        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            book
        });

    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding book'
        });
    }
});

// @route   POST /api/books/upload-pdf/:id
// @desc    Upload PDF for a book
// @access  Private
// Wrapper to handle Multer errors
const uploadMiddleware = (req, res, next) => {
    console.log('🚀 Upload middleware start');
    upload.single('pdf')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('❌ Multer Error:', err);
            return res.status(400).json({ success: false, message: 'Upload error: ' + err.message });
        } else if (err) {
            console.error('❌ Unknown Upload Error:', err);
            return res.status(500).json({ success: false, message: 'Upload error: ' + err.message });
        }
        console.log('✅ Upload middleware success, file:', req.file);
        next();
    });
};

router.post('/upload-pdf/:id', auth, uploadMiddleware, async (req, res) => {
    console.log('📥 Upload route handler reached for ID:', req.params.id);
    try {
        const book = await Book.findOne({ _id: req.params.id, userId: req.userId });

        if (!book) {
            // Delete uploaded file if book not found
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Delete old PDF if exists
        if (book.pdfFile && fs.existsSync(book.pdfFile)) {
            fs.unlinkSync(book.pdfFile);
        }

        // Update book with PDF info
        // IMPORTANT: Store relative path for URL access (e.g., 'uploads/filename.pdf')
        // req.file.path contains absolute path which breaks the URL
        book.pdfFile = 'uploads/' + req.file.filename;
        book.hasPdf = true;
        book.fileSize = req.file.size;

        await book.save();

        res.json({
            success: true,
            message: 'PDF uploaded successfully',
            book
        });

    } catch (error) {
        console.error('Upload PDF error:', error);
        // Delete uploaded file on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error uploading PDF: ' + error.message
        });
    }
});

// @route   DELETE /api/books/pdf/:id
// @desc    Delete PDF from a book
// @access  Private
router.delete('/pdf/:id', auth, async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id, userId: req.userId });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Delete PDF file
        if (book.pdfFile && fs.existsSync(book.pdfFile)) {
            fs.unlinkSync(book.pdfFile);
        }

        // Update book
        book.pdfFile = '';
        book.hasPdf = false;
        book.fileSize = 0;

        await book.save();

        res.json({
            success: true,
            message: 'PDF deleted successfully',
            book
        });

    } catch (error) {
        console.error('PDF delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting PDF'
        });
    }
});

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, author, description, coverImage, status, rating, notes } = req.body;

        // Find book and check ownership
        const book = await Book.findOne({ _id: req.params.id, userId: req.userId });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Update fields
        if (title) book.title = title;
        if (author) book.author = author;
        if (description !== undefined) book.description = description;
        if (coverImage !== undefined) book.coverImage = coverImage;
        if (status) book.status = status;
        if (rating !== undefined) book.rating = rating;
        if (notes !== undefined) book.notes = notes;

        await book.save();

        res.json({
            success: true,
            message: 'Book updated successfully',
            book
        });

    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating book'
        });
    }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        // Find book and check ownership
        const book = await Book.findOne({ _id: req.params.id, userId: req.userId });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Delete PDF file if exists
        if (book.pdfFile && fs.existsSync(book.pdfFile)) {
            fs.unlinkSync(book.pdfFile);
        }

        await Book.deleteOne({ _id: req.params.id });

        res.json({
            success: true,
            message: 'Book deleted successfully'
        });

    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting book'
        });
    }
});

module.exports = router;

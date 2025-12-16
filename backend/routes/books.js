const express = require('express');
const router = express.Router();

const Book = require('../models/Book');
const auth = require('../middleware/auth');

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

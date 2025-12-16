const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Author name is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    coverImage: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Reading', 'Completed', 'Wishlist'],
        default: 'Wishlist'
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    },

}, {
    timestamps: true
});

// Create index for faster queries
bookSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Book', bookSchema);

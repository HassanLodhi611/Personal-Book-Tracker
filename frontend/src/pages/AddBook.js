import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './AddBook.css';

const AddBook = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        coverImage: '',
        status: 'Wishlist',
        rating: 0,
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const searchBooks = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        setError('');

        try {
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=10`
            );
            const data = await response.json();

            if (data.items) {
                setSearchResults(data.items);
            } else {
                setSearchResults([]);
                setError('No books found. Try a different search term.');
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Error searching books. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const selectBook = (book) => {
        const volumeInfo = book.volumeInfo;
        setFormData({
            title: volumeInfo.title || '',
            author: volumeInfo.authors?.join(', ') || '',
            description: volumeInfo.description || '',
            coverImage: volumeInfo.imageLinks?.thumbnail || '',
            status: 'Wishlist',
            rating: 0,
            notes: ''
        });
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRatingClick = (rating) => {
        setFormData({
            ...formData,
            rating
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.author) {
            setError('Title and author are required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/books', formData);

            if (response.data.success) {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding book');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (currentRating) => {
        return [...Array(5)].map((_, index) => (
            <span
                key={index}
                className={index < currentRating ? 'star' : 'star empty'}
                onClick={() => handleRatingClick(index + 1)}
            >
                ★
            </span>
        ));
    };

    return (
        <div className="add-book-page">
            <div className="container">
                <h1>Add New Book</h1>

                {/* Google Books Search */}
                <div className="search-section card">
                    <h2>Search for a Book</h2>
                    <p className="search-subtitle">Find books quickly using Google Books API</p>

                    <div className="search-bar">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by title, author, or ISBN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={searchBooks}
                            disabled={searching}
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map((book) => (
                                <div
                                    key={book.id}
                                    className="search-result-item"
                                    onClick={() => selectBook(book)}
                                >
                                    {book.volumeInfo.imageLinks?.thumbnail && (
                                        <img
                                            src={book.volumeInfo.imageLinks.thumbnail}
                                            alt={book.volumeInfo.title}
                                            className="result-cover"
                                        />
                                    )}
                                    <div className="result-info">
                                        <h4>{book.volumeInfo.title}</h4>
                                        <p>{book.volumeInfo.authors?.join(', ')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Manual Entry Form */}
                <div className="form-section card">
                    <h2>Book Details</h2>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Book title"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Author *</label>
                                <input
                                    type="text"
                                    name="author"
                                    className="form-input"
                                    value={formData.author}
                                    onChange={handleChange}
                                    required
                                    placeholder="Author name"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Book description..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Cover Image URL</label>
                            <input
                                type="url"
                                name="coverImage"
                                className="form-input"
                                value={formData.coverImage}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    name="status"
                                    className="form-select"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="Wishlist">Wishlist</option>
                                    <option value="Reading">Reading</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Rating</label>
                                <div className="star-rating">
                                    {renderStars(formData.rating)}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Personal Notes</label>
                            <textarea
                                name="notes"
                                className="form-textarea"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Your thoughts about this book..."
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/dashboard')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Adding Book...' : 'Add Book'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBook;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import './Library.css';
import './LibraryButtons.css';

const Library = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get('/books');
                if (response.data.success) {
                    setBooks(response.data.books);
                }
            } catch (error) {
                console.error('Error fetching books:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const filteredBooks = filter === 'All' ? books : books.filter((book) => book.status === filter);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="library-page">
            <div className="container">
                <div className="library-header">
                    <div>
                        <h1>📚 ReadVault Library</h1>
                        <p className="library-subtitle">
                            Access your collection of {books.length} books
                        </p>
                    </div>
                    <Link to="/dashboard" className="btn btn-secondary">
                        Back to Dashboard
                    </Link>
                </div>

                {/* Stats */}
                <div className="library-stats">
                    <div className="stat-item">
                        <div className="stat-number">{books.length}</div>
                        <div className="stat-text">Total Books</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{books.filter((b) => b.status === 'Reading').length}</div>
                        <div className="stat-text">Currently Reading</div>
                    </div>
                </div>

                {/* Filters */}
                {books.length > 0 && (
                    <div className="library-filters">
                        <button
                            className={`filter-chip ${filter === 'All' ? 'active' : ''}`}
                            onClick={() => setFilter('All')}
                        >
                            All Books
                        </button>
                        <button
                            className={`filter-chip ${filter === 'Reading' ? 'active' : ''}`}
                            onClick={() => setFilter('Reading')}
                        >
                            📖 Reading
                        </button>
                        <button
                            className={`filter-chip ${filter === 'Completed' ? 'active' : ''}`}
                            onClick={() => setFilter('Completed')}
                        >
                            ✅ Completed
                        </button>
                        <button
                            className={`filter-chip ${filter === 'Wishlist' ? 'active' : ''}`}
                            onClick={() => setFilter('Wishlist')}
                        >
                            ⭐ Wishlist
                        </button>
                    </div>
                )}

                {/* Library Grid */}
                {filteredBooks.length === 0 ? (
                    <div className="empty-library">
                        <div className="empty-icon">📚</div>
                        <h2>No Digital Books Yet</h2>
                        <p>Upload PDFs to your books from the Book Details page to build your digital library</p>
                        <Link to="/dashboard" className="btn btn-primary mt-3">
                            Go to Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="library-grid">
                        {filteredBooks.map((book) => (
                            <div key={book._id} className="library-book-card">
                                <div className="library-book-cover">
                                    {book.coverImage ? (
                                        <img src={book.coverImage} alt={book.title} />
                                    ) : (
                                        <div className="library-cover-placeholder">
                                            <span>📖</span>
                                        </div>
                                    )}
                                    <div className="library-overlay">

                                    </div>
                                </div>
                                <div className="library-book-info">
                                    <h3 className="library-book-title">{book.title}</h3>
                                    <p className="library-book-author">{book.author}</p>
                                    <div className="library-book-meta">
                                        <span className={`status-badge badge-${book.status.toLowerCase()}`}>
                                            {book.status}
                                        </span>

                                    </div>
                                    <Link to={`/book/${book._id}`} className="view-details-link">
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Library;

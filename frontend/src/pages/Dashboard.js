import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import BookCard from '../components/BookCard';
import './Dashboard.css';

const Dashboard = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [stats, setStats] = useState({
        total: 0,
        reading: 0,
        completed: 0,
        wishlist: 0
    });

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        calculateStats();
    }, [books]);

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

    const calculateStats = () => {
        setStats({
            total: books.length,
            reading: books.filter((b) => b.status === 'Reading').length,
            completed: books.filter((b) => b.status === 'Completed').length,
            wishlist: books.filter((b) => b.status === 'Wishlist').length
        });
    };

    const filteredBooks = filter === 'All'
        ? books
        : books.filter((book) => book.status === filter);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <h1>My Book Collection</h1>
                    <Link to="/add-book" className="btn btn-primary">
                        Add New Book
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Books</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📖</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.reading}</div>
                            <div className="stat-label">Reading</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.completed}</div>
                            <div className="stat-label">Completed</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.wishlist}</div>
                            <div className="stat-label">Wishlist</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters">
                    <button
                        className={`filter-btn ${filter === 'All' ? 'active' : ''}`}
                        onClick={() => setFilter('All')}
                    >
                        All Books
                    </button>
                    <button
                        className={`filter-btn ${filter === 'Reading' ? 'active' : ''}`}
                        onClick={() => setFilter('Reading')}
                    >
                        Reading
                    </button>
                    <button
                        className={`filter-btn ${filter === 'Completed' ? 'active' : ''}`}
                        onClick={() => setFilter('Completed')}
                    >
                        Completed
                    </button>
                    <button
                        className={`filter-btn ${filter === 'Wishlist' ? 'active' : ''}`}
                        onClick={() => setFilter('Wishlist')}
                    >
                        Wishlist
                    </button>
                </div>

                {/* Books Grid */}
                {filteredBooks.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-icon">📚</p>
                        <h2>No books found</h2>
                        <p>Start building your collection by adding your first book!</p>
                        <Link to="/add-book" className="btn btn-primary mt-3">
                            Add Your First Book
                        </Link>
                    </div>
                ) : (
                    <div className="books-grid">
                        {filteredBooks.map((book) => (
                            <BookCard key={book._id} book={book} onUpdate={fetchBooks} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

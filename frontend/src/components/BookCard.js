import React from 'react';
import { Link } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book }) => {
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Reading':
                return 'badge-reading';
            case 'Completed':
                return 'badge-completed';
            case 'Wishlist':
                return 'badge-wishlist';
            default:
                return '';
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <span key={index} className={index < rating ? 'star' : 'star empty'}>
                ★
            </span>
        ));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Link to={`/book/${book._id}`} className="book-card-link">
            <div className="book-card">
                <div className="book-cover">
                    {book.hasPdf && (
                        <div className="pdf-badge">📄 PDF</div>
                    )}
                    {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title} />
                    ) : (
                        <div className="book-cover-placeholder">
                            <span>📖</span>
                        </div>
                    )}
                </div>

                <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">{book.author}</p>

                    <div className="book-meta">
                        <span className={`badge ${getStatusBadgeClass(book.status)}`}>
                            {book.status}
                        </span>

                        {book.rating > 0 && (
                            <div className="star-rating-small">
                                {renderStars(book.rating)}
                            </div>
                        )}
                    </div>

                    {book.hasPdf && (
                        <div className="pdf-info">
                            📚 Digital Copy ({formatFileSize(book.fileSize)})
                        </div>
                    )}

                    {book.notes && (
                        <p className="book-notes-preview">
                            {book.notes.substring(0, 60)}{book.notes.length > 60 ? '...' : ''}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default BookCard;

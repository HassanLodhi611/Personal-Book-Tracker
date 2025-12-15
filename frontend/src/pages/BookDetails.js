import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './BookDetails.css';
import './BookDetailsPDF.css';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        status: '',
        rating: 0,
        notes: ''
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await axios.get('/books');
                const foundBook = response.data.books.find((b) => b._id === id);

                if (foundBook) {
                    setBook(foundBook);
                    setFormData({
                        status: foundBook.status,
                        rating: foundBook.rating,
                        notes: foundBook.notes
                    });
                } else {
                    setError('Book not found');
                }
            } catch (err) {
                setError('Error loading book details');
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

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

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.put(`/books/${id}`, formData);

            if (response.data.success) {
                setBook(response.data.book);
                setIsEditing(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating book');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this book?')) {
            return;
        }

        try {
            await axios.delete(`/books/${id}`);
            navigate('/dashboard');
        } catch (err) {
            setError('Error deleting book');
        }
    };

    const handlePdfUpload = async (e) => {
        e.preventDefault();
        if (!pdfFile) {
            setError('Please select a PDF file');
            return;
        }

        setUploadingPdf(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('pdf', pdfFile);

            const response = await axios.post(`/books/upload-pdf/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setBook(response.data.book);
                setPdfFile(null);
                alert('PDF uploaded successfully!');
                // Reset file input
                document.querySelector('.file-input').value = '';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error uploading PDF');
        } finally {
            setUploadingPdf(false);
        }
    };

    const handlePdfDownload = () => {
        const fileName = book.pdfFile.split('/').pop() || book.pdfFile.split('\\\\').pop();
        const downloadUrl = `http://localhost:5000/${book.pdfFile}`;

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${book.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePdfDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this PDF?')) {
            return;
        }

        try {
            const response = await axios.delete(`/books/pdf/${id}`);
            if (response.data.success) {
                setBook(response.data.book);
                alert('PDF deleted successfully');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting PDF');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const renderStars = (currentRating, interactive = false) => {
        return [...Array(5)].map((_, index) => (
            <span
                key={index}
                className={index < currentRating ? 'star' : 'star empty'}
                onClick={interactive ? () => handleRatingClick(index + 1) : undefined}
                style={{ cursor: interactive ? 'pointer' : 'default' }}
            >
                ★
            </span>
        ));
    };

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

    if (loading && !book) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error && !book) {
        return (
            <div className="container" style={{ padding: '2rem' }}>
                <div className="alert alert-error">{error}</div>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!book) return null;

    return (
        <div className="book-details-page">
            <div className="container">
                <button className="btn btn-secondary mb-3" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>

                <div className="book-details-container">
                    {/* Book Cover & Info */}
                    <div className="book-cover-section">
                        {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="book-cover-large" />
                        ) : (
                            <div className="book-cover-placeholder-large">
                                <span>📖</span>
                            </div>
                        )}
                    </div>

                    <div className="book-content-section">
                        <div className="book-header">
                            <div>
                                <h1>{book.title}</h1>
                                <p className="book-author-large">by {book.author}</p>
                            </div>
                            <button className="btn btn-danger" onClick={handleDelete}>
                                Delete Book
                            </button>
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}

                        {/* View Mode */}
                        {!isEditing ? (
                            <div className="book-info-section">
                                <div className="info-row">
                                    <label>Status:</label>
                                    <span className={`badge ${getStatusBadgeClass(book.status)}`}>
                                        {book.status}
                                    </span>
                                </div>

                                <div className="info-row">
                                    <label>Rating:</label>
                                    <div className="star-rating">
                                        {renderStars(book.rating, false)}
                                    </div>
                                </div>

                                {book.description && (
                                    <div className="info-section">
                                        <label>Description:</label>
                                        <p className="book-description">{book.description}</p>
                                    </div>
                                )}

                                <div className="info-section">
                                    <label>Personal Notes:</label>
                                    <p className="book-notes">
                                        {book.notes || <em className="text-secondary">No notes yet</em>}
                                    </p>
                                </div>

                                {/* PDF Library Section */}
                                <div className="pdf-section">
                                    <h3>📚 Digital Library</h3>

                                    {book.hasPdf ? (
                                        <div className="pdf-exists">
                                            <div className="pdf-file-info">
                                                <div className="pdf-icon">📄</div>
                                                <div>
                                                    <div className="pdf-filename">
                                                        {book.title}.pdf
                                                    </div>
                                                    <div className="pdf-filesize">
                                                        Size: {formatFileSize(book.fileSize)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pdf-actions">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handlePdfDownload}
                                                >
                                                    ⬇ Download PDF
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={handlePdfDelete}
                                                >
                                                    🗑 Delete PDF
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pdf-upload">
                                            <p className="pdf-upload-info">
                                                Upload a PDF version of this book to access it anytime from your digital library
                                            </p>
                                            <form onSubmit={handlePdfUpload} className="pdf-upload-form">
                                                <input
                                                    type="file"
                                                    accept=".pdf,application/pdf"
                                                    onChange={(e) => setPdfFile(e.target.files[0])}
                                                    className="file-input"
                                                />
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={uploadingPdf || !pdfFile}
                                                >
                                                    {uploadingPdf ? 'Uploading...' : '📤 Upload PDF'}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>

                                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                                    Edit Details
                                </button>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form onSubmit={handleUpdate} className="book-edit-form">
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
                                        {renderStars(formData.rating, true)}
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
                                        rows="6"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                status: book.status,
                                                rating: book.rating,
                                                notes: book.notes
                                            });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;

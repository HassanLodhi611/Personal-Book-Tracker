import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from '../api/axios';
import './PDFReader.css';

// Configure PDF.js worker - using local file for reliability
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const PDFReader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await axios.get('/books');
                const foundBook = response.data.books.find((b) => b._id === id);

                if (foundBook) {
                    if (!foundBook.hasPdf) {
                        setError('This book does not have a PDF file');
                        setLoading(false);
                        return;
                    }
                    setBook(foundBook);
                } else {
                    setError('Book not found');
                }
            } catch (err) {
                setError('Error loading book');
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const goToPrevPage = React.useCallback(() => {
        setPageNumber((prev) => Math.max(prev - 1, 1));
    }, []);

    const goToNextPage = React.useCallback(() => {
        setPageNumber((prev) => Math.min(prev + 1, numPages));
    }, [numPages]);

    const goToFirstPage = React.useCallback(() => {
        setPageNumber(1);
    }, []);

    const goToLastPage = React.useCallback(() => {
        setPageNumber(numPages);
    }, [numPages]);

    const zoomIn = React.useCallback(() => {
        setScale((prev) => Math.min(prev + 0.2, 2.5));
    }, []);

    const zoomOut = React.useCallback(() => {
        setScale((prev) => Math.max(prev - 0.2, 0.5));
    }, []);

    const resetZoom = React.useCallback(() => {
        setScale(1.0);
    }, []);

    const handlePageInputChange = (e) => {
        const page = parseInt(e.target.value);
        if (page >= 1 && page <= numPages) {
            setPageNumber(page);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                goToPrevPage();
            } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                goToNextPage();
            } else if (e.key === 'Home') {
                goToFirstPage();
            } else if (e.key === 'End') {
                goToLastPage();
            } else if (e.key === '+' || e.key === '=') {
                zoomIn();
            } else if (e.key === '-') {
                zoomOut();
            } else if (e.key === '0') {
                resetZoom();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [goToPrevPage, goToNextPage, goToFirstPage, goToLastPage, zoomIn, zoomOut, resetZoom]);

    // Use API route to bypass IDM (no .pdf extension)
    const token = localStorage.getItem('token');

    const fileObj = useMemo(() => {
        if (!book) return null;
        return {
            url: `http://localhost:5000/api/books/content/${book._id}`,
            httpHeaders: { 'Authorization': `Bearer ${token}` },
            withCredentials: true
        };
    }, [book, token]);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pdf-reader-error">
                <div className="error-content">
                    <h2>❌ {error}</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/library')}>
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    if (!book) return null;



    return (
        <div className="pdf-reader">
            {/* Top Toolbar */}
            <div className="pdf-toolbar">
                <div className="toolbar-left">
                    <button className="toolbar-btn" onClick={() => navigate('/library')} title="Back to Library">
                        ← Back
                    </button>
                    <div className="book-info-toolbar">
                        <span className="book-title-toolbar">{book.title}</span>
                        <span className="book-author-toolbar">by {book.author}</span>
                    </div>
                </div>

                <div className="toolbar-center">
                    <button className="toolbar-btn" onClick={goToFirstPage} disabled={pageNumber === 1} title="First Page">
                        ⏮
                    </button>
                    <button className="toolbar-btn" onClick={goToPrevPage} disabled={pageNumber === 1} title="Previous Page">
                        ◀
                    </button>

                    <div className="page-info">
                        <input
                            type="number"
                            value={pageNumber}
                            onChange={handlePageInputChange}
                            className="page-input"
                            min="1"
                            max={numPages}
                        />
                        <span className="page-total">/ {numPages}</span>
                    </div>

                    <button className="toolbar-btn" onClick={goToNextPage} disabled={pageNumber === numPages} title="Next Page">
                        ▶
                    </button>
                    <button className="toolbar-btn" onClick={goToLastPage} disabled={pageNumber === numPages} title="Last Page">
                        ⏭
                    </button>
                </div>

                <div className="toolbar-right">
                    <button className="toolbar-btn" onClick={zoomOut} disabled={scale <= 0.5} title="Zoom Out (-)">
                        🔍−
                    </button>
                    <span className="zoom-level">{Math.round(scale * 100)}%</span>
                    <button className="toolbar-btn" onClick={zoomIn} disabled={scale >= 2.5} title="Zoom In (+)">
                        🔍+
                    </button>
                    <button className="toolbar-btn" onClick={resetZoom} title="Reset Zoom (0)">
                        ⟲
                    </button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="pdf-viewer-container">
                <Document
                    file={pdfFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => setError('Failed to load PDF')}
                    loading={
                        <div className="pdf-loading">
                            <div className="spinner"></div>
                            <p>Loading PDF...</p>
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        loading={
                            <div className="page-loading">
                                <div className="spinner"></div>
                            </div>
                        }
                    />
                </Document>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="keyboard-shortcuts">
                <details>
                    <summary>⌨️ Keyboard Shortcuts</summary>
                    <ul>
                        <li><kbd>←</kbd> or <kbd>PgUp</kbd> - Previous Page</li>
                        <li><kbd>→</kbd> or <kbd>PgDn</kbd> - Next Page</li>
                        <li><kbd>Home</kbd> - First Page</li>
                        <li><kbd>End</kbd> - Last Page</li>
                        <li><kbd>+</kbd> - Zoom In</li>
                        <li><kbd>-</kbd> - Zoom Out</li>
                        <li><kbd>0</kbd> - Reset Zoom</li>
                    </ul>
                </details>
            </div>
        </div>
    );
};

export default PDFReader;

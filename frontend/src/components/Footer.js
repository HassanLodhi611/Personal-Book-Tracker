import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Brand Section */}
                    <div className="footer-section footer-brand">
                        <div className="footer-logo">
                            <img src="/logo.png" alt="ReadVault" className="footer-logo-img" />
                            <h3>ReadVault</h3>
                        </div>
                        <p className="footer-description">
                            Your personal digital library. Track, manage, and read your book collection anytime, anywhere.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/add-book">Add Book</Link></li>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#about">About</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="footer-section">
                        <h4>Resources</h4>
                        <ul className="footer-links">
                            <li><a href="https://developers.google.com/books" target="_blank" rel="noopener noreferrer">Google Books API</a></li>
                            <li><a href="#help">Help Center</a></li>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#terms">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div className="footer-section">
                        <h4>Connect</h4>
                        <ul className="footer-links">
                            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                            <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                            <li><a href="mailto:contact@booktracker.com">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p>&copy; {currentYear} ReadVault. All rights reserved.</p>
                    <p className="footer-tagline">Built with ❤️ using MERN Stack</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

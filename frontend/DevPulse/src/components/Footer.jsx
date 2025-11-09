import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiGithub, FiLinkedin } from 'react-icons/fi';
import { FaXTwitter } from 'react-icons/fa6';
import '../styles/Footer.css';

function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual subscription
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Dev Pulse</h3>
            <p>Stay updated with the latest startup insights, tech news, and founder stories.</p>
          </div>

          <div className="footer-section">
            <h4>Subscribe</h4>
            <form onSubmit={handleSubmit} className="subscribe-form">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="subscribe-input"
              />
              <motion.button
                type="submit"
                className="subscribe-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {submitted ? 'Subscribed!' : <FiMail />}
              </motion.button>
            </form>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="https://github.com/Captain-MUDIT" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FiGithub />
              </a>
              <a href="https://linkedin.com/in/001-mudit-jain" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FiLinkedin />
              </a>
              <a href="https://x.com/mudit_jain001" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <FaXTwitter />
              </a>
              <a href="mailto:mvjain_b23@ce.vjti.ac.in" aria-label="Email">
                <FiMail />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Dev Pulse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


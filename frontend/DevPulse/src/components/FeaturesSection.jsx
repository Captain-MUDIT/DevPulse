import React from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiFilter, FiSearch, FiClock } from 'react-icons/fi';
import '../styles/FeaturesSection.css';

function FeaturesSection() {
  const features = [
    // {
    //   icon: <FiZap />,
    //   title: 'AI-Powered',
    //   description: 'Advanced AI filters and summarizes articles to bring you the most relevant content',
    // },
    // {
    //   icon: <FiFilter />,
    //   title: 'Smart Categories',
    //   description: 'Organized into Business, Tech, Papers, and Patents for easy navigation',
    // },
    // {
    //   icon: <FiSearch />,
    //   title: 'Intelligent Search',
    //   description: 'Find exactly what you need with our powerful search and filtering system',
    // },
    // {
    //   icon: <FiClock />,
    //   title: 'Real-Time Updates',
    //   description: 'Stay current with the latest news and research as it happens',
    // },
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <motion.div
          className="features-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* <p className="section-label">Why Dev Pulse</p> */}
          <h2 className="section-title">Built for Modern Developers</h2>
          <p className="section-description">
            We combine cutting-edge AI technology with thoughtful design to deliver
            the news and insights that matter most to tech professionals and founders.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;


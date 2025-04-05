import React from 'react';

const About = () => {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="step-label">About Us</div>
            <h1 className="hero-title">Meet the Team Behind Answerly</h1>
            <p className="hero-description">
              We're a group of AI researchers and engineers passionate about making document analysis and question answering technology accessible to everyone.
            </p>
          </div>
          <div className="hero-image">
            <img src="/about-hero.svg" alt="Team collaboration illustration" className="floating-animation" />
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <h2 className="section-title">Our Mission</h2>
            <p className="mission-text">
              We believe that AI should help people access and understand information more efficiently. Our mission is to create tools that make document analysis faster, more accurate, and accessible to everyone regardless of technical background.
            </p>
            <p className="mission-text">
              By combining cutting-edge AI models with intuitive user interfaces, we're making it possible for anyone to extract valuable insights from their documents with just a few clicks.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <div className="container">
          <h2 className="section-title">Our Technology</h2>
          
          <div className="tech-cards">
            <div className="tech-card">
              <h3>State-of-the-Art Models</h3>
              <p>We use the latest transformer-based AI models fine-tuned specifically for question answering tasks.</p>
            </div>
            
            <div className="tech-card">
              <h3>Intelligent Document Processing</h3>
              <p>Our system can parse and understand various document formats while preserving their structure.</p>
            </div>
            
            <div className="tech-card">
              <h3>Context-Aware Analysis</h3>
              <p>The AI understands document context to provide more accurate and relevant answers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-card">
            <h2>Have Questions?</h2>
            <p>We'd love to hear from you! Reach out with any questions about our technology or how we can help with your specific needs.</p>
            <button className="btn btn-primary">Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
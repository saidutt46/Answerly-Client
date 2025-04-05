import React from 'react';

const Features = () => {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="step-label">Advanced Features</div>
            <h1 className="hero-title">Powerful AI Tools for Document Analysis</h1>
            <p className="hero-description">
              Discover how our advanced AI models can help you extract valuable insights from your documents and answer complex questions with high accuracy.
            </p>
          </div>
          <div className="hero-image">
            <img src="/feature-hero.svg" alt="AI document analysis illustration" className="floating-animation" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Multiple Document Formats</h3>
              <p>Upload PDFs, text files, or paste content directly to extract answers from any source.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>AI Model Selection</h3>
              <p>Choose from various models optimized for speed, accuracy, or specialized knowledge domains.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Context Highlighting</h3>
              <p>See exactly where in your document the AI found relevant information for each answer.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Confidence Scoring</h3>
              <p>Understand how confident the AI is about each answer with detailed metrics.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>Access all features from any device with a fully responsive interface.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Privacy Focused</h3>
              <p>Your documents are processed securely and never stored permanently on our servers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Upload Your Document</h3>
                <p>Simply drag and drop your file or paste your text into the system.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Ask Your Question</h3>
                <p>Type any question related to the content of your document.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Get Accurate Answers</h3>
                <p>Receive precise answers with highlighted source text and confidence scores.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
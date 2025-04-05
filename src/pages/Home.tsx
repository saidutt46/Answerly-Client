import React from 'react';

const Home = () => {
  return (
    <>
      <section className="hero">
        <h1 className="hero-title">
          Intelligent Answers from Your Documents
        </h1>
        <p className="hero-subtitle">
          Upload documents or provide context to get accurate answers powered by advanced AI models.
        </p>
        
        <div className="hero-buttons">
          <button className="btn btn-primary">
            Get Started
          </button>
          <button className="btn btn-outline">
            Learn More
          </button>
        </div>
      </section>
      
      <section className="features container">
        <div className="features-grid">
          <div className="card">
            <h3 className="mb-2">Multiple Models</h3>
            <p>Choose from various pre-trained models optimized for different types of questions.</p>
          </div>
          <div className="card">
            <h3 className="mb-2">Document Analysis</h3>
            <p>Upload PDFs and text files to extract answers from your own documents.</p>
          </div>
          <div className="card">
            <h3 className="mb-2">Confidence Scoring</h3>
            <p>See how confident the AI is about each answer to better evaluate results.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
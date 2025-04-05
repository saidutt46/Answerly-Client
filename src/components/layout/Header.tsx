// src/components/layout/Header.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo">
          Answerly
        </Link>
        
        {/* Mobile menu button */}
        <button type="button" className="mobile-menu-button" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`hamburger ${menuOpen ? 'active' : ''}`}></span>
        </button>
        
        {/* Navigation */}
        <nav className={`nav ${menuOpen ? 'nav-active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/features" className="nav-link" onClick={() => setMenuOpen(false)}>Features</Link>
          <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
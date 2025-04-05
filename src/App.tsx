// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Features from './pages/Features';
import About from './pages/About';
import QAPage from './pages/QAPage';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/features" element={<Layout><Features /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/qa" element={<Layout><QAPage /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
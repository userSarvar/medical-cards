import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CardView from './pages/CardView';
import Admin from './pages/Admin';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="top-nav">
          <Link to="/">Home</Link>
          <Link to="/admin" className="admin-link">Admin Panel</Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/card/:id" element={<CardView />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
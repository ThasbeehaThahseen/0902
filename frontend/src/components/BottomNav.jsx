import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BottomNav.css';

export const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <div className="bottom-nav">
      <button onClick={() => navigate('/get-in-touch')} className="nav-link">
        Get in Touch
      </button>
      <span className="nav-separator">|</span>
      <button onClick={() => navigate('/about')} className="nav-link">
        About Us
      </button>
      <span className="nav-separator">|</span>
      <button onClick={() => navigate('/reviews')} className="nav-link">
        Customer Reviews
      </button>
    </div>
  );
};
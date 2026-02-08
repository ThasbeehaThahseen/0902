import React from 'react';
import { BottomNav } from './BottomNav';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <BottomNav />
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Milan Readymades. All rights reserved.</p>
        <p className="footer-tagline">Elegant Fashion for Every Occasion</p>
      </div>
    </footer>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../context/CartContext';
import './FloatingCartButton.css';

export const FloatingCartButton = () => {
  const { cartCount } = useCart();
  const navigate = useNavigate();

  if (cartCount === 0) return null;

  return (
    <div className="floating-cart-button" data-testid="floating-cart-button">
      <Button
        onClick={() => navigate('/cart')}
        className="view-cart-btn"
        data-testid="view-cart-btn"
      >
        <ShoppingCart size={20} />
        <span>View Cart ({cartCount})</span>
      </Button>
    </div>
  );
};

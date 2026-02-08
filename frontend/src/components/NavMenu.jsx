import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Menu, Info, ShoppingCart, MessageSquare, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import './NavMenu.css';

export const NavMenu = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  return (
    <div className="nav-menu">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="menu-trigger">
            <Menu size={24} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="menu-content">
          <DropdownMenuItem onClick={() => navigate('/about')} className="menu-item">
            <Info size={18} />
            About Us
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/cart')} className="menu-item">
            <ShoppingCart size={18} />
            My Cart
            {cartCount > 0 && (
              <Badge variant="destructive" className="cart-badge">
                {cartCount}
              </Badge>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/feedback')} className="menu-item">
            <MessageSquare size={18} />
            Give Feedback
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/login')} className="menu-item">
            <LogIn size={18} />
            Log In
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
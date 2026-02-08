import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, Shirt, Layers, Baby, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { NavMenu } from '../components/NavMenu';
import axios from 'axios';
import './HomePage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const HomePage = () => {
  const navigate = useNavigate();
  const [freshArrivals, setFreshArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFreshArrivals();
  }, []);

  const loadFreshArrivals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/products?show_in_fresh_arrivals=true`);
      setFreshArrivals(response.data.slice(0, 8)); // Show first 8 items
    } catch (error) {
      console.error('Error loading fresh arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage" data-testid="homepage">
      <NavMenu />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="store-name">Milan Readymades</h1>
          <p className="store-tagline">Elegant Fashion for Every Occasion</p>
          <p className="welcome-text">
            Welcome to Milan Readymades, Vadapalani's premier destination for exquisite traditional and contemporary clothing.
            Discover our curated collection for men, women, and children.
          </p>
        </div>
      </section>

      {/* Fresh Arrivals - Moved to top */}
      <section className="new-arrivals-section">
        <div className="section-header">
          <Sparkles className="sparkle-icon" />
          <h2 className="section-title">Fresh Arrivals</h2>
          <Sparkles className="sparkle-icon" />
        </div>
        {loading ? (
          <div className="loading-message">Loading fresh arrivals...</div>
        ) : freshArrivals.length > 0 ? (
          <>
            <div className="fresh-arrivals-preview" data-testid="fresh-arrivals-preview">
              <p className="preview-text">
                Check out our latest collection of {freshArrivals.length} fresh arrivals!
              </p>
            </div>
            <div className="fresh-arrivals-button">
              <Button 
                onClick={() => navigate('/fresh-arrivals')} 
                className="category-button" 
                size="lg"
                data-testid="view-fresh-arrivals-btn"
              >
                <Sparkles size={24} />
                View Fresh Arrivals
                <ChevronRight size={20} />
              </Button>
            </div>
          </>
        ) : (
          <div className="no-fresh-arrivals">
            <p>No fresh arrivals at the moment. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Gender Selection */}
      <section className="gender-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="gender-grid">
          <Card className="gender-card" onClick={() => navigate('/category/men')} data-testid="men-category-card">
            <CardContent className="gender-card-content">
              <div className="gender-icon-svg">
                <Shirt size={64} strokeWidth={1.5} />
              </div>
              <h3>Men's Collection</h3>
              <p>Traditional & Contemporary Wear</p>
              <Button variant="ghost" className="explore-btn">
                Explore <ChevronRight size={18} />
              </Button>
            </CardContent>
          </Card>

          <Card className="gender-card" onClick={() => navigate('/category/women')} data-testid="women-category-card">
            <CardContent className="gender-card-content">
              <div className="gender-icon-svg">
                <Layers size={64} strokeWidth={1.5} />
              </div>
              <h3>Women's Collection</h3>
              <p>Sarees, Ethnic & Western Wear</p>
              <Button variant="ghost" className="explore-btn">
                Explore <ChevronRight size={18} />
              </Button>
            </CardContent>
          </Card>

          <Card className="gender-card" onClick={() => navigate('/category/kids')} data-testid="kids-category-card">
            <CardContent className="gender-card-content">
              <div className="gender-icon-svg">
                <Baby size={64} strokeWidth={1.5} />
              </div>
              <h3>Kids Collection</h3>
              <p>Traditional, Casual & Party Wear</p>
              <Button variant="ghost" className="explore-btn">
                Explore <ChevronRight size={18} />
              </Button>
            </CardContent>
          </Card>

          <Card className="gender-card" onClick={() => navigate('/category/accessories')} data-testid="accessories-category-card">
            <CardContent className="gender-card-content">
              <div className="gender-icon-svg">
                <Package size={64} strokeWidth={1.5} />
              </div>
              <h3>Accessories</h3>
              <p>Belts, Socks, Towels & More</p>
              <Button variant="ghost" className="explore-btn">
                Explore <ChevronRight size={18} />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

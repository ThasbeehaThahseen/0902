import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';
import './FreshArrivalsPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const FreshArrivalsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFreshArrivals();
  }, []);

  const loadFreshArrivals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API}/products?show_in_fresh_arrivals=true`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading fresh arrivals:', error);
      setError('Failed to load fresh arrivals');
    } finally {
      setLoading(false);
    }
  };

  // Get primary image from product images array
  const getPrimaryImage = (product) => {
    if (!product.images || product.images.length === 0) {
      return '/placeholder-image.png';
    }
    const primaryImage = product.images.find(img => img.is_primary);
    return primaryImage ? primaryImage.url : product.images[0].url;
  };

  if (loading) {
    return (
      <div className="fresh-arrivals-page">
        <div className="loading-message">Loading fresh arrivals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fresh-arrivals-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="fresh-arrivals-page" data-testid="fresh-arrivals-page">
      <div className="page-header">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')} 
          className="back-btn"
          data-testid="back-btn"
        >
          <ArrowLeft size={20} /> Back to Home
        </Button>
        <div className="header-title">
          <Sparkles className="sparkle-icon" size={32} />
          <h1 className="page-title">Fresh Arrivals</h1>
          <Sparkles className="sparkle-icon" size={32} />
        </div>
        <p className="page-subtitle">Discover our latest collection</p>
      </div>

      <section className="products-section">
        {products.length === 0 ? (
          <div className="no-products">
            <p>No fresh arrivals at the moment.</p>
            <p className="coming-soon">Check back soon for exciting new products!</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <Card 
                key={product.id} 
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
                data-testid={`product-card-${product.id}`}
              >
                <div className="product-image-wrapper">
                  <img 
                    src={getPrimaryImage(product)} 
                    alt={product.name} 
                    className="product-image"
                    data-testid="product-primary-image"
                  />
                  <span className="new-badge" data-testid="fresh-arrival-badge">
                    <Sparkles size={12} /> fresh arrivals
                  </span>
                </div>
                <CardContent className="product-info">
                  <h4 className="product-name" data-testid="product-name">{product.name}</h4>
                  <p className="product-short-desc" data-testid="product-short-desc">{product.short_description}</p>
                  <p className="product-price" data-testid="product-price">₹{product.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

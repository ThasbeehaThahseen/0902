import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';
import './ProductsPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ProductsPage = () => {
  const { gender, subcategory, kidsGender } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const ageGroup = searchParams.get('ageGroup');

  useEffect(() => {
    loadProducts();
  }, [gender, subcategory, kidsGender, ageGroup]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = [];
      
      if (gender === 'kids') {
        query.push('category=kids');
        if (subcategory) query.push(`subcategory=${subcategory}`);
        if (kidsGender) query.push(`gender=${kidsGender}`);
        if (ageGroup) query.push(`age_group=${ageGroup}`);
      } else {
        query.push(`category=${gender}`);
        if (subcategory) query.push(`subcategory=${subcategory}`);
      }

      const response = await axios.get(`${API}/products?${query.join('&')}`);
      
      // Sort by new arrivals first
      const sortedProducts = response.data.sort((a, b) => {
        if (a.is_new_arrival && !b.is_new_arrival) return -1;
        if (!a.is_new_arrival && b.is_new_arrival) return 1;
        return 0;
      });
      
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products');
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

  const categoryTitle = products[0]?.name?.split(' ')[0] || subcategory || 'Products';

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-message">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="products-page" data-testid="products-page">
      <div className="page-header">
        <Button 
          variant="ghost" 
          onClick={() => navigate(gender === 'kids' && kidsGender ? `/category/kids` : `/category/${gender}`)} 
          className="back-btn"
          data-testid="back-btn"
        >
          <ArrowLeft size={20} /> Back
        </Button>
        <h1 className="page-title">{categoryTitle}</h1>
        {kidsGender && <p className="page-subtitle">For {kidsGender === 'boy' ? 'Boys' : 'Girls'}</p>}
      </div>

      <section className="products-section">
        {products.length === 0 ? (
          <div className="no-products">
            <p>No products available in this category yet.</p>
            <p className="coming-soon">Coming Soon!</p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {currentProducts.map(product => (
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
                    {product.is_new_arrival && (
                      <span className="new-badge" data-testid="new-arrival-badge">
                        <Sparkles size={12} /> fresh arrivals
                      </span>
                    )}
                  </div>
                  <CardContent className="product-info">
                    <h4 className="product-name" data-testid="product-name">{product.name}</h4>
                    <p className="product-short-desc" data-testid="product-short-desc">{product.short_description}</p>
                    <p className="product-price" data-testid="product-price">₹{product.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`page-button ${currentPage === pageNumber ? 'active' : ''}`}
                    data-testid={`page-button-${pageNumber}`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

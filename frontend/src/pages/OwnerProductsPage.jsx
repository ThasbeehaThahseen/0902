import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Plus, Edit, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import './OwnerProductsPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const KIDS_SUBCATEGORIES = [
  { id: 'traditional', name: 'Traditional' },
  { id: 'casual', name: 'Casual' },
  { id: 'party', name: 'Party Wears' },
  { id: 'nightwear', name: 'Night Wears' }
];

export const OwnerProductsPage = () => {
  const navigate = useNavigate();
  const { section, category, ageGroup, gender } = useParams();
  const { isAuthenticated, loading, token } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    // For kids section, show subcategories first instead of products
    if (section === 'kids' && ageGroup && gender && !category) {
      window.scrollTo(0, 0);
      setShowSubcategories(true);
      setLoadingProducts(false);
    } else if (isAuthenticated) {
      window.scrollTo(0, 0);
      setShowSubcategories(false);
      loadProducts();
    }
  }, [isAuthenticated, section, category, ageGroup, gender]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      let query = `category=${section}`;
      
      if (section === 'kids' && ageGroup && gender && category) {
        query += `&age_group=${ageGroup}&gender=${gender}&subcategory=${category}`;
      } else if (section === 'kids' && ageGroup && gender) {
        query += `&age_group=${ageGroup}&gender=${gender}`;
      } else if (category) {
        query += `&subcategory=${category}`;
      }

      const response = await axios.get(`${API}/products?${query}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddProduct = () => {
    if (section === 'kids' && ageGroup && gender && category) {
      navigate(`/owner/add-product/${section}/${ageGroup}/${gender}/${category}`);
    } else if (section === 'kids' && ageGroup && gender) {
      // Redirect to choose subcategory first
      toast({
        title: 'Select Subcategory',
        description: 'Please select a subcategory first',
        variant: 'default'
      });
    } else {
      navigate(`/owner/add-product/${section}/${category}`);
    }
  };

  const handleEditProduct = (productId) => {
    navigate(`/owner/edit-product/${productId}`);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await axios.delete(`${API}/products/${productToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });

      setProducts(products.filter(p => p.id !== productToDelete.id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const toggleExpandProduct = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

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
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const getPageTitle = () => {
    if (section === 'kids' && ageGroup && gender && category) {
      return `${gender.charAt(0).toUpperCase() + gender.slice(1)}s - ${category.charAt(0).toUpperCase() + category.slice(1)} (${ageGroup} years)`;
    } else if (section === 'kids' && ageGroup && gender) {
      return `${gender.charAt(0).toUpperCase() + gender.slice(1)}s (${ageGroup} years)`;
    }
    return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Products';
  };

  // Show subcategories for kids section
  if (showSubcategories) {
    return (
      <div className="owner-products-page">
        <header className="products-header">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/owner/section/${section}`)}
            data-testid="back-to-section-btn"
          >
            <ArrowLeft size={18} />
            Back to Section
          </Button>
          <div className="products-header-content">
            <h1>{getPageTitle()}</h1>
            <p>Select a subcategory</p>
          </div>
        </header>

        <div className="subcategories-grid">
          {KIDS_SUBCATEGORIES.map((subcat) => (
            <Card 
              key={subcat.id}
              className="subcategory-card"
              onClick={() => navigate(`/owner/products/${section}/${ageGroup}/${gender}/${subcat.id}`)}
              data-testid={`subcategory-${subcat.id}`}
            >
              <CardContent className="subcategory-card-content">
                <h3>{subcat.name}</h3>
                <Button variant="ghost" size="sm">
                  View Products
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="owner-products-page">
      <header className="products-header">
        <Button 
          variant="outline" 
          onClick={() => {
            if (section === 'kids' && ageGroup && gender && category) {
              navigate(`/owner/products/${section}/${ageGroup}/${gender}`);
            } else {
              navigate(`/owner/section/${section}`);
            }
          }}
          data-testid="back-to-section-btn"
        >
          <ArrowLeft size={18} />
          {section === 'kids' && category ? 'Back to Subcategories' : 'Back to Section'}
        </Button>
        <div className="products-header-content">
          <h1>{getPageTitle()}</h1>
          <p>Manage products in this category</p>
        </div>
        <Button 
          onClick={handleAddProduct} 
          className="add-product-btn"
          data-testid="add-product-btn"
        >
          <Plus size={18} />
          Add New Product
        </Button>
      </header>

      <div className="products-content">
        {loadingProducts ? (
          <div className="loading-message">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found in this category</p>
            <Button onClick={handleAddProduct} data-testid="add-first-product-btn">
              <Plus size={18} />
              Add First Product
            </Button>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {currentProducts.map((product) => (
                <Card key={product.id} className="product-card" data-testid={`product-card-${product.id}`}>
                <CardContent className="product-card-content">
                  <div className="product-image-container">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0].url} 
                        alt={product.name}
                        className="product-image"
                        onClick={() => toggleExpandProduct(product.id)}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="edit-overlay-btn"
                      onClick={() => handleEditProduct(product.id)}
                      data-testid={`edit-btn-${product.id}`}
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                  </div>

                  {expandedProduct === product.id && (
                    <div className="product-details-expanded">
                      <div className="detail-row">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{product.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Price:</span>
                        <span className="detail-value">₹{product.price}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Fabric:</span>
                        <span className="detail-value">{product.fabric}</span>
                      </div>
                      {product.available_colors && product.available_colors.length > 0 && (
                        <div className="detail-row">
                          <span className="detail-label">Other Colors:</span>
                          <span className="detail-value">{product.available_colors.join(', ')}</span>
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Sizes:</span>
                        <span className="detail-value">{product.sizes.join(', ')}</span>
                      </div>
                      {product.is_new_arrival && (
                        <div className="detail-row">
                          <span className="new-arrival-badge">Fresh Arrival</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="product-card-footer">
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-price">₹{product.price}</p>
                    </div>
                    <div className="product-actions">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleExpandProduct(product.id)}
                        data-testid={`view-details-btn-${product.id}`}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProduct(product.id)}
                        data-testid={`edit-action-btn-${product.id}`}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(product)}
                        data-testid={`delete-btn-${product.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
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
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

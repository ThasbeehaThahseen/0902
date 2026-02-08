import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Check, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { UserAuthModal } from '../components/UserAuthModal';
import { FloatingCartButton } from '../components/FloatingCartButton';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/use-toast';
import './ProductDetailPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const WHATSAPP_NUMBER = '918072153196';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const { isUserAuthenticated } = useAuth();
  const { addToCart, fetchCart } = useCart();
  const { toast } = useToast();

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
      
      // Set initial image to primary image
      if (response.data.images && response.data.images.length > 0) {
        const primaryIndex = response.data.images.findIndex(img => img.is_primary);
        setCurrentImageIndex(primaryIndex >= 0 ? primaryIndex : 0);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Update selected color and size when image changes
  useEffect(() => {
    if (product && product.images && product.images[currentImageIndex]) {
      const currentImage = product.images[currentImageIndex];
      setSelectedColor(currentImage.color || null);
      // Reset selected size when image changes (user needs to select from dropdown)
      setSelectedSize(null);
    }
  }, [currentImageIndex, product]);

  const handleWhatsAppClick = () => {
    setShowWhatsAppDialog(true);
  };

  const handleConfirmWhatsApp = () => {
    const message = `Hi! I'm interested in:

Product: ${product.name}
Category: ${product.category}
Available Sizes: ${product.sizes.join(', ')}

Could you please provide more details?`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsAppDialog(false);
  };

  const handleAddToCart = async () => {
    // Check if user is authenticated
    if (!isUserAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Validate selections
    if (!selectedSize) {
      toast({
        title: 'Size required',
        description: 'Please select a size before adding to cart',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedColor) {
      toast({
        title: 'Color required',
        description: 'Please select a color before adding to cart',
        variant: 'destructive'
      });
      return;
    }

    // Get current image URL
    const currentImage = product.images && product.images.length > 0 
      ? product.images[currentImageIndex].url 
      : '/placeholder-image.png';

    setAddingToCart(true);

    const cartItem = {
      product_id: product.id,
      name: product.name,
      image: currentImage,
      short_description: product.short_description,
      price: product.price,
      selected_size: selectedSize,
      selected_color: selectedColor
    };

    const result = await addToCart(cartItem);
    setAddingToCart(false);

    if (result.success) {
      toast({
        title: 'Added to cart!',
        description: `${product.name} has been added to your cart`
      });
      // Fetch updated cart
      await fetchCart();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add to cart',
        variant: 'destructive'
      });
    }
  };

  const handleAuthSuccess = async () => {
    // After successful authentication, try adding to cart again
    setShowAuthModal(false);
    await handleAddToCart();
  };

  // Navigate to next image
  const nextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  // Navigate to previous image
  const prevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  // Handle color click - navigate to image with that color
  const handleColorClick = (color) => {
    if (!product || !product.images) return;
    
    const imageIndex = product.images.findIndex(img => img.color === color);
    if (imageIndex >= 0) {
      setCurrentImageIndex(imageIndex);
      setSelectedColor(color);
    }
  };

  // Get unique colors from all images
  const getUniqueColors = () => {
    if (!product || !product.images) return [];
    const colors = product.images
      .map(img => img.color)
      .filter(color => color); // Filter out null/undefined
    return [...new Set(colors)];
  };

  // Get all sizes from current image
  const getCurrentImageSizes = () => {
    if (!product || !product.images || !product.images[currentImageIndex]) return [];
    return product.images[currentImageIndex].sizes || [];
  };

  // Touch event handlers for swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Swipe right to left = next image
    if (isLeftSwipe) {
      nextImage();
    }
    // Swipe left to right = previous image
    if (isRightSwipe) {
      prevImage();
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-message">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="not-found">
          <h2>Product Not Found</h2>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const currentImage = product.images && product.images.length > 0 
    ? product.images[currentImageIndex].url 
    : '/placeholder-image.png';

  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className="product-detail-page" data-testid="product-detail-page">
      <div className="product-detail-container">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="back-btn"
          data-testid="back-btn"
        >
          <ArrowLeft size={20} /> Back
        </Button>

        <div className="product-detail-grid">
          {/* Product Image Carousel */}
          <div className="product-image-section">
            <div 
              className="main-image-wrapper"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              data-testid="image-carousel"
            >
              <img 
                src={currentImage} 
                alt={`${product.name} - Image ${currentImageIndex + 1}`} 
                className="main-image"
                data-testid="product-main-image"
              />
              {product.is_new_arrival && (
                <span className="new-badge" data-testid="new-arrival-badge">fresh arrivals</span>
              )}
              
              {/* Navigation arrows - only show if multiple images */}
              {hasMultipleImages && (
                <>
                  <button 
                    className="image-nav-btn prev-btn" 
                    onClick={prevImage}
                    aria-label="Previous image"
                    data-testid="prev-image-btn"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className="image-nav-btn next-btn" 
                    onClick={nextImage}
                    aria-label="Next image"
                    data-testid="next-image-btn"
                  >
                    <ChevronRight size={24} />
                  </button>
                  
                  {/* Image indicator dots */}
                  <div className="image-indicators" data-testid="image-indicators">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Go to image ${index + 1}`}
                        data-testid={`indicator-dot-${index}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Swipe instruction */}
            {hasMultipleImages && (
              <p className="swipe-instruction" data-testid="swipe-instruction">
                Swipe right to left to view more images ({currentImageIndex + 1}/{product.images.length})
              </p>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <h1 className="product-title" data-testid="product-title">{product.name}</h1>
              <p className="product-short-desc" data-testid="product-short-desc">{product.short_description}</p>
              <p className="product-price" data-testid="product-price">₹{product.price}</p>
            </div>

            {/* Available Sizes - Only show if current image has sizes */}
            {getCurrentImageSizes().length > 0 && (
              <div className="sizes-section">
                <Label htmlFor="size-select" className="section-heading" style={{ display: 'block', marginBottom: '10px' }}>
                  Available Sizes
                </Label>
                <Select 
                  value={selectedSize || ''} 
                  onValueChange={(value) => setSelectedSize(value)}
                >
                  <SelectTrigger 
                    id="size-select"
                    data-testid="size-dropdown"
                    style={{ width: '100%', maxWidth: '300px' }}
                  >
                    <SelectValue placeholder="Select a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentImageSizes().map(size => (
                      <SelectItem 
                        key={size} 
                        value={size}
                        data-testid={`size-option-${size}`}
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Available Colors */}
            {getUniqueColors().length > 0 && (
              <div className="colors-section" style={{ marginTop: '20px' }}>
                <h3 className="section-heading">Available Colours</h3>
                <div className="colors-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {getUniqueColors().map(color => (
                    <div 
                      key={color} 
                      className={`color-box ${selectedColor === color ? 'highlighted' : ''}`}
                      onClick={() => handleColorClick(color)}
                      data-testid={`color-${color}`}
                      style={{ 
                        padding: '10px 16px',
                        border: selectedColor === color ? '2px solid #000' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: selectedColor === color ? '#f0f9ff' : 'white',
                        fontWeight: selectedColor === color ? '600' : '400',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {selectedColor === color && <Check size={16} />}
                      <span>{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Details */}
            <Card className="product-details-card">
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{product.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Subcategory:</span>
                <span className="detail-value">{product.subcategory}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fabric:</span>
                <span className="detail-value">{product.fabric}</span>
              </div>
              {product.available_colors && product.available_colors.length > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Other Available Colors:</span>
                  <span className="detail-value">{product.available_colors.join(', ')}</span>
                </div>
              )}
              {product.description && (
                <div className="detail-row description-row">
                  <span className="detail-label">Description:</span>
                  <p className="detail-description">{product.description}</p>
                </div>
              )}
              {product.is_new_arrival && (
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value new-arrival-text">Fresh Arrival ✨</span>
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="action-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Button 
                className="add-to-cart-btn" 
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedSize || !selectedColor}
                data-testid="add-to-cart-btn"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '12px 20px',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <ShoppingCart size={20} />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>

              <Button 
                className="whatsapp-btn" 
                onClick={handleWhatsAppClick}
                data-testid="whatsapp-btn"
                style={{
                  flex: 1,
                  background: '#25D366',
                  color: 'white',
                  fontWeight: '600',
                  padding: '12px 20px',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <MessageCircle size={20} />
                Inquire on WhatsApp
              </Button>
            </div>

            <p className="inquiry-note" style={{ marginTop: '12px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
              Add to cart or send an inquiry about this product directly to our WhatsApp.
            </p>

            {/* Return to Product Listings Button */}
            <Button 
              variant="outline"
              className="return-to-listings-btn" 
              onClick={() => navigate(-1)}
              data-testid="return-to-listings-btn"
            >
              <ArrowLeft size={18} />
              Return to Product Listings
            </Button>
          </div>
        </div>
      </div>

      {/* WhatsApp Confirmation Dialog */}
      <AlertDialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send WhatsApp Inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;re about to send an inquiry for <strong>{product.name}</strong> to Milan Readymades on WhatsApp.
              <br /><br />
              The message will include:
              <ul className="whatsapp-message-preview">
                <li>Product Name: {product.name}</li>
                <li>Category: {product.category}</li>
                <li>Available Sizes: {product.sizes.join(', ')}</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmWhatsApp}>
              Confirm & Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Authentication Modal */}
      <UserAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </div>
  );
};

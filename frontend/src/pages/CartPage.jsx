import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { ShoppingCart, Trash2, MessageCircle, ArrowLeft, LogIn } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { UserAuthModal } from '../components/UserAuthModal';
import './CartPage.css';

export const CartPage = () => {
  const { cart, removeFromCart, toggleItemSelection, enquireSelectedItems, fetchCart, loading: cartLoading } = useCart();
  const { isUserAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isUserAuthenticated) {
      fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserAuthenticated]);

  const handleToggleSelection = async (itemId) => {
    const result = await toggleItemSelection(itemId);
    if (!result.success) {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update selection',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your cart'
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to remove item',
        variant: 'destructive'
      });
    }
  };

  const handleWhatsAppEnquiry = async () => {
    const selectedItems = cart.filter(item => item.is_selected);
    
    if (selectedItems.length === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one item to enquire',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const result = await enquireSelectedItems();
    setLoading(false);

    if (result.success) {
      window.open(result.data.whatsapp_url, '_blank');
      toast({
        title: 'Enquiry sent!',
        description: 'Opening WhatsApp...'
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to process enquiry',
        variant: 'destructive'
      });
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    fetchCart();
  };

  // If user is not authenticated, show login prompt
  if (!isUserAuthenticated) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft size={20} /> Back
          </Button>
          <h1 className="cart-title">
            <ShoppingCart size={28} /> My Cart
          </h1>
        </div>

        <Card className="empty-cart">
          <CardContent className="empty-cart-content" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <LogIn size={64} className="empty-icon" style={{ margin: '0 auto 20px', color: '#9ca3af' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Login to view your cart</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Sign in with your mobile number to access your saved items</p>
            <Button 
              onClick={() => setShowAuthModal(true)}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <LogIn size={20} style={{ marginRight: '8px' }} />
              Log into My Account
            </Button>
          </CardContent>
        </Card>

        <UserAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // User is authenticated
  if (cartLoading) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft size={20} /> Back
          </Button>
          <h1 className="cart-title">
            <ShoppingCart size={28} /> My Cart
          </h1>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  const selectedCount = cart.filter(item => item.is_selected).length;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back
        </Button>
        <h1 className="cart-title">
          <ShoppingCart size={28} /> My Cart ({cart.length})
        </h1>
      </div>

      {cart.length === 0 ? (
        <Card className="empty-cart">
          <CardContent className="empty-cart-content">
            <ShoppingCart size={64} className="empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Add some items to get started</p>
            <Button onClick={() => navigate('/')}>Browse Products</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <Card key={item.id} className="cart-item">
                <CardContent className="cart-item-content" style={{ display: 'flex', gap: '16px', padding: '16px', alignItems: 'center' }}>
                  <Checkbox
                    checked={item.is_selected || false}
                    onCheckedChange={() => handleToggleSelection(item.id)}
                    className="cart-checkbox"
                    data-testid={`checkbox-${item.id}`}
                  />
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                    onClick={() => navigate(`/product/${item.product_id}`)}
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    data-testid={`item-image-${item.id}`}
                  />
                  <div className="cart-item-details" style={{ flex: 1 }}>
                    <h3 
                      onClick={() => navigate(`/product/${item.product_id}`)}
                      style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        marginBottom: '8px',
                        cursor: 'pointer',
                        color: '#1f2937'
                      }}
                      data-testid={`item-name-${item.id}`}
                    >
                      {item.name}
                    </h3>
                    <p className="item-description" style={{ color: '#6b7280', marginBottom: '8px', fontSize: '14px' }}>
                      {item.short_description}
                    </p>
                    <p className="item-price" style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                      ₹{item.price}
                    </p>
                    <div className="item-selections" style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#4b5563' }}>
                      <span><strong>Size:</strong> {item.selected_size}</span>
                      <span><strong>Color:</strong> {item.selected_color}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                    data-testid={`remove-btn-${item.id}`}
                  >
                    <Trash2 size={20} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedCount > 0 && (
            <div className="enquiry-footer" style={{ 
              position: 'fixed',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
              <Button
                onClick={handleWhatsAppEnquiry}
                className="enquiry-btn"
                disabled={loading}
                data-testid="enquire-whatsapp-btn"
                style={{
                  background: '#25D366',
                  color: 'white',
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <MessageCircle size={20} />
                {loading ? 'Processing...' : `Enquire on WhatsApp (${selectedCount} ${selectedCount === 1 ? 'item' : 'items'})`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
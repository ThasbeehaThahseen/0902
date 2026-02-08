import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, User, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import './ReviewsPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', review: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!newReview.name || !newReview.review) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(`${API}/reviews/public`, newReview);
      
      toast({
        title: 'Success!',
        description: response.data.message
      });

      setNewReview({ name: '', review: '' });
      setDialogOpen(false);
      fetchReviews();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={20}
        className={index < rating ? 'star-filled' : 'star-empty'}
        fill={index < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className="reviews-page" data-testid="reviews-page">
      <div className="page-header">
        <Button variant="ghost" onClick={() => navigate('/')} className="back-btn" data-testid="back-btn">
          <ArrowLeft size={20} /> Back to Home
        </Button>
        <h1 className="page-title" data-testid="page-title">Customer Reviews</h1>
        <p className="page-subtitle">What our customers say about us</p>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="add-review-btn">
              <Plus size={20} /> Add My Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Experience</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <Input
                  id="name"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="review">Your Review</label>
                <Textarea
                  id="review"
                  value={newReview.review}
                  onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                  placeholder="Share your experience..."
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="submit-review-btn">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="loading-state">Loading reviews...</div>
      ) : (
        <div className="reviews-container">
          {reviews.map(review => (
            <Card key={review.id} className="review-card" data-testid={`review-card-${review.id}`}>
              <CardContent className="review-content">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="reviewer-name">{review.name}</h3>
                      <p className="review-location">{review.location}</p>
                    </div>
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                  <span className="review-date">{review.date}</span>
                </div>
                <p className="review-text">{review.review}</p>
              </CardContent>
            </Card>
          ))}

          {reviews.length === 0 && (
            <Card className="empty-reviews">
              <CardContent>
                <p>No reviews yet. Be the first to share your experience!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
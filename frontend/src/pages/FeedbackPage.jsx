import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import './FeedbackPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const FeedbackPage = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !message) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/feedback`, { name, message });
      
      toast({
        title: 'Success!',
        description: response.data.message
      });

      window.open(response.data.whatsapp_url, '_blank');

      setName('');
      setMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back
        </Button>
      </div>

      <Card className="feedback-card">
        <CardHeader>
          <CardTitle className="feedback-title">
            <MessageSquare size={28} />
            Give Us Your Feedback
          </CardTitle>
          <p className="feedback-subtitle">We value your opinion and would love to hear from you!</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Your Name</label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message" className="form-label">Your Feedback</label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts, suggestions, or concerns..."
                rows={6}
                required
              />
            </div>
            <Button type="submit" className="submit-btn" disabled={loading}>
              <Send size={20} />
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
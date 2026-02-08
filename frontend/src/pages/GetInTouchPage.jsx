import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { MapPin, Phone, Instagram, Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import './GetInTouchPage.css';

export const GetInTouchPage = () => {
  const navigate = useNavigate();

  return (
    <div className="get-in-touch-page">
      <div className="page-header">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back
        </Button>
        <h1 className="page-title">Get In Touch</h1>
      </div>

      <div className="contact-grid">
        <Card className="contact-card">
          <CardContent className="contact-card-content">
            <div className="contact-icon-wrapper">
              <MapPin className="contact-icon" />
            </div>
            <h3 className="contact-label">Visit Us</h3>
            <p className="contact-info">
              Milan Readymades<br />
              Vadapalani, Chennai<br />
              Tamil Nadu, India
            </p>
          </CardContent>
        </Card>

        <Card className="contact-card">
          <CardContent className="contact-card-content">
            <div className="contact-icon-wrapper">
              <Phone className="contact-icon" />
            </div>
            <h3 className="contact-label">Call Us</h3>
            <a href="tel:+918072153196" className="contact-link">
              +91 80721 53196
            </a>
            <a
              href="https://wa.me/918072153196"
              className="contact-link whatsapp-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} /> WhatsApp Us
            </a>
          </CardContent>
        </Card>

        <Card className="contact-card">
          <CardContent className="contact-card-content">
            <div className="contact-icon-wrapper">
              <Instagram className="contact-icon" />
            </div>
            <h3 className="contact-label">Follow Us</h3>
            <a
              href="https://instagram.com/milanreadymades"
              className="contact-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              @milanreadymades
            </a>
          </CardContent>
        </Card>

        <Card className="contact-card">
          <CardContent className="contact-card-content">
            <div className="contact-icon-wrapper">
              <Mail className="contact-icon" />
            </div>
            <h3 className="contact-label">Email Us</h3>
            <a href="mailto:info@milanreadymades.com" className="contact-link">
              info@milanreadymades.com
            </a>
          </CardContent>
        </Card>
      </div>

      <Card className="map-card">
        <CardContent className="map-content">
          <h3 className="map-title">Our Location</h3>
          <div className="map-placeholder">
            <div className="map-text">
              <MapPin size={48} className="map-icon" />
              <p>Vadapalani, Chennai</p>
              <p className="map-note">Visit us for the best traditional and contemporary fashion!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
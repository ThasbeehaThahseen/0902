import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Instagram, Clock, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import './AboutPage.css';

export const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page" data-testid="about-page">
      <div className="page-header">
        <Button variant="ghost" onClick={() => navigate('/')} className="back-btn" data-testid="back-btn">
          <ArrowLeft size={20} /> Back to Home
        </Button>
        <h1 className="page-title" data-testid="page-title">About Milan Readymades</h1>
        <p className="page-subtitle">Your trusted fashion destination in Vadapalani</p>
      </div>

      <div className="about-container">
        {/* Story Section */}
        <section className="story-section">
          <Card className="story-card">
            <CardContent className="story-content">
              <h2 className="section-title">Our Story</h2>
              <p className="story-text">
                Established in the heart of Vadapalani, Chennai, Milan Readymades has been serving the community with 
                exquisite traditional and contemporary clothing for over years. We pride ourselves on offering 
                premium quality garments for men, women, and children, carefully curated to meet the diverse fashion 
                needs of our valued customers.
              </p>
              <p className="story-text">
                Our collection ranges from elegant traditional wear including sarees, kurtas, and ethnic ensembles to 
                modern western outfits. Every piece in our store is selected with attention to quality, style, and 
                affordability. Visit us to experience personalized service and discover fashion that celebrates your 
                unique style.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <h2 className="section-title">Why Choose Us</h2>
          <div className="values-grid">
            <Card className="value-card">
              <CardContent className="value-content">
                <div className="value-icon">
                  <Award size={40} />
                </div>
                <h3 className="value-title">Premium Quality</h3>
                <p className="value-text">
                  We source only the finest fabrics and materials to ensure every garment meets our high standards of quality.
                </p>
              </CardContent>
            </Card>

            <Card className="value-card">
              <CardContent className="value-content">
                <div className="value-icon">
                  <Clock size={40} />
                </div>
                <h3 className="value-title">Years of Experience</h3>
                <p className="value-text">
                  With years of experience in the fashion industry, we understand what our customers need and love.
                </p>
              </CardContent>
            </Card>

            <Card className="value-card">
              <CardContent className="value-content">
                <div className="value-icon">
                  <MapPin size={40} />
                </div>
                <h3 className="value-title">Prime Location</h3>
                <p className="value-text">
                  Conveniently located in Vadapalani, making it easy for customers across Chennai to visit us.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Info */}
        <section className="contact-info-section">
          <h2 className="section-title">Visit Us Today</h2>
          <div className="contact-info-grid">
            <div className="contact-info-item">
              <MapPin size={24} className="contact-icon" />
              <div>
                <h4>Address</h4>
                <p>Milan Readymades, Vadapalani<br />Chennai, Tamil Nadu, India</p>
              </div>
            </div>

            <div className="contact-info-item">
              <Phone size={24} className="contact-icon" />
              <div>
                <h4>Phone</h4>
                <p>+91 80721 53196</p>
              </div>
            </div>

            <div className="contact-info-item">
              <Mail size={24} className="contact-icon" />
              <div>
                <h4>Email</h4>
                <p>info@milanreadymades.com</p>
              </div>
            </div>

            <div className="contact-info-item">
              <Instagram size={24} className="contact-icon" />
              <div>
                <h4>Instagram</h4>
                <p>@milanreadymades</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
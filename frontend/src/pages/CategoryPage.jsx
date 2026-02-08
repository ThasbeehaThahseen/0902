import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, BookOpen, Shirt, Briefcase, Wind, Package, User, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { categories } from '../data/mockData';
import './CategoryPage.css';

// Icon mapping
const iconMap = {
  BookOpen,
  Shirt,
  Briefcase,
  Wind,
  Package,
  User,
  Users
};

export const CategoryPage = () => {
  const { gender } = useParams();
  const navigate = useNavigate();

  const genderCategories = categories[gender] || [];

  const genderTitles = {
    men: "Men's Collection",
    women: "Women's Collection",
    kids: "Kids Collection"
  };

  // For kids, first show gender selection
  if (gender === 'kids') {
    return (
      <div className="category-page">
        <div className="page-header">
          <Button variant="ghost" onClick={() => navigate('/')} className="back-btn">
            <ArrowLeft size={20} /> Back to Home
          </Button>
          <h1 className="page-title">{genderTitles[gender]}</h1>
          <p className="page-subtitle">Choose the category for your child</p>
        </div>

        {/* Kids Gender Selection */}
        <section className="kids-gender-section">
          <h2 className="section-heading">Select Child's Gender</h2>
          <div className="kids-gender-grid">
            <Card className="kids-gender-card" onClick={() => navigate('/category/kids/boy')}>
              <CardContent className="kids-gender-content">
                <div className="kids-icon-svg">
                  <User size={80} strokeWidth={1.5} />
                </div>
                <h3>Boy</h3>
                <p>Traditional, Casual, Party & Night Wears</p>
                <Button variant="ghost" className="select-btn">
                  Select <ChevronRight size={18} />
                </Button>
              </CardContent>
            </Card>

            <Card className="kids-gender-card" onClick={() => navigate('/category/kids/girl')}>
              <CardContent className="kids-gender-content">
                <div className="kids-icon-svg">
                  <Users size={80} strokeWidth={1.5} />
                </div>
                <h3>Girl</h3>
                <p>Traditional, Casual, Party & Night Wears</p>
                <Button variant="ghost" className="select-btn">
                  Select <ChevronRight size={18} />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="page-header">
        <Button variant="ghost" onClick={() => navigate('/')} className="back-btn">
          <ArrowLeft size={20} /> Back to Home
        </Button>
        <h1 className="page-title">{genderTitles[gender]}</h1>
        <p className="page-subtitle">Select a category to view our collection</p>
      </div>

      <section className="categories-section">
        <div className="categories-grid">
          {genderCategories.map(category => {
            const IconComponent = category.icon ? iconMap[category.icon] : null;
            
            return (
              <Card 
                key={category.id} 
                className="category-card"
                onClick={() => navigate(`/products/${gender}/${category.id}`)}
              >
                <CardContent className="category-card-content">
                  {IconComponent && (
                    <div className="category-icon-svg">
                      <IconComponent size={56} strokeWidth={1.5} />
                    </div>
                  )}
                  <h3 className="category-name">{category.name}</h3>
                  {category.description && (
                    <p className="category-description">{category.description}</p>
                  )}
                  <Button variant="ghost" className="view-btn">
                    View Collection <ChevronRight size={18} />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
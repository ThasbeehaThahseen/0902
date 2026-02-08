import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import './OwnerSectionPage.css';

export const OwnerSectionPage = () => {
  const navigate = useNavigate();
  const { section } = useParams(); // men, women, kids, accessories
  const { isAuthenticated, loading } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    loadCategories();
  }, [section]);

  const loadCategories = () => {
    const categoryMap = {
      men: [
        { id: 'traditional', name: 'Traditional Wear' },
        { id: 'shirts', name: 'Shirts' },
        { id: 'pants', name: 'Pants' },
        { id: 'inner-wears', name: 'Inner Wears' }
      ],
      women: [
        { id: 'traditional', name: 'Traditional' },
        { id: 'ethnic', name: 'Ethnic' },
        { id: 'western', name: 'Western Wears' },
        { id: 'bottomwear', name: 'Bottom Wears' },
        { id: 'casual', name: 'Casual Wears' },
        { id: 'inner-wears', name: 'Inner Wears' }
      ],
      kids: [
        { id: 'boys-0-3', name: 'Boys (0-3 years)', ageGroup: '0-3', gender: 'boy' },
        { id: 'boys-4-7', name: 'Boys (4-7 years)', ageGroup: '4-7', gender: 'boy' },
        { id: 'boys-8-11', name: 'Boys (8-11 years)', ageGroup: '8-11', gender: 'boy' },
        { id: 'boys-12-15', name: 'Boys (12-15 years)', ageGroup: '12-15', gender: 'boy' },
        { id: 'girls-0-3', name: 'Girls (0-3 years)', ageGroup: '0-3', gender: 'girl' },
        { id: 'girls-4-7', name: 'Girls (4-7 years)', ageGroup: '4-7', gender: 'girl' },
        { id: 'girls-8-11', name: 'Girls (8-11 years)', ageGroup: '8-11', gender: 'girl' },
        { id: 'girls-12-15', name: 'Girls (12-15 years)', ageGroup: '12-15', gender: 'girl' }
      ],
      accessories: [
        { id: 'belts', name: 'Belts' },
        { id: 'towels', name: 'Towels' },
        { id: 'handkerchiefs', name: 'Handkerchiefs' },
        { id: 'others', name: 'Others' }
      ]
    };

    setCategories(categoryMap[section] || []);
  };

  const handleCategoryClick = (category) => {
    if (section === 'kids') {
      navigate(`/owner/products/${section}/${category.ageGroup}/${category.gender}`);
    } else if (section === 'accessories') {
      navigate(`/owner/products/${section}/${category.id}`);
    } else {
      navigate(`/owner/products/${section}/${category.id}`);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const sectionTitles = {
    men: "Men's Section",
    women: "Women's Section",
    kids: "Kids Section",
    accessories: "Accessories Section"
  };

  return (
    <div className="owner-section-page">
      <header className="section-header">
        <Button variant="outline" onClick={() => navigate('/owner/dashboard')} data-testid="back-to-dashboard-btn">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Button>
        <div className="section-header-content">
          <h1>{sectionTitles[section] || 'Section'}</h1>
          <p>Select a category to view and manage products</p>
        </div>
      </header>

      <div className="section-content">
        <div className="categories-grid">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category)}
              data-testid={`category-card-${category.id}`}
            >
              <CardContent className="category-card-content">
                <h3>{category.name}</h3>
                {category.subcategories && (
                  <p className="subcategories">
                    {category.subcategories.join(', ')}
                  </p>
                )}
                <Button variant="ghost" className="view-btn">
                  {category.directToAdd ? 'Add Product →' : 'View Products →'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

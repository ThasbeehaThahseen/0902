import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, BookOpen, Home, Sparkles, Moon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { categories, kidsAgeGroups } from '../data/mockData';
import './KidsCategoryPage.css';

// Icon mapping
const iconMap = {
  BookOpen,
  Home,
  Sparkles,
  Moon
};

export const KidsCategoryPage = () => {
  const { kidsGender } = useParams();
  const navigate = useNavigate();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');

  const kidsCategories = categories.kids || [];

  return (
    <div className="kids-category-page" data-testid="kids-category-page">
      <div className="page-header">
        <Button variant="ghost" onClick={() => navigate('/category/kids')} className="back-btn" data-testid="back-btn">
          <ArrowLeft size={20} /> Back
        </Button>
        <h1 className="page-title">
          {kidsGender === 'boy' ? "Boys' Collection" : "Girls' Collection"}
        </h1>
        <p className="page-subtitle">Select age group to view available styles</p>
      </div>

      {/* Age Group Selection */}
      <section className="age-group-section">
        <div className="age-group-selector">
          <label htmlFor="age-group" className="age-group-label">
            Select Age Group:
          </label>
          <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
            <SelectTrigger className="age-group-trigger" data-testid="age-group-select">
              <SelectValue placeholder="Choose age range" />
            </SelectTrigger>
            <SelectContent>
              {kidsAgeGroups.map(group => (
                <SelectItem key={group.id} value={group.id} data-testid={`age-group-${group.id}`}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Categories Section - Only show if age group is selected */}
      {selectedAgeGroup && (
        <section className="categories-section">
          <h2 className="categories-title">Choose Category</h2>
          <div className="categories-grid">
            {kidsCategories.map(category => {
              const IconComponent = category.icon ? iconMap[category.icon] : null;
              
              return (
                <Card 
                  key={category.id} 
                  className="category-card"
                  onClick={() => navigate(`/products/kids/${category.id}/${kidsGender}?ageGroup=${selectedAgeGroup}`)}
                  data-testid={`category-${category.id}`}
                >
                  <CardContent className="category-card-content">
                    {IconComponent && (
                      <div className="category-icon-svg">
                        <IconComponent size={56} strokeWidth={1.5} />
                      </div>
                    )}
                    <h3 className="category-name">{category.name}</h3>
                    <Button variant="ghost" className="view-btn">
                      View Collection <ChevronRight size={18} />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Message when no age group is selected */}
      {!selectedAgeGroup && (
        <div className="no-selection-message">
          <p>Please select an age group to view available collections</p>
        </div>
      )}
    </div>
  );
};
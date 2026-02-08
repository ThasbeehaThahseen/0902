import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Shirt, Layers, Baby, Package, LogOut, Home, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import './OwnerDashboardPage.css';

export const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout } = useAuth();
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

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
      { id: 'western-wears', name: 'Western Wears' },
      { id: 'bottom-wears', name: 'Bottom Wears' },
      { id: 'casual-wears', name: 'Casual Wears' },
      { id: 'inner-wears', name: 'Inner Wears' }
    ],
    accessories: [
      { id: 'belts', name: 'Belts' },
      { id: 'towels', name: 'Towels' },
      { id: 'kerchief', name: 'Kerchief' },
      { id: 'others', name: 'Others' }
    ]
  };

  const kidsGenderOptions = [
    { id: 'boy', name: 'Boy' },
    { id: 'girl', name: 'Girl' }
  ];

  const kidsAgeGroups = [
    { id: '0-3', name: '0-3 years' },
    { id: '4-7', name: '4-7 years' },
    { id: '8-11', name: '8-11 years' },
    { id: '12-15', name: '12-15 years' }
  ];

  const kidsSubcategories = [
    { id: 'traditional', name: 'Traditional' },
    { id: 'party', name: 'Party Wears' },
    { id: 'casual', name: 'Casual Wears' },
    { id: 'nightwear', name: 'Night Wears' }
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddItem = () => {
    setShowAddItemDialog(true);
    setSelectedSection('');
    setSelectedCategory('');
    setSelectedGender('');
    setSelectedAgeGroup('');
    setSelectedSubcategory('');
  };

  const handleProceedToAddProduct = () => {
    // For kids section: need gender, age group, and subcategory
    if (selectedSection === 'kids') {
      if (!selectedGender || !selectedAgeGroup || !selectedSubcategory) return;
      navigate(`/owner/add-product/${selectedSection}/${selectedAgeGroup}/${selectedGender}/${selectedSubcategory}`);
    } else {
      // For other sections: need category
      if (!selectedCategory) return;
      navigate(`/owner/add-product/${selectedSection}/${selectedCategory}`);
    }
    
    setShowAddItemDialog(false);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="owner-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Owner Dashboard</h1>
          <p className="dashboard-subtitle">Milan Readymades Management</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={() => navigate('/')} data-testid="view-website-btn">
            <Home size={18} />
            View Website
          </Button>
          <Button variant="destructive" onClick={handleLogout} data-testid="logout-btn">
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="section-intro">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2>Select a Section to Manage</h2>
              <p>Choose a category below to view and manage products</p>
            </div>
            <Button onClick={handleAddItem} data-testid="add-item-btn" size="lg">
              <Plus size={20} style={{ marginRight: '8px' }} />
              Add Item
            </Button>
          </div>
        </section>

        <div className="sections-grid">
          <Card 
            className="section-card" 
            onClick={() => navigate('/owner/section/men')}
            data-testid="men-section-card"
          >
            <CardContent className="section-card-content">
              <div className="section-icon">
                <Shirt size={64} strokeWidth={1.5} />
              </div>
              <h3>Men's Section</h3>
              <p>Manage men's traditional and contemporary wear</p>
              <Button variant="ghost" className="manage-btn">
                Manage Products →
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="section-card" 
            onClick={() => navigate('/owner/section/women')}
            data-testid="women-section-card"
          >
            <CardContent className="section-card-content">
              <div className="section-icon">
                <Layers size={64} strokeWidth={1.5} />
              </div>
              <h3>Women's Section</h3>
              <p>Manage sarees, ethnic and western wear</p>
              <Button variant="ghost" className="manage-btn">
                Manage Products →
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="section-card" 
            onClick={() => navigate('/owner/section/kids')}
            data-testid="kids-section-card"
          >
            <CardContent className="section-card-content">
              <div className="section-icon">
                <Baby size={64} strokeWidth={1.5} />
              </div>
              <h3>Kids Section</h3>
              <p>Manage kids traditional, casual and party wear</p>
              <Button variant="ghost" className="manage-btn">
                Manage Products →
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="section-card" 
            onClick={() => navigate('/owner/section/accessories')}
            data-testid="accessories-section-card"
          >
            <CardContent className="section-card-content">
              <div className="section-icon">
                <Package size={64} strokeWidth={1.5} />
              </div>
              <h3>Accessories Section</h3>
              <p>Manage belts, towels, kerchief and more</p>
              <Button variant="ghost" className="manage-btn">
                Manage Products →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              {selectedSection === 'kids' 
                ? 'Select gender, age group, and subcategory for the new product'
                : 'Select a section and category for the new product'}
            </DialogDescription>
          </DialogHeader>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Section</label>
              <Select value={selectedSection} onValueChange={(value) => {
                setSelectedSection(value);
                setSelectedCategory('');
                setSelectedGender('');
                setSelectedAgeGroup('');
                setSelectedSubcategory('');
              }}>
                <SelectTrigger data-testid="section-select">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men's Section</SelectItem>
                  <SelectItem value="women">Women's Section</SelectItem>
                  <SelectItem value="kids">Kids Section</SelectItem>
                  <SelectItem value="accessories">Accessories Section</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedSection === 'kids' ? (
              <>
                {/* Kids Section: Gender Selection */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Gender</label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger data-testid="gender-select">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {kidsGenderOptions.map((gender) => (
                        <SelectItem key={gender.id} value={gender.id}>
                          {gender.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Kids Section: Age Group Selection */}
                {selectedGender && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Age Group</label>
                    <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                      <SelectTrigger data-testid="age-group-select">
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        {kidsAgeGroups.map((ageGroup) => (
                          <SelectItem key={ageGroup.id} value={ageGroup.id}>
                            {ageGroup.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Kids Section: Subcategory Selection */}
                {selectedAgeGroup && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Subcategory</label>
                    <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                      <SelectTrigger data-testid="subcategory-select">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {kidsSubcategories.map((subcat) => (
                          <SelectItem key={subcat.id} value={subcat.id}>
                            {subcat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            ) : (
              /* Other Sections: Category Selection */
              selectedSection && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger data-testid="category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryMap[selectedSection]?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            )}

            <Button 
              onClick={handleProceedToAddProduct} 
              disabled={
                selectedSection === 'kids' 
                  ? (!selectedGender || !selectedAgeGroup || !selectedSubcategory)
                  : (!selectedSection || !selectedCategory)
              }
              data-testid="proceed-add-product-btn"
            >
              Proceed to Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

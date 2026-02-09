import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Upload, X, Check, Edit2 } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import './AddProductPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STEPS = [
  'Upload Images',
  'Fabric Selection',
  'Available Colours',
  'Other Colors',
  'Sizes',
  'Item Details',
  'Detailed Description',
  'Price',
  'Fresh Arrival Tag',
  'Show in Fresh Arrivals',
  'Preview'
];

const SUBCATEGORY_MAP = {
  men: {
    traditional: ['Kurtas', 'Dhotis', 'Sherwanis'],
    shirts: ['Formal', 'Casual', 'Party'],
    pants: ['Formal', 'Casual', 'Jeans'],
    tshirts: ['Plain', 'Printed', 'Polo']
  },
  women: {
    sarees: ['Silk', 'Cotton', 'Designer'],
    salwar: ['Traditional', 'Modern', 'Party'],
    tops: ['Casual', 'Ethnic', 'Western'],
    leggings: ['Plain', 'Printed', 'Palazzo']
  }
};

const KIDS_SUBCATEGORIES = ['Traditional', 'Casual', 'Party', 'Ethnic', 'Western'];

export const AddProductPage = () => {
  const navigate = useNavigate();
  const { section, category, ageGroup, gender } = useParams();
  const { isAuthenticated, loading, token } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [editingFromPreview, setEditingFromPreview] = useState(false);
  const [formData, setFormData] = useState({
    images: [],
    imageColors: [], // Array to store color per image: [{ imageIndex: 0, color: "Red" }]
    imageSizes: [], // Array to store sizes per image: [{ imageIndex: 0, sizes: ["M", "L"] }]
    fabric: '',
    customFabric: '',
    hasOtherColors: false,
    availableColors: [],
    sizes: [],
    itemName: '',
    shortDescription: '',
    detailedDescription: '',
    price: 0,
    isFreshArrivalTag: false,
    showInFreshArrivals: false,
    category: section,
    subcategory: category || '',
    gender: gender || '',
    ageGroup: ageGroup || ''
  });

  const [fabrics, setFabrics] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizeOptions, setSizeOptions] = useState({ letters: [], numbers: [] });
  const [detectedColor, setDetectedColor] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [detectingColor, setDetectingColor] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [detectingColorForImage, setDetectingColorForImage] = useState(null);
  const [colorSearchTerm, setColorSearchTerm] = useState('');
  const [otherColorsSearchTerm, setOtherColorsSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMetadata();
    }
  }, [isAuthenticated]);

  const loadMetadata = async () => {
    try {
      const [fabricsRes, colorsRes, sizesRes] = await Promise.all([
        axios.get(`${API}/metadata/all-fabrics`),
        axios.get(`${API}/metadata/colors`),
        axios.get(`${API}/metadata/sizes`)
      ]);

      setFabrics(fabricsRes.data.fabrics);
      setColors(colorsRes.data.colors);
      setSizeOptions(sizesRes.data);
    } catch (error) {
      console.error('Error loading metadata:', error);
      toast({
        title: 'Error',
        description: 'Failed to load form data',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      toast({
        title: 'Too many images',
        description: 'You can upload maximum 10 images',
        variant: 'destructive'
      });
      return;
    }

    try {
      const uploadedImages = [];
      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await axios.post(`${API}/upload-image`, formDataUpload, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        uploadedImages.push({
          url: response.data.image_url,
          base64: response.data.image_base64,
          is_primary: formData.images.length === 0 && uploadedImages.length === 0
        });
      }

      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedImages]
      });

      toast({
        title: 'Success',
        description: 'Images uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive'
      });
    }
  };

  const handleCameraCapture = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      toast({
        title: 'Too many images',
        description: 'You can upload maximum 10 images',
        variant: 'destructive'
      });
      return;
    }

    try {
      const uploadedImages = [];
      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await axios.post(`${API}/upload-image`, formDataUpload, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        uploadedImages.push({
          url: response.data.image_url,
          base64: response.data.image_base64,
          is_primary: formData.images.length === 0 && uploadedImages.length === 0
        });
      }

      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedImages]
      });

      toast({
        title: 'Success',
        description: 'Images captured successfully'
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive'
      });
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    // If removing the primary image, make the first one primary
    if (formData.images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    setFormData({ ...formData, images: newImages });
  };

  const makePrimaryImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setFormData({ ...formData, images: newImages });
  };

  const detectColorFromImage = async () => {
    if (formData.images.length === 0) {
      toast({
        title: 'No images',
        description: 'Please upload at least one image first',
        variant: 'destructive'
      });
      return;
    }

    try {
      setDetectingColor(true);
      const primaryImage = formData.images.find(img => img.is_primary) || formData.images[0];
      
      const formDataColor = new FormData();
      formDataColor.append('image_base64', primaryImage.base64);

      const response = await axios.post(`${API}/detect-color`, formDataColor, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDetectedColor(response.data.primary_color);
      
      toast({
        title: 'Color Detected',
        description: `Color detected as: ${response.data.primary_color}`
      });
    } catch (error) {
      console.error('Error detecting color:', error);
      toast({
        title: 'Error',
        description: 'Failed to detect color',
        variant: 'destructive'
      });
    } finally {
      setDetectingColor(false);
    }
  };

  const detectColorForSpecificImage = async (imageIndex) => {
    if (!formData.images[imageIndex]) {
      toast({
        title: 'Error',
        description: 'Image not found',
        variant: 'destructive'
      });
      return;
    }

    try {
      setDetectingColorForImage(imageIndex);
      const image = formData.images[imageIndex];
      
      const formDataColor = new FormData();
      formDataColor.append('image_base64', image.base64);

      const response = await axios.post(`${API}/detect-color`, formDataColor, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const detectedColor = response.data.primary_color;
      
      // Update imageColors array
      const newImageColors = [...formData.imageColors];
      const existingIndex = newImageColors.findIndex(ic => ic.imageIndex === imageIndex);
      
      if (existingIndex >= 0) {
        newImageColors[existingIndex] = { imageIndex, color: detectedColor };
      } else {
        newImageColors.push({ imageIndex, color: detectedColor });
      }
      
      setFormData({ ...formData, imageColors: newImageColors });
      
      toast({
        title: 'Color Detected',
        description: `Color detected as: ${detectedColor}`
      });
    } catch (error) {
      console.error('Error detecting color:', error);
      toast({
        title: 'Error',
        description: 'Failed to detect color',
        variant: 'destructive'
      });
    } finally {
      setDetectingColorForImage(null);
    }
  };

  const setColorForImage = (imageIndex, color) => {
    const newImageColors = [...formData.imageColors];
    const existingIndex = newImageColors.findIndex(ic => ic.imageIndex === imageIndex);
    
    if (existingIndex >= 0) {
      newImageColors[existingIndex] = { imageIndex, color };
    } else {
      newImageColors.push({ imageIndex, color });
    }
    
    setFormData({ ...formData, imageColors: newImageColors });
  };

  const getColorForImage = (imageIndex) => {
    const colorData = formData.imageColors.find(ic => ic.imageIndex === imageIndex);
    return colorData ? colorData.color : '';
  };

  const navigateImage = (direction) => {
    if (direction === 'prev' && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (direction === 'next' && currentImageIndex < formData.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const toggleColor = (color) => {
    const newColors = formData.availableColors.includes(color)
      ? formData.availableColors.filter(c => c !== color)
      : [...formData.availableColors, color];
    setFormData({ ...formData, availableColors: newColors });
  };

  const toggleSize = (size) => {
    const newSizes = formData.sizes.includes(size)
      ? formData.sizes.filter(s => s !== size)
      : [...formData.sizes, size];
    setFormData({ ...formData, sizes: newSizes });
  };

  const toggleSizeForImage = (imageIndex, size) => {
    const newImageSizes = [...formData.imageSizes];
    const existingIndex = newImageSizes.findIndex(is => is.imageIndex === imageIndex);
    
    if (existingIndex >= 0) {
      const currentSizes = newImageSizes[existingIndex].sizes;
      const updatedSizes = currentSizes.includes(size)
        ? currentSizes.filter(s => s !== size)
        : [...currentSizes, size];
      
      newImageSizes[existingIndex] = { imageIndex, sizes: updatedSizes };
    } else {
      newImageSizes.push({ imageIndex, sizes: [size] });
    }
    
    setFormData({ ...formData, imageSizes: newImageSizes });
  };

  const getSizesForImage = (imageIndex) => {
    const sizeData = formData.imageSizes.find(is => is.imageIndex === imageIndex);
    return sizeData ? sizeData.sizes : [];
  };

  const generateDescription = async () => {
    if (!formData.itemName || !formData.shortDescription) {
      toast({
        title: 'Missing Information',
        description: 'Please provide item name and short description first',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGeneratingDescription(true);
      const formDataDesc = new FormData();
      formDataDesc.append('item_name', formData.itemName);
      formDataDesc.append('short_description', formData.shortDescription);
      formDataDesc.append('category', formData.category);
      formDataDesc.append('subcategory', formData.subcategory);
      formDataDesc.append('fabric', formData.fabric);

      const response = await axios.post(`${API}/generate-description`, formDataDesc, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData({ ...formData, detailedDescription: response.data.detailed_description });
      
      toast({
        title: 'Success',
        description: 'Description generated successfully'
      });
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate description',
        variant: 'destructive'
      });
    } finally {
      setGeneratingDescription(false);
    }
  };

  const addCustomFabric = async () => {
    if (!formData.customFabric.trim()) {
      toast({
        title: 'Invalid input',
        description: 'Please enter a fabric name',
        variant: 'destructive'
      });
      return;
    }

    try {
      const formDataFabric = new FormData();
      formDataFabric.append('fabric_name', formData.customFabric);

      await axios.post(`${API}/metadata/fabrics`, formDataFabric, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFabrics([...fabrics, formData.customFabric].sort());
      setFormData({ ...formData, fabric: formData.customFabric, customFabric: '' });
      
      toast({
        title: 'Success',
        description: 'Custom fabric added successfully'
      });
    } catch (error) {
      console.error('Error adding custom fabric:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to add custom fabric',
        variant: 'destructive'
      });
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: // Images
        return formData.images.length >= 2;
      case 1: // Fabric
        return formData.fabric !== '';
      case 2: // Available Colours (formerly Primary Color) - ONLY first image is mandatory
        // At least the first image must have a color
        if (formData.images.length === 0) return false;
        const firstImageColor = formData.imageColors.find(ic => ic.imageIndex === 0);
        return firstImageColor && firstImageColor.color;
      case 3: // Other Colors
        return true; // Optional step
      case 4: // Sizes - ONLY first image is mandatory
        // At least the first image must have sizes
        if (formData.images.length === 0) return false;
        const firstImageSizes = formData.imageSizes.find(is => is.imageIndex === 0);
        return firstImageSizes && firstImageSizes.sizes.length > 0;
      case 5: // Item Details
        return formData.itemName && formData.shortDescription;
      case 6: // Detailed Description
        return formData.detailedDescription !== '';
      case 7: // Price
        return formData.price > 0;
      case 8: // Fresh Arrival Tag
        return true;
      case 9: // Show in Fresh Arrivals
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep === 6 && !formData.detailedDescription) {
      generateDescription();
    }
    if (canProceedToNextStep()) {
      // If editing from preview, return to preview (step 10)
      if (editingFromPreview) {
        setCurrentStep(10);
        setEditingFromPreview(false);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: 'Incomplete',
        description: 'Please complete the current step before proceeding',
        variant: 'destructive'
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // If editing from preview, return to preview instead of previous step
      if (editingFromPreview) {
        setCurrentStep(10);
        setEditingFromPreview(false);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleEditFromPreview = (stepNumber) => {
    setEditingFromPreview(true);
    setCurrentStep(stepNumber);
  };

  const handlePublish = async () => {
    try {
      // Aggregate all unique sizes from all images
      const allSizes = new Set();
      formData.imageSizes.forEach(is => {
        is.sizes.forEach(size => allSizes.add(size));
      });

      const productData = {
        name: formData.itemName,
        short_description: formData.shortDescription,
        description: formData.detailedDescription,
        category: formData.category,
        subcategory: formData.subcategory,
        gender: formData.gender,
        age_group: formData.ageGroup,
        fabric: formData.fabric,
        primary_color: formData.primaryColor,
        available_colors: formData.availableColors,
        sizes: Array.from(allSizes), // Aggregated sizes
        price: formData.price,
        is_new_arrival: formData.isFreshArrivalTag,
        show_in_fresh_arrivals: formData.showInFreshArrivals
      };

      const response = await axios.post(`${API}/products`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add images to the product with their colors
      const productId = response.data.id;
      for (let i = 0; i < formData.images.length; i++) {
        const image = formData.images[i];
        const colorData = formData.imageColors.find(ic => ic.imageIndex === i);
        const sizesData = formData.imageSizes.find(is => is.imageIndex === i);
        const imageFormData = new FormData();
        const blob = await fetch(image.url).then(r => r.blob());
        imageFormData.append('file', blob, 'image.jpg');
        imageFormData.append('is_primary', image.is_primary);
        if (colorData && colorData.color) {
          imageFormData.append('color', colorData.color);
        }
        if (sizesData && sizesData.sizes.length > 0) {
          imageFormData.append('sizes', sizesData.sizes.join(','));
        }

        await axios.post(`${API}/products/${productId}/add-image`, imageFormData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast({
        title: 'Success',
        description: 'Product published successfully!'
      });

      // Navigate back to products page
      if (section === 'kids' && ageGroup && gender && category) {
        navigate(`/owner/products/${section}/${ageGroup}/${gender}/${category}`);
      } else if (section === 'kids' && ageGroup && gender) {
        navigate(`/owner/products/${section}/${ageGroup}/${gender}`);
      } else {
        navigate(`/owner/products/${section}/${category}`);
      }
    } catch (error) {
      console.error('Error publishing product:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish product',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="add-product-page">
      <header className="add-product-header">
        <Button variant="outline" onClick={() => navigate(-1)} data-testid="back-btn">
          <ArrowLeft size={18} />
          Back
        </Button>
        <div className="header-content">
          <h1>Add New Product</h1>
          <p>Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}</p>
        </div>
      </header>

      <div className="add-product-content">
        <div className="progress-steps">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-number">
                {index < currentStep ? <Check size={16} /> : index + 1}
              </div>
              <div className="step-label">{step}</div>
            </div>
          ))}
        </div>

        <Card className="step-card">
          <CardHeader>
            <CardTitle>{STEPS[currentStep]}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 0: Upload Images */}
            {currentStep === 0 && (
              <div className="step-content" data-testid="step-upload-images">
                <p className="step-instruction">Upload at least 2 images of the product</p>
                <div className="images-grid">
                  {formData.images.map((image, index) => (
                    <div key={index} className="image-preview" data-testid={`image-preview-${index}`}>
                      <img src={image.url} alt={`Product ${index + 1}`} />
                      {image.is_primary && <span className="primary-badge">Primary</span>}
                      <div className="image-actions">
                        {!image.is_primary && (
                          <Button size="sm" onClick={() => makePrimaryImage(index)} data-testid={`make-primary-${index}`}>
                            Set Primary
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => removeImage(index)} data-testid={`remove-image-${index}`}>
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {formData.images.length < 10 && (
                    <div className="upload-options">
                      <label className="upload-box" data-testid="upload-box">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                        <Upload size={48} />
                        <span>Choose from Gallery</span>
                      </label>
                      <label className="upload-box camera-box" data-testid="camera-box">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleCameraCapture}
                          style={{ display: 'none' }}
                        />
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <span>Take Photo</span>
                      </label>
                    </div>
                  )}
                </div>
                <p className="image-count">
                  {formData.images.length} / 10 images uploaded (minimum 2 required)
                </p>
              </div>
            )}

            {/* Step 1: Fabric Selection */}
            {currentStep === 1 && (
              <div className="step-content" data-testid="step-fabric">
                <p className="step-instruction">Select the fabric type</p>
                <Select value={formData.fabric} onValueChange={(value) => setFormData({ ...formData, fabric: value })}>
                  <SelectTrigger data-testid="fabric-select">
                    <SelectValue placeholder="Select fabric" />
                  </SelectTrigger>
                  <SelectContent>
                    {fabrics.map((fabric) => (
                      <SelectItem key={fabric} value={fabric}>
                        {fabric}
                      </SelectItem>
                    ))}
                    <SelectItem value="__other__">Others (Add Custom)</SelectItem>
                  </SelectContent>
                </Select>

                {formData.fabric === '__other__' && (
                  <div className="custom-fabric-input">
                    <Input
                      placeholder="Enter custom fabric name"
                      value={formData.customFabric}
                      onChange={(e) => setFormData({ ...formData, customFabric: e.target.value })}
                      data-testid="custom-fabric-input"
                    />
                    <Button onClick={addCustomFabric} data-testid="add-custom-fabric-btn">
                      Add Fabric
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Available Colours */}
            {currentStep === 2 && (
              <div className="step-content" data-testid="step-available-colours">
                <p className="step-instruction">
                  Select color for each uploaded image. Use Auto-Detect or manually select from the color palette.
                </p>
                
                {formData.images.length > 0 ? (
                  <div className="image-carousel-container" style={{ marginTop: '20px' }}>
                    {/* Image Display with Navigation */}
                    <div className="carousel-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                      {/* Previous Arrow */}
                      <button
                        onClick={() => navigateImage('prev')}
                        disabled={currentImageIndex === 0}
                        style={{
                          padding: '10px 15px',
                          fontSize: '24px',
                          border: 'none',
                          background: currentImageIndex === 0 ? '#e5e7eb' : '#3b82f6',
                          color: currentImageIndex === 0 ? '#9ca3af' : 'white',
                          borderRadius: '8px',
                          cursor: currentImageIndex === 0 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s'
                        }}
                        data-testid="prev-image-btn"
                      >
                        ‹
                      </button>

                      {/* Current Image Display */}
                      <div style={{ flex: '1', maxWidth: '500px', textAlign: 'center' }}>
                        <div style={{ 
                          border: '2px solid #e5e7eb', 
                          borderRadius: '12px', 
                          padding: '20px',
                          backgroundColor: '#f9fafb'
                        }}>
                          <img 
                            src={formData.images[currentImageIndex]?.url} 
                            alt={`Product ${currentImageIndex + 1}`} 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '400px', 
                              objectFit: 'contain',
                              borderRadius: '8px'
                            }}
                          />
                          <div style={{ 
                            marginTop: '15px', 
                            fontSize: '14px', 
                            color: '#6b7280',
                            fontWeight: '500'
                          }}>
                            Image {currentImageIndex + 1} of {formData.images.length}
                          </div>
                        </div>
                      </div>

                      {/* Next Arrow */}
                      <button
                        onClick={() => navigateImage('next')}
                        disabled={currentImageIndex === formData.images.length - 1}
                        style={{
                          padding: '10px 15px',
                          fontSize: '24px',
                          border: 'none',
                          background: currentImageIndex === formData.images.length - 1 ? '#e5e7eb' : '#3b82f6',
                          color: currentImageIndex === formData.images.length - 1 ? '#9ca3af' : 'white',
                          borderRadius: '8px',
                          cursor: currentImageIndex === formData.images.length - 1 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s'
                        }}
                        data-testid="next-image-btn"
                      >
                        ›
                      </button>
                    </div>

                    {/* Color Selection for Current Image */}
                    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}>
                      <h4 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>
                        Color for Image {currentImageIndex + 1}
                      </h4>
                      
                      {/* Auto-Detect Button */}
                      <Button 
                        onClick={() => detectColorForSpecificImage(currentImageIndex)} 
                        disabled={detectingColorForImage === currentImageIndex}
                        data-testid={`detect-color-btn-${currentImageIndex}`}
                        style={{ marginBottom: '15px', width: '100%' }}
                      >
                        {detectingColorForImage === currentImageIndex ? 'Detecting...' : 'Auto-Detect Color'}
                      </Button>

                      {/* Color Palette with Search */}
                      <div style={{ marginTop: '15px' }}>
                        <Label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                          Select Color (click to select/deselect):
                        </Label>
                        
                        {/* Search Box */}
                        <div style={{ marginBottom: '15px' }}>
                          <Input
                            placeholder="Search colors..."
                            value={colorSearchTerm}
                            onChange={(e) => setColorSearchTerm(e.target.value)}
                            data-testid="available-colors-search"
                          />
                        </div>

                        {/* Color Palette */}
                        <div className="colors-palette" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          {colors.filter((color) => {
                            const colorName = typeof color === 'string' ? color : color.name;
                            return colorName.toLowerCase().includes(colorSearchTerm.toLowerCase());
                          }).map((color) => {
                            const colorName = typeof color === 'string' ? color : color.name;
                            const colorHex = typeof color === 'string' ? color.toLowerCase() : color.hex;
                            const isSelected = getColorForImage(currentImageIndex) === colorName;
                            
                            return (
                              <div
                                key={colorName}
                                className={`color-option ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  // Toggle: if already selected, deselect (set to empty), otherwise select
                                  if (isSelected) {
                                    setColorForImage(currentImageIndex, '');
                                  } else {
                                    setColorForImage(currentImageIndex, colorName);
                                  }
                                }}
                                data-testid={`available-color-${colorName}`}
                                title={colorName}
                                style={{ cursor: 'pointer' }}
                              >
                                <div 
                                  className="color-swatch"
                                  style={{ backgroundColor: colorHex }}
                                />
                                <span className="color-name">{colorName}</span>
                                {isSelected && (
                                  <Check className="color-check" size={16} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Display Selected Color */}
                      {getColorForImage(currentImageIndex) && (
                        <div style={{ 
                          marginTop: '15px', 
                          padding: '12px', 
                          backgroundColor: '#f0fdf4', 
                          border: '1px solid #86efac',
                          borderRadius: '8px'
                        }}>
                          <p style={{ margin: 0, fontSize: '14px', color: '#166534', fontWeight: '500' }}>
                            ✓ Selected Color: <strong>{getColorForImage(currentImageIndex)}</strong>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Progress Indicator */}
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '15px', 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                        Colors Selected: <strong>{formData.imageColors.filter(ic => ic.color).length}</strong> / {formData.images.length}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#ef4444', marginTop: '20px' }}>Please upload images first.</p>
                )}
              </div>
            )}

            {/* Step 3: Other Colors */}
            {currentStep === 3 && (
              <div className="step-content" data-testid="step-other-colors">
                <p className="step-instruction">Is this product available in other colors?</p>
                
                {/* Show uploaded image */}
                {formData.images.length > 0 && (
                  <div className="preview-image-container">
                    <img 
                      src={formData.images.find(img => img.is_primary)?.url || formData.images[0].url} 
                      alt="Product preview" 
                      className="preview-image"
                      style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'contain', margin: '20px auto', display: 'block', border: '2px solid #e5e7eb', borderRadius: '8px' }}
                    />
                  </div>
                )}
                
                <div className="yes-no-buttons">
                  <Button
                    variant={formData.hasOtherColors ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, hasOtherColors: true })}
                    data-testid="other-colors-yes"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!formData.hasOtherColors ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, hasOtherColors: false, availableColors: [] })}
                    data-testid="other-colors-no"
                  >
                    No
                  </Button>
                </div>

                {formData.hasOtherColors && (
                  <div className="color-selection-section">
                    <p>Select all available colors (click to select/deselect):</p>
                    
                    {/* Search Box for Other Colors */}
                    <div style={{ marginBottom: '15px' }}>
                      <Input
                        placeholder="Search colors..."
                        value={otherColorsSearchTerm}
                        onChange={(e) => setOtherColorsSearchTerm(e.target.value)}
                        style={{ maxWidth: '300px' }}
                        data-testid="other-colors-search"
                      />
                    </div>
                    
                    <div className="colors-palette">
                      {colors.filter((color) => {
                        const colorName = color.name || color;
                        return colorName.toLowerCase().includes(otherColorsSearchTerm.toLowerCase());
                      }).map((color) => (
                        <div
                          key={color.name || color}
                          className={`color-option ${formData.availableColors.includes(color.name || color) ? 'selected' : ''}`}
                          onClick={() => toggleColor(color.name || color)}
                          data-testid={`available-color-${color.name || color}`}
                          title={color.name || color}
                        >
                          <div 
                            className="color-swatch"
                            style={{ backgroundColor: color.hex || color.toLowerCase() }}
                          />
                          <span className="color-name">{color.name || color}</span>
                          {formData.availableColors.includes(color.name || color) && (
                            <Check className="color-check" size={16} />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="selected-count">
                      {formData.availableColors.length} colors selected
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Sizes */}
            {currentStep === 4 && (
              <div className="step-content" data-testid="step-sizes">
                <p className="step-instruction">
                  Select available sizes for each uploaded image. Use the arrows to navigate between images.
                </p>
                
                {formData.images.length > 0 ? (
                  <div className="image-carousel-container" style={{ marginTop: '20px' }}>
                    {/* Image Display with Navigation */}
                    <div className="carousel-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                      {/* Previous Arrow */}
                      <button
                        onClick={() => navigateImage('prev')}
                        disabled={currentImageIndex === 0}
                        style={{
                          padding: '10px 15px',
                          fontSize: '24px',
                          border: 'none',
                          background: currentImageIndex === 0 ? '#e5e7eb' : '#3b82f6',
                          color: currentImageIndex === 0 ? '#9ca3af' : 'white',
                          borderRadius: '8px',
                          cursor: currentImageIndex === 0 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s'
                        }}
                        data-testid="prev-image-btn-sizes"
                      >
                        ‹
                      </button>

                      {/* Current Image Display */}
                      <div style={{ flex: '1', maxWidth: '500px', textAlign: 'center' }}>
                        <div style={{ 
                          border: '2px solid #e5e7eb', 
                          borderRadius: '12px', 
                          padding: '20px',
                          backgroundColor: '#f9fafb'
                        }}>
                          <img 
                            src={formData.images[currentImageIndex]?.url} 
                            alt={`Product ${currentImageIndex + 1}`} 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '400px', 
                              objectFit: 'contain',
                              borderRadius: '8px'
                            }}
                          />
                          <div style={{ 
                            marginTop: '15px', 
                            fontSize: '14px', 
                            color: '#6b7280',
                            fontWeight: '500'
                          }}>
                            Image {currentImageIndex + 1} of {formData.images.length}
                          </div>
                        </div>
                      </div>

                      {/* Next Arrow */}
                      <button
                        onClick={() => navigateImage('next')}
                        disabled={currentImageIndex === formData.images.length - 1}
                        style={{
                          padding: '10px 15px',
                          fontSize: '24px',
                          border: 'none',
                          background: currentImageIndex === formData.images.length - 1 ? '#e5e7eb' : '#3b82f6',
                          color: currentImageIndex === formData.images.length - 1 ? '#9ca3af' : 'white',
                          borderRadius: '8px',
                          cursor: currentImageIndex === formData.images.length - 1 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s'
                        }}
                        data-testid="next-image-btn-sizes"
                      >
                        ›
                      </button>
                    </div>

                    {/* Size Selection for Current Image */}
                    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}>
                      <h4 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>
                        Sizes for Image {currentImageIndex + 1}
                      </h4>
                      
                      {/* Letter Sizes */}
                      <div style={{ marginBottom: '20px' }}>
                        <Label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
                          Letter Sizes:
                        </Label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {sizeOptions.letters.map((size) => {
                            const isSelected = getSizesForImage(currentImageIndex).includes(size);
                            return (
                              <Button
                                key={size}
                                variant={isSelected ? "default" : "outline"}
                                onClick={() => toggleSizeForImage(currentImageIndex, size)}
                                data-testid={`size-${size}-image-${currentImageIndex}`}
                                style={{ minWidth: '60px' }}
                              >
                                {size}
                                {isSelected && <Check size={16} className="ml-2" />}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Number Sizes */}
                      <div>
                        <Label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '500' }}>
                          Number Sizes:
                        </Label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {sizeOptions.numbers.map((size) => {
                            const isSelected = getSizesForImage(currentImageIndex).includes(size);
                            return (
                              <Button
                                key={size}
                                variant={isSelected ? "default" : "outline"}
                                onClick={() => toggleSizeForImage(currentImageIndex, size)}
                                data-testid={`size-${size}-image-${currentImageIndex}`}
                                style={{ minWidth: '60px' }}
                              >
                                {size}
                                {isSelected && <Check size={16} className="ml-2" />}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Display Selected Sizes */}
                      {getSizesForImage(currentImageIndex).length > 0 && (
                        <div style={{ 
                          marginTop: '15px', 
                          padding: '12px', 
                          backgroundColor: '#f0fdf4', 
                          border: '1px solid #86efac',
                          borderRadius: '8px'
                        }}>
                          <p style={{ margin: 0, fontSize: '14px', color: '#166534', fontWeight: '500' }}>
                            ✓ Selected Sizes: <strong>{getSizesForImage(currentImageIndex).join(', ')}</strong>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Progress Indicator */}
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '15px', 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                        Sizes Selected: <strong>{formData.imageSizes.filter(is => is.sizes.length > 0).length}</strong> / {formData.images.length} images
                      </p>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#ef4444', marginTop: '20px' }}>Please upload images first.</p>
                )}
              </div>
            )}

            {/* Step 5: Item Details */}
            {currentStep === 5 && (
              <div className="step-content" data-testid="step-item-details">
                <p className="step-instruction">Provide item name and short description</p>
                
                <div className="form-field">
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    placeholder="Enter item name (3-4 words)"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    data-testid="item-name-input"
                    maxLength={100}
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    placeholder="Enter key features and description"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    data-testid="short-description-input"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Detailed Description */}
            {currentStep === 6 && (
              <div className="step-content" data-testid="step-detailed-description">
                <p className="step-instruction">
                  A detailed description will be generated automatically. You can edit it if needed.
                </p>
                
                <Button 
                  onClick={generateDescription} 
                  disabled={generatingDescription}
                  data-testid="generate-description-btn"
                  className="generate-btn"
                >
                  {generatingDescription ? 'Generating...' : 'Generate Description'}
                </Button>

                <div className="form-field">
                  <Label htmlFor="detailedDescription">Detailed Description</Label>
                  <Textarea
                    id="detailedDescription"
                    placeholder="Detailed description will appear here..."
                    value={formData.detailedDescription}
                    onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                    data-testid="detailed-description-input"
                    rows={8}
                  />
                </div>
              </div>
            )}

            {/* Step 7: Price */}
            {currentStep === 7 && (
              <div className="step-content" data-testid="step-price">
                <p className="step-instruction">Set the product price</p>
                
                <div className="price-slider-container">
                  <Label>Price Range: ₹0 - ₹10,000</Label>
                  <Slider
                    value={[formData.price]}
                    onValueChange={(value) => setFormData({ ...formData, price: Math.round(value[0] / 100) * 100 })}
                    max={10000}
                    step={100}
                    data-testid="price-slider"
                    className="price-slider"
                  />
                  <p className="price-display">Selected: ₹{formData.price}</p>
                </div>

                <div className="form-field">
                  <Label htmlFor="exactPrice">Exact Price *</Label>
                  <Input
                    id="exactPrice"
                    type="number"
                    placeholder="Enter exact price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    data-testid="exact-price-input"
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Step 8: Fresh Arrival Tag */}
            {currentStep === 8 && (
              <div className="step-content" data-testid="step-fresh-arrival-tag">
                <p className="step-instruction">
                  Do you want to add the "Fresh Arrival" tag to this product?
                </p>
                <p className="step-note">
                  This tag will be shown at the top-right corner of the product card.
                </p>
                
                <div className="switch-container">
                  <Switch
                    checked={formData.isFreshArrivalTag}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFreshArrivalTag: checked })}
                    data-testid="fresh-arrival-tag-switch"
                  />
                  <Label>Add "Fresh Arrival" Tag</Label>
                </div>

                {formData.isFreshArrivalTag && (
                  <div className="fresh-arrival-info">
                    <p>✓ Product will display a "Fresh Arrival" tag on its card</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 9: Show in Fresh Arrivals Section */}
            {currentStep === 9 && (
              <div className="step-content" data-testid="step-show-in-fresh-arrivals">
                <p className="step-instruction">
                  Do you want this product to appear in the "Fresh Arrivals" section on the homepage?
                </p>
                
                <div className="switch-container">
                  <Switch
                    checked={formData.showInFreshArrivals}
                    onCheckedChange={(checked) => setFormData({ ...formData, showInFreshArrivals: checked })}
                    data-testid="show-in-fresh-arrivals-switch"
                  />
                  <Label>Show in Fresh Arrivals Section</Label>
                </div>

                {formData.showInFreshArrivals && (
                  <div className="fresh-arrival-info">
                    <p>✓ Product will appear in the Fresh Arrivals section on the homepage</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 10: Preview */}
            {currentStep === 10 && (
              <div className="step-content preview-content" data-testid="step-preview">
                <h3>Product Preview</h3>
                <p className="preview-instruction">Review all details before publishing</p>
                
                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Images</h4>
                    <Button size="sm" variant="ghost" onClick={() => handleEditFromPreview(0)} data-testid="edit-images">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <div className="preview-images">
                    {formData.images.map((image, index) => (
                      <img key={index} src={image.url} alt={`Product ${index + 1}`} />
                    ))}
                  </div>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Fabric</h4>
                    <Button size="sm" variant="ghost" onClick={() => handleEditFromPreview(1)} data-testid="edit-fabric">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.fabric}</p>
                </div>

                {formData.imageColors.length > 0 && (
                  <div className="preview-section">
                    <div className="preview-header">
                      <h4>Image Colors</h4>
                      <Button size="sm" variant="ghost" onClick={() => handleEditFromPreview(2)} data-testid="edit-image-colors">
                        <Edit2 size={16} /> Edit
                      </Button>
                    </div>
                    <div>
                      {formData.imageColors.map((ic, idx) => (
                        <p key={idx}>Image {ic.imageIndex + 1}: {ic.color}</p>
                      ))}
                    </div>
                  </div>
                )}

                {formData.availableColors.length > 0 && (
                  <div className="preview-section">
                    <div className="preview-header">
                      <h4>Available Colors</h4>
                      <Button size="sm" variant="ghost" onClick={() => handleEditFromPreview(3)} data-testid="edit-colors">
                        <Edit2 size={16} /> Edit
                      </Button>
                    </div>
                    <p>{formData.availableColors.join(', ')}</p>
                  </div>
                )}

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Sizes</h4>
                    <Button size="sm" variant="ghost" onClick={() => handleEditFromPreview(4)} data-testid="edit-sizes">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <div>
                    {formData.imageSizes.length > 0 ? (
                      <>
                        {formData.imageSizes.map((is, idx) => (
                          <p key={idx}>Image {is.imageIndex + 1}: {is.sizes.join(', ')}</p>
                        ))}
                        <p style={{ marginTop: '10px', fontWeight: '600', color: '#059669' }}>
                          All Available Sizes: {Array.from(new Set(formData.imageSizes.flatMap(is => is.sizes))).join(', ')}
                        </p>
                      </>
                    ) : (
                      <p>No sizes selected</p>
                    )}
                  </div>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Item Name</h4>
                    <Button size="sm" variant="ghost" onClick={() => handleEditFromPreview(5)} data-testid="edit-item-name">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.itemName}</p>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Short Description</h4>
                    <Button size="sm" variant="ghost" onClick={() => handleEditFromPreview(5)} data-testid="edit-short-desc">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.shortDescription}</p>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Detailed Description</h4>
                    <Button size="sm" variant="ghost" onClick={() => handleEditFromPreview(6)} data-testid="edit-detailed-desc">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.detailedDescription}</p>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Price</h4>
                    <Button size="sm" variant="ghost" onClick={() => handleEditFromPreview(7)} data-testid="edit-price">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p className="price-preview">₹{formData.price}</p>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Fresh Arrival Tag</h4>
                    <Button size="sm" variant="ghost" onClick={() => handleEditFromPreview(8)} data-testid="edit-fresh-arrival-tag">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.isFreshArrivalTag ? 'Yes - Tag will be shown on product card' : 'No'}</p>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Show in Fresh Arrivals Section</h4>
                    <Button size="sm" variant="ghost" onClick={() => handleEditFromPreview(9)} data-testid="edit-show-in-fresh-arrivals">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.showInFreshArrivals ? 'Yes - Will appear on homepage' : 'No'}</p>
                </div>

                <Button 
                  onClick={handlePublish} 
                  className="publish-btn"
                  size="lg"
                  data-testid="publish-btn"
                >
                  Publish Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="navigation-buttons">
          {currentStep > 0 && (
            <Button variant="outline" onClick={prevStep} data-testid="prev-step-btn">
              Previous
            </Button>
          )}
          {currentStep < STEPS.length - 1 && (
            <Button 
              onClick={nextStep} 
              disabled={!canProceedToNextStep()}
              data-testid="next-step-btn"
            >
              Next
              <Check size={18} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data for Milan Readymades

export const mockProducts = [
  // Men's Collection
  {
    id: 'men-1',
    name: 'Classic Silk Kurta',
    category: 'Traditional Attire',
    gender: 'men',
    subcategory: 'traditional',
    image: 'https://images.pexels.com/photos/17379008/pexels-photo-17379008.jpeg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isNewArrival: true
  },
  {
    id: 'men-2',
    name: 'Premium Cotton Shirt',
    category: 'Shirts',
    gender: 'men',
    subcategory: 'shirts',
    image: 'https://images.pexels.com/photos/2983364/pexels-photo-2983364.jpeg',
    sizes: ['M', 'L', 'XL', 'XXL'],
    isNewArrival: true
  },
  {
    id: 'men-3',
    name: 'Designer Blazer',
    category: 'Suits',
    gender: 'men',
    subcategory: 'suits',
    image: 'https://images.pexels.com/photos/375902/pexels-photo-375902.jpeg',
    sizes: ['M', 'L', 'XL'],
    isNewArrival: false
  },
  {
    id: 'men-4',
    name: 'Formal Trousers',
    category: 'Pants',
    gender: 'men',
    subcategory: 'pants',
    image: 'https://images.pexels.com/photos/101665/pexels-photo-101665.jpeg',
    sizes: ['30', '32', '34', '36', '38', '40'],
    isNewArrival: false
  },

  // Women's Collection
  {
    id: 'women-1',
    name: 'Elegant Silk Saree',
    category: 'Traditional Wears',
    gender: 'women',
    subcategory: 'traditional',
    image: 'https://images.pexels.com/photos/4428278/pexels-photo-4428278.jpeg',
    sizes: ['Free Size'],
    isNewArrival: true
  },
  {
    id: 'women-2',
    name: 'Designer Lehenga',
    category: 'Ethnic Wears',
    gender: 'women',
    subcategory: 'ethnic',
    image: 'https://images.pexels.com/photos/7685501/pexels-photo-7685501.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
    isNewArrival: true
  },
  {
    id: 'women-3',
    name: 'Party Wear Salwar',
    category: 'Ethnic Wears',
    gender: 'women',
    subcategory: 'ethnic',
    image: 'https://images.pexels.com/photos/28943570/pexels-photo-28943570.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
    isNewArrival: true
  },
  {
    id: 'women-4',
    name: 'Cotton Palazzo Set',
    category: 'Bottom Wear',
    gender: 'women',
    subcategory: 'bottomwear',
    image: 'https://images.pexels.com/photos/1263374/pexels-photo-1263374.jpeg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isNewArrival: false
  },
  {
    id: 'women-5',
    name: 'Casual Co-ord Set',
    category: 'Casual Wears',
    gender: 'women',
    subcategory: 'casual',
    image: 'https://images.pexels.com/photos/2307303/pexels-photo-2307303.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
    isNewArrival: true
  },
  {
    id: 'women-6',
    name: 'Designer Western Dress',
    category: 'Western Wears',
    gender: 'women',
    subcategory: 'western',
    image: 'https://images.pexels.com/photos/1520587/pexels-photo-1520587.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
    isNewArrival: false
  },

  // Kids Collection
  {
    id: 'kids-1',
    name: 'Kids Traditional Wear',
    category: 'Traditional',
    gender: 'kids',
    subcategory: 'traditional',
    kidsGender: 'boy',
    image: 'https://images.pexels.com/photos/33600949/pexels-photo-33600949.jpeg',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    isNewArrival: true
  },
  {
    id: 'kids-2',
    name: 'Party Wear Dress',
    category: 'Party Wears',
    gender: 'kids',
    subcategory: 'party',
    kidsGender: 'girl',
    image: 'https://images.pexels.com/photos/1008206/pexels-photo-1008206.jpeg',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'],
    isNewArrival: true
  }
];

// Categories for each gender
export const categories = {
  men: [
    { id: 'traditional', name: 'Traditional Attire', icon: 'BookOpen' },
    { id: 'shirts', name: 'Shirts', icon: 'Shirt' },
    { id: 'pants', name: 'Pants', icon: 'Wind' },
    { id: 'inner-wears', name: 'Inner Wears', icon: 'Package' }
  ],
  women: [
    { id: 'traditional', name: 'Traditional Wears', description: 'Sarees and more' },
    { id: 'ethnic', name: 'Ethnic Wears', description: 'Salwar, Churidar, Lehenga, Sharara' },
    { id: 'western', name: 'Western Wears', description: 'Tops, Frocks, Midi, Maxi' },
    { id: 'bottomwear', name: 'Bottom Wear', description: 'Pants, Patiala, Leggings, Palazzo' },
    { id: 'casual', name: 'Casual Wears', description: 'Daily wear, Co-ord sets, Nightwear' },
    { id: 'inner-wears', name: 'Inner Wears', description: 'Slips, Bras, Blouse bits' }
  ],
  kids: [
    { id: 'traditional', name: 'Traditional', icon: 'BookOpen' },
    { id: 'casual', name: 'Casual', icon: 'Home' },
    { id: 'party', name: 'Party Wears', icon: 'Sparkles' },
    { id: 'nightwear', name: 'Night Wears', icon: 'Moon' }
  ],
  accessories: [
    { id: 'belts', name: 'Belts', icon: 'Package' },
    { id: 'towels', name: 'Towels', icon: 'Package' },
    { id: 'handkerchiefs', name: 'Handkerchiefs', icon: 'Package' },
    { id: 'others', name: 'Others', icon: 'Package' }
  ]
};

// Age groups for kids
export const kidsAgeGroups = [
  { id: '0-3', label: '0-3 Years', min: 0, max: 3 },
  { id: '4-7', label: '4-7 Years', min: 4, max: 7 },
  { id: '8-11', label: '8-11 Years', min: 8, max: 11 },
  { id: '12-15', label: '12-15 Years', min: 12, max: 15 }
];
import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "./components/ui/toaster";
import { HomePage } from "./pages/HomePage";
import { CategoryPage } from "./pages/CategoryPage";
import { KidsCategoryPage } from "./pages/KidsCategoryPage";
import { AccessoriesPage } from "./pages/AccessoriesPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { AboutPage } from "./pages/AboutPage";
import { LoginPage } from "./pages/LoginPage";
import { CartPage } from "./pages/CartPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { GetInTouchPage } from "./pages/GetInTouchPage";
import { FreshArrivalsPage } from "./pages/FreshArrivalsPage";
import { OwnerDashboardPage } from "./pages/OwnerDashboardPage";
import { OwnerSectionPage } from "./pages/OwnerSectionPage";
import { OwnerProductsPage } from "./pages/OwnerProductsPage";
import { AddProductPage } from "./pages/AddProductPage";
import { EditProductPage } from "./pages/EditProductPage";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:gender" element={<CategoryPage />} />
              <Route path="/category/kids/:kidsGender" element={<KidsCategoryPage />} />
              <Route path="/category/accessories" element={<AccessoriesPage />} />
              <Route path="/accessories/:subcategory" element={<AccessoriesPage />} />
              <Route path="/products/:gender/:subcategory" element={<ProductsPage />} />
              <Route path="/products/:gender/:subcategory/:kidsGender" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/fresh-arrivals" element={<FreshArrivalsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/get-in-touch" element={<GetInTouchPage />} />
              <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
              <Route path="/owner/section/:section" element={<OwnerSectionPage />} />
              <Route path="/owner/products/:section/:category" element={<OwnerProductsPage />} />
              <Route path="/owner/products/:section/:ageGroup/:gender" element={<OwnerProductsPage />} />
              <Route path="/owner/products/:section/:ageGroup/:gender/:category" element={<OwnerProductsPage />} />
              <Route path="/owner/add-product/:section/:category" element={<AddProductPage />} />
              <Route path="/owner/add-product/:section/:ageGroup/:gender" element={<AddProductPage />} />
              <Route path="/owner/add-product/:section/:ageGroup/:gender/:category" element={<AddProductPage />} />
              <Route path="/owner/edit-product/:productId" element={<EditProductPage />} />
            </Routes>
            <Footer />
          </BrowserRouter>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;

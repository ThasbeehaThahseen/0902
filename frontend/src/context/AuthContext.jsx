import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  // Owner authentication
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [ownerToken, setOwnerToken] = useState(localStorage.getItem('owner_token'));
  
  // User authentication
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [userToken, setUserToken] = useState(localStorage.getItem('user_token'));
  const [currentUser, setCurrentUser] = useState(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyTokens();
  }, [ownerToken, userToken]);

  const verifyTokens = async () => {
    setLoading(true);
    
    // Verify owner token
    if (ownerToken) {
      try {
        await axios.get(`${API}/owner/verify`, {
          headers: { Authorization: `Bearer ${ownerToken}` }
        });
        setIsOwnerAuthenticated(true);
      } catch (error) {
        logoutOwner();
      }
    }
    
    // Verify user token
    if (userToken) {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        setCurrentUser(response.data);
        setIsUserAuthenticated(true);
      } catch (error) {
        logoutUser();
      }
    }
    
    setLoading(false);
  };

  // Owner authentication methods
  const loginOwner = async (username, password) => {
    try {
      const response = await axios.post(`${API}/owner/login`, { username, password });
      const { access_token } = response.data;
      localStorage.setItem('owner_token', access_token);
      setOwnerToken(access_token);
      setIsOwnerAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const logoutOwner = () => {
    localStorage.removeItem('owner_token');
    setOwnerToken(null);
    setIsOwnerAuthenticated(false);
  };

  // User authentication methods
  const sendOTP = async (mobileNumber) => {
    try {
      const response = await axios.post(`${API}/auth/send-otp`, {
        mobile_number: mobileNumber
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (mobileNumber, otp) => {
    try {
      const response = await axios.post(`${API}/auth/verify-otp`, {
        mobile_number: mobileNumber,
        otp: otp
      });
      const { access_token, has_username, username, user_id } = response.data;
      localStorage.setItem('user_token', access_token);
      setUserToken(access_token);
      setIsUserAuthenticated(true);
      setCurrentUser({ id: user_id, mobile_number: mobileNumber, username });
      return { success: true, has_username, username };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Invalid OTP' };
    }
  };

  const createUserAccount = async (mobileNumber, username) => {
    try {
      const response = await axios.post(`${API}/auth/create-account`, {
        mobile_number: mobileNumber,
        username: username
      });
      setCurrentUser(prev => ({ ...prev, username }));
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to create account' };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('user_token');
    setUserToken(null);
    setIsUserAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      // Owner auth
      isOwnerAuthenticated,
      ownerToken,
      loginOwner,
      logoutOwner,
      // User auth
      isUserAuthenticated,
      userToken,
      currentUser,
      sendOTP,
      verifyOTP,
      createUserAccount,
      logoutUser,
      // General
      loading,
      // Legacy support
      isAuthenticated: isOwnerAuthenticated,
      token: ownerToken,
      login: loginOwner,
      logout: logoutOwner
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
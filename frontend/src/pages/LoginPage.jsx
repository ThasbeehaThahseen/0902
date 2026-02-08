import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Lock, User } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import './LoginPage.css';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      toast({
        title: 'Login Successful',
        description: 'Welcome to Milan Readymades Dashboard'
      });
      navigate('/owner/dashboard');
    } else {
      toast({
        title: 'Login Failed',
        description: result.error,
        variant: 'destructive'
      });
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <CardHeader>
          <CardTitle className="login-title">
            <Lock className="login-icon" />
            Owner Login
          </CardTitle>
          <p className="login-subtitle">Milan Readymades</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <User size={16} /> Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={16} /> Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <Button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="back-btn"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
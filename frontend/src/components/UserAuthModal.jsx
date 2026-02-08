import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';

export const UserAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('mobile'); // mobile, otp, username
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOTP] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpData, setOtpData] = useState(null);

  const { sendOTP, verifyOTP, createUserAccount } = useAuth();
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({
        title: 'Invalid mobile number',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const result = await sendOTP(mobileNumber);
    setLoading(false);

    if (result.success) {
      setOtpData(result.data);
      setStep('otp');
      toast({
        title: 'OTP Sent',
        description: `OTP: ${result.data.otp} (For testing)`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive'
      });
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a valid 6-digit OTP',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const result = await verifyOTP(mobileNumber, otp);
    setLoading(false);

    if (result.success) {
      if (result.has_username) {
        // User already has username, proceed
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${result.username}`
        });
        onSuccess && onSuccess();
        handleClose();
      } else {
        // New user, need to create username
        setStep('username');
      }
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive'
      });
    }
  };

  const handleCreateAccount = async () => {
    if (!username || username.length < 3) {
      toast({
        title: 'Invalid username',
        description: 'Username must be at least 3 characters',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const result = await createUserAccount(mobileNumber, username);
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Account created!',
        description: `Welcome ${username}!`
      });
      onSuccess && onSuccess();
      handleClose();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive'
      });
    }
  };

  const handleClose = () => {
    setStep('mobile');
    setMobileNumber('');
    setOTP('');
    setUsername('');
    setOtpData(null);
    onClose && onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'mobile' && 'Sign in with Mobile'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'username' && 'Create Your Account'}
          </DialogTitle>
          <DialogDescription>
            {step === 'mobile' && 'Enter your mobile number to receive an OTP'}
            {step === 'otp' && 'Enter the 6-digit OTP sent to your mobile'}
            {step === 'username' && 'Choose a username for your account'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'mobile' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  data-testid="mobile-input"
                />
              </div>
              <Button
                onClick={handleSendOTP}
                disabled={loading || mobileNumber.length !== 10}
                className="w-full"
                data-testid="send-otp-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  data-testid="otp-input"
                />
                <p className="text-sm text-gray-500">
                  OTP sent to {mobileNumber}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('mobile')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="flex-1"
                  data-testid="verify-otp-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 'username' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-testid="username-input"
                />
              </div>
              <Button
                onClick={handleCreateAccount}
                disabled={loading || username.length < 3}
                className="w-full"
                data-testid="create-account-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

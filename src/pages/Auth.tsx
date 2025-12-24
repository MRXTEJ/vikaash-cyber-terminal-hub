import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMFA } from '@/hooks/useMFA';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import TwoFactorVerify from '@/components/auth/TwoFactorVerify';
import { OTPVerification } from '@/components/auth/OTPVerification';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthStep = 'login' | 'mfa-verify' | 'mfa-setup' | 'otp-verify';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [otpVerified, setOtpVerified] = useState(false);
  const { signIn, signUp, user, loading, signOut } = useAuth();
  const { isEnabled, isVerified, loading: mfaLoading, refresh: refreshMFA } = useMFA();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !mfaLoading && user) {
      // User is logged in, check MFA status
      if (isEnabled && !isVerified) {
        // Has 2FA enabled but not verified this session - use authenticator
        setAuthStep('mfa-verify');
      } else if (isVerified) {
        // 2FA verified - go directly to admin (no OTP needed)
        navigate('/admin');
      } else if (!isEnabled) {
        // No 2FA enabled - require OTP verification instead
        if (!otpVerified) {
          setAuthStep('otp-verify');
        } else {
          navigate('/admin');
        }
      }
    }
  }, [user, loading, mfaLoading, isEnabled, isVerified, otpVerified, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          // Refresh MFA status after login
          await refreshMFA();
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: 'Sign Up Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account Created',
            description: 'Your account has been created. Please login.',
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMFAVerified = () => {
    refreshMFA();
    // After MFA verification - go directly to admin
    navigate('/admin');
  };

  const handleMFASetupComplete = () => {
    refreshMFA();
    // After MFA setup - go directly to admin
    navigate('/admin');
  };

  const handleSkipMFA = () => {
    // If skipping MFA, require OTP instead
    setAuthStep('otp-verify');
  };

  const handleOTPVerified = () => {
    setOtpVerified(true);
    navigate('/admin');
  };

  const handleCancelMFA = async () => {
    await signOut();
    setAuthStep('login');
    setOtpVerified(false);
  };

  if (loading || mfaLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  // Show OTP verification after 2FA (or if 2FA not enabled)
  if (authStep === 'otp-verify' && user && !otpVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <OTPVerification
          userId={user.id}
          userEmail={user.email || email}
          onVerified={handleOTPVerified}
          onCancel={handleCancelMFA}
        />
      </div>
    );
  }

  // Show MFA verification if user has 2FA enabled but not verified this session
  if (authStep === 'mfa-verify' && user && isEnabled && !isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8">
            <TwoFactorVerify 
              onVerified={handleMFAVerified}
              onCancel={handleCancelMFA}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show MFA setup option after first login if not enabled
  if (user && !isEnabled && authStep !== 'mfa-setup' && authStep !== 'otp-verify') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">Secure Your Account</h2>
              <p className="text-muted-foreground text-sm">
                Would you like to enable Two-Factor Authentication for extra security?
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => setAuthStep('mfa-setup')}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Enable 2FA
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkipMFA}
                className="w-full text-muted-foreground"
              >
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show MFA setup
  if (authStep === 'mfa-setup' && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8">
            <TwoFactorSetup 
              onComplete={handleMFASetupComplete}
              onSkip={handleSkipMFA}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary glow-text mb-2">
              &lt; Admin Access /&gt;
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? 'Sign in to manage your portfolio' : 'Create an admin account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="bg-muted border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-muted border-border text-foreground"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-secondary hover:text-secondary/80 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              ← Back to Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMFA } from '@/hooks/useMFA';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Shield, Mail, Smartphone, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import TwoFactorVerify from '@/components/auth/TwoFactorVerify';
import { OTPVerification } from '@/components/auth/OTPVerification';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthStep = 'login' | 'forgot-password' | 'verification-choice' | 'mfa-verify' | 'mfa-setup' | 'otp-verify';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, user, loading, signOut, resetPassword } = useAuth();
  const { isEnabled, isVerified, loading: mfaLoading, refresh: refreshMFA } = useMFA();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !mfaLoading && user) {
      // User is logged in, check MFA status
      if (isVerified) {
        // Already verified via MFA - go to admin
        navigate('/admin');
      } else if (otpVerified) {
        // Already verified via OTP - go to admin
        navigate('/admin');
      } else if (authStep === 'login') {
        // Show verification choice screen
        setAuthStep('verification-choice');
      }
    }
  }, [user, loading, mfaLoading, isVerified, otpVerified, navigate, authStep]);

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

  // Show verification choice screen
  if (authStep === 'verification-choice' && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              Verify Your Identity
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose a verification method to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Authenticator App Option - only show if enabled */}
            {isEnabled && (
              <Button
                variant="outline"
                onClick={() => setAuthStep('mfa-verify')}
                className="w-full h-auto py-4 justify-start gap-4 border-primary/20 hover:border-primary/50"
              >
                <div className="p-2 rounded-full bg-primary/10">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Authenticator App</div>
                  <div className="text-xs text-muted-foreground">Use your authenticator app code</div>
                </div>
              </Button>
            )}

            {/* Email OTP Option */}
            <Button
              variant="outline"
              onClick={() => setAuthStep('otp-verify')}
              className="w-full h-auto py-4 justify-start gap-4 border-primary/20 hover:border-primary/50"
            >
              <div className="p-2 rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Email OTP</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </Button>

            {/* Setup 2FA option if not enabled */}
            {!isEnabled && (
              <div className="pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => setAuthStep('mfa-setup')}
                  className="w-full text-muted-foreground"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Setup Authenticator App
                </Button>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleCancelMFA}
                className="w-full text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show OTP verification
  if (authStep === 'otp-verify' && user && !otpVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <OTPVerification
          userId={user.id}
          userEmail={user.email || email}
          onVerified={handleOTPVerified}
          onCancel={() => setAuthStep('verification-choice')}
        />
      </div>
    );
  }

  // Show MFA verification
  if (authStep === 'mfa-verify' && user && isEnabled && !isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8">
            <TwoFactorVerify 
              onVerified={handleMFAVerified}
              onCancel={() => setAuthStep('verification-choice')}
            />
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
              onSkip={() => setAuthStep('verification-choice')}
            />
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password Screen
  if (authStep === 'forgot-password') {
    const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
        toast({
          title: 'Error',
          description: 'Please enter your email address',
          variant: 'destructive',
        });
        return;
      }
      setIsSubmitting(true);
      const { error } = await resetPassword(email);
      setIsSubmitting(false);
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Email Sent',
          description: 'Check your email for password reset instructions',
        });
        setAuthStep('login');
      }
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-primary glow-text mb-2">
                Reset Password
              </h1>
              <p className="text-muted-foreground">
                Enter your email to receive reset instructions
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-foreground">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="bg-muted border-border text-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setAuthStep('login')}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>
            </div>
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
              Sign in to manage your portfolio
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <button
                  type="button"
                  onClick={() => setAuthStep('forgot-password')}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-muted border-border text-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? 'Processing...' : 'Sign In'}
            </Button>
          </form>

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

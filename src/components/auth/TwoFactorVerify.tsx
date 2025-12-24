import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key } from 'lucide-react';
import { useRecoveryCodes } from '@/hooks/useRecoveryCodes';

interface TwoFactorVerifyProps {
  onVerified: () => void;
  onCancel: () => void;
}

const TwoFactorVerify = ({ onVerified, onCancel }: TwoFactorVerifyProps) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const { toast } = useToast();
  const { verifyRecoveryCode } = useRecoveryCodes();

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        toast({
          title: 'Error',
          description: factorsError.message,
          variant: 'destructive',
        });
        return;
      }

      const totpFactor = factorsData.totp.find(f => f.status === 'verified');
      
      if (!totpFactor) {
        toast({
          title: 'Error',
          description: 'No verified 2FA found',
          variant: 'destructive',
        });
        return;
      }

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id
      });

      if (challengeError) {
        toast({
          title: 'Error',
          description: challengeError.message,
          variant: 'destructive',
        });
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: code
      });

      if (verifyError) {
        toast({
          title: 'Verification Failed',
          description: 'Invalid code. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Verified',
        description: '2FA verification successful',
      });
      onVerified();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to verify 2FA code',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRecoveryCodeVerify = async () => {
    if (recoveryCode.length < 10) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a valid recovery code',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verifyRecoveryCode(recoveryCode);

      if (isValid) {
        toast({
          title: 'Recovery Successful',
          description: 'You have been logged in using a recovery code',
        });
        onVerified();
      } else {
        toast({
          title: 'Invalid Code',
          description: 'The recovery code is invalid or has already been used',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to verify recovery code',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (useRecoveryCode) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Key className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Use Recovery Code</h2>
          <p className="text-muted-foreground text-sm">
            Enter one of your recovery codes to access your account
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recoveryCode" className="text-foreground">Recovery Code</Label>
          <Input
            id="recoveryCode"
            type="text"
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
            placeholder="XXXXX-XXXXX"
            className="bg-muted border-border text-foreground text-center text-lg tracking-widest font-mono"
            autoFocus
          />
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleRecoveryCodeVerify}
            disabled={isVerifying || recoveryCode.length < 10}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isVerifying ? 'Verifying...' : 'Verify Recovery Code'}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => setUseRecoveryCode(false)}
            className="w-full text-muted-foreground"
          >
            Use Authenticator Instead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Two-Factor Authentication</h2>
        <p className="text-muted-foreground text-sm">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code" className="text-foreground">Authentication Code</Label>
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="bg-muted border-border text-foreground text-center text-2xl tracking-widest"
          autoFocus
        />
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleVerify}
          disabled={isVerifying || code.length !== 6}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          onClick={() => setUseRecoveryCode(true)}
          className="w-full text-muted-foreground"
        >
          <Key className="w-4 h-4 mr-2" />
          Lost your device? Use recovery code
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="w-full text-muted-foreground"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default TwoFactorVerify;

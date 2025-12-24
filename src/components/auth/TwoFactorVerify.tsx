import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

interface TwoFactorVerifyProps {
  onVerified: () => void;
  onCancel: () => void;
}

const TwoFactorVerify = ({ onVerified, onCancel }: TwoFactorVerifyProps) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

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
      // Get the TOTP factors
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

      // Create a challenge
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

      // Verify the code
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

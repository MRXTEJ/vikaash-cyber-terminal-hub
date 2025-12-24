import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Copy, Check } from 'lucide-react';
import { useRecoveryCodes } from '@/hooks/useRecoveryCodes';
import RecoveryCodes from './RecoveryCodes';

interface TwoFactorSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const TwoFactorSetup = ({ onComplete, onSkip }: TwoFactorSetupProps) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const { toast } = useToast();
  const { codes, generateRecoveryCodes } = useRecoveryCodes();

  useEffect(() => {
    enrollMFA();
  }, []);

  const enrollMFA = async () => {
    setIsEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Admin 2FA'
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to setup 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verifyCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId
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
        factorId: factorId,
        challengeId: challengeData.id,
        code: verifyCode
      });

      if (verifyError) {
        toast({
          title: 'Verification Failed',
          description: 'Invalid code. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Generate recovery codes after successful 2FA setup
      await generateRecoveryCodes();
      setShowRecoveryCodes(true);

      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled. Save your recovery codes!',
      });
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

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isEnrolling) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-primary animate-pulse">Setting up 2FA...</div>
      </div>
    );
  }

  if (showRecoveryCodes && codes.length > 0) {
    return (
      <RecoveryCodes 
        codes={codes} 
        onClose={onComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Setup Two-Factor Authentication</h2>
        <p className="text-muted-foreground text-sm">
          Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
        </p>
      </div>

      {qrCode && (
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg">
            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-muted-foreground text-sm">Or enter this code manually:</Label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-muted p-3 rounded text-sm font-mono text-foreground break-all">
            {secret}
          </code>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={copySecret}
            className="shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="verifyCode" className="text-foreground">Enter 6-digit code</Label>
        <Input
          id="verifyCode"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="bg-muted border-border text-foreground text-center text-2xl tracking-widest"
        />
      </div>

      <div className="space-y-3">
        <Button
          onClick={verifyAndEnable}
          disabled={isVerifying || verifyCode.length !== 6}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isVerifying ? 'Verifying...' : 'Enable 2FA'}
        </Button>
        
        {onSkip && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            className="w-full text-muted-foreground"
          >
            Skip for now
          </Button>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;

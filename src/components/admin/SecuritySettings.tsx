import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMFA } from '@/hooks/useMFA';
import { useRecoveryCodes } from '@/hooks/useRecoveryCodes';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, ShieldOff, Trash2, Key } from 'lucide-react';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import RecoveryCodes from '@/components/auth/RecoveryCodes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SecuritySettings = () => {
  const { isEnabled, loading, refresh } = useMFA();
  const { codes, generateRecoveryCodes, getRemainingCodesCount } = useRecoveryCodes();
  const [showSetup, setShowSetup] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [remainingCodes, setRemainingCodes] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    if (isEnabled) {
      getRemainingCodesCount().then(setRemainingCodes);
    }
  }, [isEnabled]);

  const handleDisable2FA = async () => {
    setIsDisabling(true);
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
      
      if (totpFactor) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: totpFactor.id
        });

        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        // Delete recovery codes when disabling 2FA
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('recovery_codes').delete().eq('user_id', user.id);
        }

        toast({
          title: '2FA Disabled',
          description: 'Two-factor authentication has been disabled',
        });
        refresh();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to disable 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsDisabling(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    refresh();
    getRemainingCodesCount().then(setRemainingCodes);
  };

  const handleViewRecoveryCodes = async () => {
    await generateRecoveryCodes();
    setShowRecoveryCodes(true);
  };

  const handleRegenerateCodes = async () => {
    await generateRecoveryCodes();
    const count = await getRemainingCodesCount();
    setRemainingCodes(count);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-primary animate-pulse">Loading security settings...</div>
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="max-w-md mx-auto">
        <TwoFactorSetup 
          onComplete={handleSetupComplete}
          onSkip={() => setShowSetup(false)}
        />
      </div>
    );
  }

  if (showRecoveryCodes && codes.length > 0) {
    return (
      <div className="max-w-md mx-auto">
        <RecoveryCodes 
          codes={codes}
          onRegenerate={handleRegenerateCodes}
          onClose={() => setShowRecoveryCodes(false)}
          showRegenerateButton
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Security Settings</h2>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {isEnabled ? (
              <ShieldCheck className="w-8 h-8 text-green-500 mt-1" />
            ) : (
              <ShieldOff className="w-8 h-8 text-muted-foreground mt-1" />
            )}
            <div>
              <h3 className="font-semibold text-foreground">Two-Factor Authentication (2FA)</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {isEnabled 
                  ? 'Your account is protected with 2FA. You will need to enter a code from your authenticator app when logging in.'
                  : 'Add an extra layer of security to your account by requiring a code from your authenticator app.'}
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isEnabled 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div>
            {isEnabled ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDisabling}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Disable
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove 2FA protection from your account. You can re-enable it at any time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisable2FA}>
                      Disable 2FA
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                onClick={() => setShowSetup(true)}
                size="sm"
                className="bg-primary text-primary-foreground"
              >
                <Shield className="w-4 h-4 mr-2" />
                Enable 2FA
              </Button>
            )}
          </div>
        </div>
      </div>

      {isEnabled && (
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Key className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">Recovery Codes</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Recovery codes can be used to access your account if you lose your authenticator device.
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    remainingCodes > 3
                      ? 'bg-green-500/20 text-green-500'
                      : remainingCodes > 0
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-destructive/20 text-destructive'
                  }`}>
                    {remainingCodes} codes remaining
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleViewRecoveryCodes}
              variant="outline"
              size="sm"
            >
              <Key className="w-4 h-4 mr-2" />
              View Codes
            </Button>
          </div>
        </div>
      )}

      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <h4 className="font-medium text-foreground text-sm mb-2">Recommended Authenticator Apps:</h4>
        <ul className="text-muted-foreground text-sm space-y-1">
          <li>• Google Authenticator</li>
          <li>• Microsoft Authenticator</li>
          <li>• Authy</li>
          <li>• 1Password</li>
        </ul>
      </div>
    </div>
  );
};

export default SecuritySettings;

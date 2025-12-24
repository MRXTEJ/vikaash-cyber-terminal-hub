import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMFA } from '@/hooks/useMFA';
import { useRecoveryCodes } from '@/hooks/useRecoveryCodes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, ShieldOff, Trash2, Key, UserPlus, Crown, AlertTriangle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SecuritySettings = () => {
  const { isEnabled, loading, refresh } = useMFA();
  const { codes, generateRecoveryCodes, getRemainingCodesCount } = useRecoveryCodes();
  const [showSetup, setShowSetup] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [remainingCodes, setRemainingCodes] = useState<number>(0);
  
  // Admin transfer states
  const [transferEmail, setTransferEmail] = useState('');
  const [transferType, setTransferType] = useState<'full' | 'add'>('add');
  const [isTransferring, setIsTransferring] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  
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

  const handleAdminTransfer = async () => {
    if (!transferEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setIsTransferring(true);
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      // Find the target user by email in profiles
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', transferEmail.trim().toLowerCase())
        .single();

      if (profileError || !targetProfile) {
        toast({
          title: 'User Not Found',
          description: 'No user found with this email address. Make sure they have signed up first.',
          variant: 'destructive',
        });
        return;
      }

      // Check if target user already has admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', targetProfile.user_id)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        toast({
          title: 'Already Admin',
          description: 'This user is already an admin.',
          variant: 'destructive',
        });
        return;
      }

      // Add admin role to target user
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: targetProfile.user_id,
          role: 'admin'
        });

      if (insertError) {
        throw insertError;
      }

      // If full transfer, remove current user's admin role
      if (transferType === 'full') {
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('role', 'admin');

        if (deleteError) {
          throw deleteError;
        }

        toast({
          title: 'Ownership Transferred',
          description: `Admin ownership has been transferred to ${transferEmail}. You will be logged out.`,
        });

        // Sign out after full transfer
        setTimeout(async () => {
          await supabase.auth.signOut();
          window.location.href = '/';
        }, 2000);
      } else {
        toast({
          title: 'Admin Added',
          description: `${transferEmail} has been added as an admin.`,
        });
      }

      setTransferEmail('');
      setShowTransferDialog(false);
    } catch (error: any) {
      toast({
        title: 'Transfer Failed',
        description: error.message || 'Failed to transfer admin rights',
        variant: 'destructive',
      });
    } finally {
      setIsTransferring(false);
    }
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

      {/* Admin Ownership Transfer Section */}
      <div className="bg-terminal-red/5 border border-terminal-red/30 rounded-lg p-6 mt-8">
        <div className="flex items-start gap-4">
          <Crown className="w-8 h-8 text-terminal-red mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-terminal-red flex items-center gap-2">
              Admin Ownership Transfer
              <span className="text-xs bg-terminal-red/20 text-terminal-red px-2 py-0.5 rounded">CRITICAL</span>
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Transfer admin privileges to another user or add a new admin to the system.
            </p>
            
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-email" className="text-foreground">User Email</Label>
                <Input
                  id="transfer-email"
                  type="email"
                  placeholder="Enter user email..."
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  className="bg-background border-terminal-red/30 focus:border-terminal-red"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Transfer Type</Label>
                <Select value={transferType} onValueChange={(v) => setTransferType(v as 'full' | 'add')}>
                  <SelectTrigger className="bg-background border-terminal-red/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-terminal-red/30">
                    <SelectItem value="add">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-terminal-green" />
                        <span>Add Admin (Keep your access)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="full">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-terminal-red" />
                        <span>Full Transfer (Remove your access)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {transferType === 'full' && (
                <div className="bg-terminal-red/10 border border-terminal-red/50 rounded p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-terminal-red flex-shrink-0 mt-0.5" />
                  <p className="text-terminal-red text-sm">
                    <strong>Warning:</strong> Full transfer will remove your admin access and you will be logged out. This action cannot be undone by you.
                  </p>
                </div>
              )}

              <AlertDialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    className={`${
                      transferType === 'full' 
                        ? 'bg-terminal-red hover:bg-terminal-red/80' 
                        : 'bg-terminal-green hover:bg-terminal-green/80'
                    } text-black font-semibold`}
                    disabled={!transferEmail.trim() || isTransferring}
                  >
                    {transferType === 'full' ? (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Transfer Ownership
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Admin
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-terminal-dark border-terminal-red/50">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-terminal-red flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      {transferType === 'full' ? 'Confirm Full Transfer' : 'Confirm Add Admin'}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      {transferType === 'full' 
                        ? `You are about to transfer full admin ownership to ${transferEmail}. You will lose admin access and be logged out.`
                        : `You are about to add ${transferEmail} as an admin. They will have full admin privileges.`
                      }
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-terminal-green/30 hover:bg-terminal-green/10">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleAdminTransfer}
                      disabled={isTransferring}
                      className={`${
                        transferType === 'full'
                          ? 'bg-terminal-red hover:bg-terminal-red/80'
                          : 'bg-terminal-green hover:bg-terminal-green/80'
                      } text-black`}
                    >
                      {isTransferring ? 'Processing...' : 'Confirm'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;

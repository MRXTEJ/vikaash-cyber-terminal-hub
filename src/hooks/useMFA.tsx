import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthenticatorAssuranceLevels } from '@supabase/supabase-js';

interface MFAStatus {
  isEnabled: boolean;
  isVerified: boolean;
  currentLevel: AuthenticatorAssuranceLevels | null;
  nextLevel: AuthenticatorAssuranceLevels | null;
  loading: boolean;
}

export const useMFA = () => {
  const [status, setStatus] = useState<MFAStatus>({
    isEnabled: false,
    isVerified: false,
    currentLevel: null,
    nextLevel: null,
    loading: true,
  });

  const checkMFAStatus = async () => {
    try {
      // Check assurance level
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (aalError) {
        console.error('Error checking AAL:', aalError);
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      // Check if user has enrolled factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        console.error('Error listing factors:', factorsError);
        setStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      const hasVerifiedFactor = factorsData.totp.some(f => f.status === 'verified');
      const isAAL2 = aalData.currentLevel === 'aal2';

      setStatus({
        isEnabled: hasVerifiedFactor,
        isVerified: isAAL2,
        currentLevel: aalData.currentLevel,
        nextLevel: aalData.nextLevel,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking MFA status:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    checkMFAStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkMFAStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { ...status, refresh: checkMFAStatus };
};

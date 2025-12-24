import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate a random recovery code
const generateCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    if (i === 5) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Simple hash function for client-side (the real hash is done server-side)
const simpleHash = async (code: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const useRecoveryCodes = () => {
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateRecoveryCodes = async (): Promise<string[]> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate 10 recovery codes
      const newCodes = Array.from({ length: 10 }, () => generateCode());
      
      // Delete existing codes for this user
      await supabase
        .from('recovery_codes')
        .delete()
        .eq('user_id', user.id);

      // Store hashed codes
      const hashedCodes = await Promise.all(
        newCodes.map(async (code) => ({
          user_id: user.id,
          code_hash: await simpleHash(code),
          used: false,
        }))
      );

      const { error } = await supabase
        .from('recovery_codes')
        .insert(hashedCodes);

      if (error) throw error;

      setCodes(newCodes);
      return newCodes;
    } finally {
      setLoading(false);
    }
  };

  const verifyRecoveryCode = async (code: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const formattedCode = normalizedCode.slice(0, 5) + '-' + normalizedCode.slice(5);
      
      // Use the database function to verify and mark as used
      const { data, error } = await supabase.rpc('verify_recovery_code', {
        _user_id: user.id,
        _code: formattedCode,
      });

      if (error) {
        console.error('Recovery code verification error:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Recovery code verification failed:', error);
      return false;
    }
  };

  const getRemainingCodesCount = async (): Promise<number> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('recovery_codes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('used', false);

      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  };

  return {
    codes,
    loading,
    generateRecoveryCodes,
    verifyRecoveryCode,
    getRemainingCodesCount,
  };
};

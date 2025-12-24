import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type OTPType = 'email' | 'phone';

export const useOTP = () => {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpType, setOtpType] = useState<OTPType | null>(null);

  const sendOTP = async (type: OTPType, destination: string, userId: string) => {
    setIsSending(true);
    try {
      const payload = {
        type,
        userId,
        ...(type === 'email' ? { email: destination } : { phone: destination }),
      };

      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: payload,
      });

      if (error) throw error;

      setOtpSent(true);
      setOtpType(type);
      toast.success(
        type === 'email' 
          ? 'OTP email par bhej diya gaya hai' 
          : 'OTP phone par bhej diya gaya hai'
      );
      return { success: true };
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      toast.error('OTP bhejne mein error: ' + error.message);
      return { success: false, error };
    } finally {
      setIsSending(false);
    }
  };

  const verifyOTP = async (userId: string, code: string) => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { userId, code },
      });

      if (error) throw error;

      if (data.success) {
        toast.success('OTP verify ho gaya!');
        setOtpSent(false);
        setOtpType(null);
        return { success: true };
      } else {
        toast.error(data.error || 'Invalid OTP');
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      toast.error('OTP verify karne mein error: ' + error.message);
      return { success: false, error };
    } finally {
      setIsVerifying(false);
    }
  };

  const resetOTP = () => {
    setOtpSent(false);
    setOtpType(null);
  };

  return {
    sendOTP,
    verifyOTP,
    resetOTP,
    isSending,
    isVerifying,
    otpSent,
    otpType,
  };
};

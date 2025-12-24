import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type OTPType = 'email' | 'phone';

const RESEND_COOLDOWN = 60; // 1 minute in seconds

export const useOTP = () => {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpType, setOtpType] = useState<OTPType | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const sendOTP = async (type: OTPType, destination: string, userId: string) => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds before resending`);
      return { success: false };
    }

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
      setResendTimer(RESEND_COOLDOWN);
      toast.success(
        type === 'email' 
          ? 'OTP sent to your email' 
          : 'OTP sent to your phone'
      );
      return { success: true };
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      toast.error('Failed to send OTP: ' + error.message);
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
        toast.success('OTP verified successfully!');
        setOtpSent(false);
        setOtpType(null);
        setResendTimer(0);
        return { success: true };
      } else {
        toast.error(data.error || 'Invalid OTP');
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      console.error('Failed to verify OTP:', error);
      toast.error('Failed to verify OTP: ' + error.message);
      return { success: false, error };
    } finally {
      setIsVerifying(false);
    }
  };

  const resetOTP = () => {
    setOtpSent(false);
    setOtpType(null);
    setResendTimer(0);
  };

  const canResend = resendTimer === 0;

  return {
    sendOTP,
    verifyOTP,
    resetOTP,
    isSending,
    isVerifying,
    otpSent,
    otpType,
    resendTimer,
    canResend,
  };
};

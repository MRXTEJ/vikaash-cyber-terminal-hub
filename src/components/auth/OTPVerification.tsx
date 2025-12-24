import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Mail, Phone, ArrowLeft, Loader2, Shield } from 'lucide-react';
import { useOTP, OTPType } from '@/hooks/useOTP';

interface OTPVerificationProps {
  userId: string;
  userEmail: string;
  userPhone?: string;
  onVerified: () => void;
  onCancel: () => void;
}

export const OTPVerification = ({
  userId,
  userEmail,
  userPhone,
  onVerified,
  onCancel,
}: OTPVerificationProps) => {
  const { sendOTP, verifyOTP, resetOTP, isSending, isVerifying, otpSent, otpType, resendTimer, canResend } = useOTP();
  const [otpCode, setOtpCode] = useState('');
  const [phoneInput, setPhoneInput] = useState(userPhone || '');
  const [selectedType, setSelectedType] = useState<OTPType | null>(null);

  const handleSendOTP = async (type: OTPType) => {
    const destination = type === 'email' ? userEmail : phoneInput;
    if (!destination) return;
    
    setSelectedType(type);
    await sendOTP(type, destination, userId);
  };

  const handleVerify = async () => {
    if (otpCode.length !== 6) return;
    
    const result = await verifyOTP(userId, otpCode);
    if (result.success) {
      onVerified();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtpCode('');
    if (selectedType) {
      const destination = selectedType === 'email' ? userEmail : phoneInput;
      sendOTP(selectedType, destination, userId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (otpSent && otpType) {
    return (
      <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            OTP Verification
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {otpType === 'email' 
              ? `OTP sent to ${userEmail}`
              : `OTP sent to ${phoneInput}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Label className="text-sm text-muted-foreground">Enter 6-digit OTP code</Label>
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerify}
            disabled={otpCode.length !== 6 || isVerifying}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              onClick={() => {
                resetOTP();
                setOtpCode('');
                setSelectedType(null);
              }}
              className="text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleResend}
              disabled={!canResend || isSending}
              className={`${canResend ? 'text-primary hover:text-primary/80' : 'text-muted-foreground cursor-not-allowed'}`}
            >
              {isSending ? 'Sending...' : canResend ? 'Resend OTP' : `Resend in ${formatTime(resendTimer)}`}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold text-foreground">
          Admin Verification
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Choose an OTP method for additional verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email OTP Option */}
        <Button
          variant="outline"
          onClick={() => handleSendOTP('email')}
          disabled={isSending}
          className="w-full h-auto py-4 justify-start gap-4 border-primary/20 hover:border-primary/50"
        >
          <div className="p-2 rounded-full bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-medium">Email OTP</div>
            <div className="text-xs text-muted-foreground">{userEmail}</div>
          </div>
          {isSending && selectedType === 'email' && (
            <Loader2 className="h-4 w-4 ml-auto animate-spin" />
          )}
        </Button>

        {/* Phone OTP Option */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="+91 9876543210"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => handleSendOTP('phone')}
              disabled={isSending || !phoneInput}
              className="gap-2 border-primary/20 hover:border-primary/50"
            >
              {isSending && selectedType === 'phone' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Phone className="h-4 w-4" />
              )}
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter phone number with country code (e.g., +91...)
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

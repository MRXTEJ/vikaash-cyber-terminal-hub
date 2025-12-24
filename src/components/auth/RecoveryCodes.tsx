import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download, Key, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

interface RecoveryCodesProps {
  codes: string[];
  onRegenerate?: () => Promise<void>;
  onClose?: () => void;
  showRegenerateButton?: boolean;
}

const RecoveryCodes = ({ codes, onRegenerate, onClose, showRegenerateButton = false }: RecoveryCodesProps) => {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const copyAllCodes = () => {
    const text = codes.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied',
      description: 'Recovery codes copied to clipboard',
    });
  };

  const downloadCodes = () => {
    const text = `2FA Recovery Codes\n${'='.repeat(30)}\n\nStore these codes in a safe place. Each code can only be used once.\n\n${codes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-recovery-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded',
      description: 'Recovery codes saved to file',
    });
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      await onRegenerate();
      toast({
        title: 'Codes Regenerated',
        description: 'New recovery codes have been generated. Old codes are now invalid.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate codes',
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Recovery Codes</h2>
        <p className="text-muted-foreground text-sm">
          Save these codes in a safe place. You can use them to access your account if you lose your authenticator device.
        </p>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <div className="grid grid-cols-2 gap-2">
          {codes.map((code, index) => (
            <code 
              key={index}
              className="bg-background p-2 rounded text-sm font-mono text-foreground text-center border border-border"
            >
              {code}
            </code>
          ))}
        </div>
      </div>

      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-destructive text-sm font-medium">
          ⚠️ Each code can only be used once. Store them securely!
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={copyAllCodes}
          variant="outline"
          className="flex-1"
        >
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy All'}
        </Button>
        <Button
          onClick={downloadCodes}
          variant="outline"
          className="flex-1"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {showRegenerateButton && onRegenerate && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Codes
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Regenerate Recovery Codes?</AlertDialogTitle>
              <AlertDialogDescription>
                This will invalidate all existing recovery codes and generate new ones. Make sure to save the new codes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRegenerate} disabled={isRegenerating}>
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {onClose && (
        <Button onClick={onClose} className="w-full bg-primary text-primary-foreground">
          I've Saved My Codes
        </Button>
      )}
    </div>
  );
};

export default RecoveryCodes;

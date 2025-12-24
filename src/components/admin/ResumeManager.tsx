import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Trash2, ExternalLink } from 'lucide-react';

const ResumeManager = () => {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchResumeUrl();
  }, []);

  const fetchResumeUrl = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('file_url')
        .eq('key', 'resume_pdf')
        .maybeSingle();

      if (error) {
        throw error;
      }
      
      setResumeUrl(data?.file_url || null);
    } catch (error) {
      console.error('Error fetching resume URL:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileName = `resume/resume_${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(fileName);

      // Update or insert site_settings
      const { data: existingData } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'resume_pdf')
        .maybeSingle();

      if (existingData) {
        const { error } = await supabase
          .from('site_settings')
          .update({ file_url: publicUrl })
          .eq('key', 'resume_pdf');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'resume_pdf', file_url: publicUrl }]);

        if (error) throw error;
      }

      setResumeUrl(publicUrl);
      toast({ title: 'Success', description: 'Resume uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload resume',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the resume?')) return;

    try {
      const { error } = await supabase
        .from('site_settings')
        .delete()
        .eq('key', 'resume_pdf');

      if (error) throw error;

      setResumeUrl(null);
      toast({ title: 'Success', description: 'Resume deleted successfully!' });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resume',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Manage Resume PDF</h2>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {/* Current Resume */}
        {resumeUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <FileText className="w-10 h-10 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Current Resume</p>
                <p className="text-sm text-muted-foreground truncate max-w-md">
                  {resumeUrl}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(resumeUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <Label className="text-foreground mb-2 block">Upload New Resume (Replace)</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Resume Uploaded</h3>
            <p className="text-muted-foreground mb-6">Upload your resume PDF to make it available for download</p>
            
            <Label className="cursor-pointer">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <Button asChild disabled={uploading}>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Resume PDF'}
                </span>
              </Button>
            </Label>
          </div>
        )}

        {uploading && (
          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Uploading resume...</span>
          </div>
        )}
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2">ℹ️ Information</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Upload your resume as a PDF file (max 10MB)</li>
          <li>• The resume will be available for download on your portfolio</li>
          <li>• Uploading a new resume will replace the existing one</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeManager;

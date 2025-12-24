import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, X, Save, Upload } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string | null;
  credential_url: string | null;
  display_order: number;
}

const CertificatesManager = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    date: '',
    description: '',
    credential_url: '',
    display_order: 0,
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch certificates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      issuer: '',
      date: '',
      description: '',
      credential_url: '',
      display_order: 0,
    });
    setEditingCertificate(null);
    setIsCreating(false);
  };

  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      title: certificate.title,
      issuer: certificate.issuer,
      date: certificate.date,
      description: certificate.description || '',
      credential_url: certificate.credential_url || '',
      display_order: certificate.display_order || 0,
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
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

    setUploading(true);
    try {
      const fileName = `certificates/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(fileName);

      setFormData({ ...formData, credential_url: publicUrl });
      toast({ title: 'Success', description: 'PDF uploaded successfully' });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const certificateData = {
        title: formData.title,
        issuer: formData.issuer,
        date: formData.date,
        description: formData.description || null,
        credential_url: formData.credential_url || null,
        display_order: formData.display_order,
      };

      if (editingCertificate) {
        const { error } = await supabase
          .from('certificates')
          .update(certificateData)
          .eq('id', editingCertificate.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Certificate updated successfully' });
      } else {
        const { error } = await supabase
          .from('certificates')
          .insert([certificateData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Certificate created successfully' });
      }

      resetForm();
      fetchCertificates();
    } catch (error) {
      console.error('Error saving certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to save certificate',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Certificate deleted successfully' });
      fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete certificate',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading certificates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Manage Certificates</h2>
        <Button onClick={handleCreate} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Certificate
        </Button>
      </div>

      {/* Form */}
      {(isCreating || editingCertificate) && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {editingCertificate ? 'Edit Certificate' : 'New Certificate'}
            </h3>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Certificate title"
              />
            </div>

            <div className="space-y-2">
              <Label>Issuer</Label>
              <Input
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="Issuing organization"
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="e.g., December 2024"
              />
            </div>

            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Certificate description"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Credential URL (or upload PDF)</Label>
              <Input
                value={formData.credential_url}
                onChange={(e) => setFormData({ ...formData, credential_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Certificate PDF</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
                />
                {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save Certificate
          </Button>
        </div>
      )}

      {/* Certificates List */}
      <div className="grid gap-4">
        {certificates.map((certificate) => (
          <div key={certificate.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{certificate.title}</h3>
              <p className="text-sm text-muted-foreground">{certificate.issuer} • {certificate.date}</p>
              {certificate.credential_url && (
                <a 
                  href={certificate.credential_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-secondary hover:underline"
                >
                  View Credential →
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(certificate)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(certificate.id)} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {certificates.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No certificates yet. Click "Add Certificate" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesManager;

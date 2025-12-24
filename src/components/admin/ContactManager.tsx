import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, X } from 'lucide-react';

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface ContactData {
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  linkedinUsername: string;
  responseTime: string;
  preferredContact: string;
  socialLinks: SocialLink[];
}

const ContactManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ContactData>({
    email: 'vikash.tripathi@example.com',
    phone: '+91 XXXXX XXXXX',
    location: 'India',
    linkedinUrl: 'https://www.linkedin.com/in/vikash-tripathi80',
    linkedinUsername: '/in/vikash-tripathi80',
    responseTime: 'Usually within 24 hours',
    preferredContact: 'LinkedIn/Email',
    socialLinks: [
      { name: 'LinkedIn', url: 'https://www.linkedin.com/in/vikash-tripathi80', icon: '💼' },
      { name: 'GitHub', url: '#', icon: '📁' },
      { name: 'Twitter', url: '#', icon: '🐦' },
      { name: 'Email', url: 'mailto:vikash@example.com', icon: '📧' },
    ],
  });

  const [newSocial, setNewSocial] = useState({ name: '', url: '', icon: '🔗' });

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'contact_data')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value) {
        setFormData(JSON.parse(data.value));
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'contact_data')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: JSON.stringify(formData) })
          .eq('key', 'contact_data');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ key: 'contact_data', value: JSON.stringify(formData) });
        if (error) throw error;
      }

      toast({ title: 'Success', description: 'Contact section updated successfully' });
    } catch (error) {
      console.error('Error saving contact data:', error);
      toast({ title: 'Error', description: 'Failed to save changes', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    if (newSocial.name.trim() && newSocial.url.trim()) {
      setFormData({ ...formData, socialLinks: [...formData.socialLinks, { ...newSocial }] });
      setNewSocial({ name: '', url: '', icon: '🔗' });
    }
  };

  const removeSocialLink = (index: number) => {
    setFormData({ ...formData, socialLinks: formData.socialLinks.filter((_, i) => i !== index) });
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updated = [...formData.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, socialLinks: updated });
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading contact data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Manage Contact Section</h2>
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {/* Basic Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>LinkedIn URL</Label>
            <Input
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn Username</Label>
            <Input
              value={formData.linkedinUsername}
              onChange={(e) => setFormData({ ...formData, linkedinUsername: e.target.value })}
              placeholder="/in/username"
            />
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Response Time</Label>
            <Input
              value={formData.responseTime}
              onChange={(e) => setFormData({ ...formData, responseTime: e.target.value })}
              placeholder="Usually within 24 hours"
            />
          </div>
          <div className="space-y-2">
            <Label>Preferred Contact Method</Label>
            <Input
              value={formData.preferredContact}
              onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
              placeholder="LinkedIn/Email"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <Label>Social Links</Label>
          <div className="space-y-2">
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                <Input
                  value={link.icon}
                  onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                  className="w-16 text-center"
                  placeholder="🔗"
                />
                <Input
                  value={link.name}
                  onChange={(e) => updateSocialLink(index, 'name', e.target.value)}
                  placeholder="Platform name"
                  className="w-32"
                />
                <Input
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  placeholder="URL"
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => removeSocialLink(index)} className="text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newSocial.icon}
              onChange={(e) => setNewSocial({ ...newSocial, icon: e.target.value })}
              placeholder="🔗"
              className="w-16 text-center"
            />
            <Input
              value={newSocial.name}
              onChange={(e) => setNewSocial({ ...newSocial, name: e.target.value })}
              placeholder="Platform"
              className="w-32"
            />
            <Input
              value={newSocial.url}
              onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
              placeholder="URL"
              className="flex-1"
            />
            <Button onClick={addSocialLink} variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;

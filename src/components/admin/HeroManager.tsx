import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, X } from 'lucide-react';

interface HeroData {
  firstName: string;
  lastName: string;
  skills: string[];
  bio: string;
  linkedinUrl: string;
  linkedinUsername: string;
  specialization: string;
  status: string;
}

const HeroManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState<HeroData>({
    firstName: 'VIKASH',
    lastName: 'TRIPATHI',
    skills: ['Ethical Hacker', 'Cybersecurity Specialist', 'Penetration Tester', 'Security Analyst'],
    bio: 'Cybersecurity professional with expertise in ethical hacking, penetration testing, and vulnerability assessment. Passionate about securing digital infrastructure and protecting organizations against evolving cyber threats.',
    linkedinUrl: 'https://www.linkedin.com/in/vikash-tripathi80',
    linkedinUsername: '/in/vikash-tripathi80',
    specialization: 'Cybersecurity',
    status: 'Available for Opportunities',
  });

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'hero_data')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value) {
        setFormData(JSON.parse(data.value));
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
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
        .eq('key', 'hero_data')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: JSON.stringify(formData) })
          .eq('key', 'hero_data');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ key: 'hero_data', value: JSON.stringify(formData) });
        if (error) throw error;
      }

      toast({ title: 'Success', description: 'Hero section updated successfully' });
    } catch (error) {
      console.error('Error saving hero data:', error);
      toast({ title: 'Error', description: 'Failed to save changes', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) });
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading hero data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Manage Hero Section</h2>
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="First name"
            />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Last name"
            />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label>Rotating Skills (shown in hero)</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-1 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                {skill}
                <button onClick={() => removeSkill(index)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add new skill"
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            />
            <Button onClick={addSkill} variant="outline" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label>Bio/Description</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Your bio"
            rows={4}
          />
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

        {/* Professional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Specialization</Label>
            <Input
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g., Cybersecurity"
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Input
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              placeholder="e.g., Available for Opportunities"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroManager;

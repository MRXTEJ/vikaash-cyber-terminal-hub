import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, X, Pencil } from 'lucide-react';

interface Skill {
  name: string;
  level: number;
}

interface AboutData {
  bio1: string;
  bio2: string;
  skills: Skill[];
  tools: string[];
}

const AboutManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTool, setNewTool] = useState('');
  const [editingSkill, setEditingSkill] = useState<number | null>(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(75);
  const { toast } = useToast();

  const [formData, setFormData] = useState<AboutData>({
    bio1: "I'm a passionate cybersecurity enthusiast with a strong foundation in ethical hacking and penetration testing. My journey began with a curiosity about how systems work and evolved into a mission to protect them from malicious actors.",
    bio2: "Currently focusing on expanding my knowledge in advanced persistent threats, cloud security, and IoT security. I believe in continuous learning and staying updated with the latest security trends and vulnerabilities.",
    skills: [
      { name: 'Penetration Testing', level: 90 },
      { name: 'Network Security', level: 85 },
      { name: 'Vulnerability Assessment', level: 88 },
      { name: 'Incident Response', level: 75 },
      { name: 'Digital Forensics', level: 80 },
      { name: 'Malware Analysis', level: 70 },
    ],
    tools: ['Kali Linux', 'Metasploit', 'Burp Suite', 'Nmap', 'Wireshark', 'OWASP ZAP', 'Nessus', 'Nikto', 'Aircrack-ng', 'John the Ripper'],
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'about_data')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value) {
        setFormData(JSON.parse(data.value));
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
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
        .eq('key', 'about_data')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: JSON.stringify(formData) })
          .eq('key', 'about_data');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ key: 'about_data', value: JSON.stringify(formData) });
        if (error) throw error;
      }

      toast({ title: 'Success', description: 'About section updated successfully' });
    } catch (error) {
      console.error('Error saving about data:', error);
      toast({ title: 'Error', description: 'Failed to save changes', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addTool = () => {
    if (newTool.trim() && !formData.tools.includes(newTool.trim())) {
      setFormData({ ...formData, tools: [...formData.tools, newTool.trim()] });
      setNewTool('');
    }
  };

  const removeTool = (index: number) => {
    setFormData({ ...formData, tools: formData.tools.filter((_, i) => i !== index) });
  };

  const addSkill = () => {
    if (newSkillName.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, { name: newSkillName.trim(), level: newSkillLevel }] });
      setNewSkillName('');
      setNewSkillLevel(75);
    }
  };

  const removeSkill = (index: number) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== index) });
  };

  const updateSkill = (index: number, field: 'name' | 'level', value: string | number) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setFormData({ ...formData, skills: updatedSkills });
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading about data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Manage About Section</h2>
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {/* Bio */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Bio Paragraph 1</Label>
            <Textarea
              value={formData.bio1}
              onChange={(e) => setFormData({ ...formData, bio1: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Bio Paragraph 2</Label>
            <Textarea
              value={formData.bio2}
              onChange={(e) => setFormData({ ...formData, bio2: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <Label>Technical Skills</Label>
          <div className="space-y-2">
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                <Input
                  value={skill.name}
                  onChange={(e) => updateSkill(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={skill.level}
                  onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value) || 0)}
                  className="w-20"
                  min={0}
                  max={100}
                />
                <span className="text-sm text-muted-foreground">%</span>
                <Button variant="ghost" size="sm" onClick={() => removeSkill(index)} className="text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Skill name"
              className="flex-1"
            />
            <Input
              type="number"
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(parseInt(e.target.value) || 75)}
              className="w-20"
              min={0}
              max={100}
            />
            <Button onClick={addSkill} variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        {/* Tools */}
        <div className="space-y-2">
          <Label>Security Tools</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tools.map((tool, index) => (
              <div key={index} className="flex items-center gap-1 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                {tool}
                <button onClick={() => removeTool(index)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              placeholder="Add new tool"
              onKeyPress={(e) => e.key === 'Enter' && addTool()}
            />
            <Button onClick={addTool} variant="outline" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutManager;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  image_url: string | null;
  live_url: string | null;
  source_url: string | null;
  featured: boolean;
  display_order: number;
}

const ProjectsManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: 'Session Expired',
        description: 'Please login again to make changes',
        variant: 'destructive',
      });
      navigate('/auth');
      return false;
    }
    return true;
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tech_stack: '',
    image_url: '',
    live_url: '',
    source_url: '',
    featured: false,
    display_order: 0,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tech_stack: '',
      image_url: '',
      live_url: '',
      source_url: '',
      featured: false,
      display_order: 0,
    });
    setEditingProject(null);
    setIsCreating(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      tech_stack: project.tech_stack.join(', '),
      image_url: project.image_url || '',
      live_url: project.live_url || '',
      source_url: project.source_url || '',
      featured: project.featured || false,
      display_order: project.display_order || 0,
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!(await checkSession())) return;

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        tech_stack: formData.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
        image_url: formData.image_url || null,
        live_url: formData.live_url || null,
        source_url: formData.source_url || null,
        featured: formData.featured,
        display_order: formData.display_order,
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Project updated successfully' });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Project created successfully' });
      }

      resetForm();
      fetchProjects();
    } catch (error: any) {
      console.error('Error saving project:', error);
      if (error?.code === '42501' || error?.message?.includes('policy')) {
        toast({
          title: 'Permission Denied',
          description: 'Your session may have expired. Please login again.',
          variant: 'destructive',
        });
        navigate('/auth');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save project',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    if (!(await checkSession())) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Project deleted successfully' });
      fetchProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      if (error?.code === '42501' || error?.message?.includes('policy')) {
        toast({
          title: 'Permission Denied',
          description: 'Your session may have expired. Please login again.',
          variant: 'destructive',
        });
        navigate('/auth');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete project',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Manage Projects</h2>
        <Button onClick={handleCreate} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Form */}
      {(isCreating || editingProject) && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {editingProject ? 'Edit Project' : 'New Project'}
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
                placeholder="Project title"
              />
            </div>

            <div className="space-y-2">
              <Label>Tech Stack (comma separated)</Label>
              <Input
                value={formData.tech_stack}
                onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                placeholder="React, TypeScript, Supabase"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Project description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Live URL</Label>
              <Input
                value={formData.live_url}
                onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Source URL</Label>
              <Input
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                placeholder="https://github.com/..."
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

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label>Featured Project</Label>
            </div>
          </div>

          <Button onClick={handleSave} className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save Project
          </Button>
        </div>
      )}

      {/* Projects List */}
      <div className="grid gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{project.title}</h3>
                {project.featured && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Featured</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
              <div className="flex gap-2 mt-2">
                {project.tech_stack.slice(0, 3).map((tech, idx) => (
                  <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">{tech}</span>
                ))}
                {project.tech_stack.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{project.tech_stack.length - 3} more</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No projects yet. Click "Add Project" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsManager;

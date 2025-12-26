import { useState, useEffect, useCallback } from 'react';
import TerminalWindow from './TerminalWindow';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/useTheme';

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_url: string | null;
  source_url: string | null;
  featured: boolean;
  display_order: number;
}

const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
      // Keep selected index valid after list changes
      setSelectedProject((prev) => Math.min(prev, Math.max((data?.length ?? 1) - 1, 0)));
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Realtime subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('projects-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProjects]);

  const handleViewCode = (sourceUrl: string | null) => {
    if (sourceUrl) {
      window.open(sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLiveDemo = (liveUrl: string | null) => {
    if (liveUrl) {
      window.open(liveUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('Demo not available for this project yet.');
    }
  };

  if (loading) {
    return (
      <section id="projects" className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className={`animate-pulse text-sm sm:text-base ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section id="projects" className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-terminal-green glow-text' : 'text-primary'}`}>
              &lt; Projects /&gt;
            </h2>
            <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>No projects available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  const currentProject = projects[selectedProject];

  return (
    <section id="projects" className="py-12 sm:py-16 lg:py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 ${theme === 'dark' ? 'text-terminal-green glow-text' : 'text-primary'}`}>
            &lt; Projects /&gt;
          </h2>
          <p className={`text-base sm:text-lg lg:text-xl ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>
            Security research and development
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Project List */}
          <div className="lg:col-span-1">
            <TerminalWindow title="projects.list">
              <div className="space-y-2">
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(index)}
                    className={`cursor-pointer p-2 rounded transition-all duration-300 ${
                      selectedProject === index 
                        ? theme === 'dark' ? 'bg-terminal-green text-terminal-dark' : 'bg-primary text-primary-foreground'
                        : theme === 'dark' ? 'hover:bg-terminal-gray' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-mono truncate mr-2">
                        {String(index + 1).padStart(2, '0')}. {project.title}
                      </span>
                      {project.featured && (
                        <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${theme === 'dark' ? 'bg-terminal-red text-white' : 'bg-destructive text-destructive-foreground'}`}>
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TerminalWindow>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            <div className={`cyber-card h-full ${theme === 'light' ? 'bg-card border-border' : ''}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <h3 className={`text-lg sm:text-xl lg:text-2xl ${theme === 'dark' ? 'text-terminal-cyan glow-text' : 'text-secondary font-semibold'}`}>
                  {currentProject.title}
                </h3>
                {currentProject.featured && (
                  <span className={`px-3 py-1 rounded text-xs ${theme === 'dark' ? 'bg-terminal-red text-white' : 'bg-destructive text-destructive-foreground'}`}>
                    Featured
                  </span>
                )}
              </div>

              <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>
                {currentProject.description}
              </p>

              <div className="mb-4 sm:mb-6">
                <h4 className={`mb-2 sm:mb-3 text-sm sm:text-base ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>Technologies Used:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentProject.tech_stack.map((tech, index) => (
                    <span 
                      key={index}
                      className={`border px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                        theme === 'dark' 
                          ? 'bg-terminal-gray border-terminal-cyan' 
                          : 'bg-muted border-secondary/30 text-foreground'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => handleViewCode(currentProject.source_url)}
                  className={`cyber-card border transition-all duration-300 px-4 sm:px-6 py-2 rounded text-sm sm:text-base ${
                    currentProject.source_url 
                      ? theme === 'dark' 
                        ? 'border-terminal-green hover:bg-terminal-green hover:text-terminal-dark'
                        : 'border-primary hover:bg-primary hover:text-primary-foreground bg-card'
                      : 'border-muted-foreground/30 text-muted-foreground cursor-not-allowed'
                  }`}
                  disabled={!currentProject.source_url}
                >
                  View Code
                </button>
                <button 
                  onClick={() => handleLiveDemo(currentProject.live_url)}
                  className={`cyber-card border transition-all duration-300 px-4 sm:px-6 py-2 rounded text-sm sm:text-base ${
                    currentProject.live_url 
                      ? theme === 'dark' 
                        ? 'border-terminal-cyan hover:bg-terminal-cyan hover:text-terminal-dark'
                        : 'border-secondary hover:bg-secondary hover:text-secondary-foreground bg-card'
                      : 'border-muted-foreground/30 text-muted-foreground cursor-not-allowed'
                  }`}
                  disabled={!currentProject.live_url}
                >
                  Live Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;

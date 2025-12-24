import { useState, useEffect } from 'react';
import TerminalWindow from './TerminalWindow';
import { supabase } from '@/integrations/supabase/client';

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
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-terminal-green animate-pulse text-sm sm:text-base">Loading projects...</p>
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-terminal-green glow-text mb-4">
              &lt; Projects /&gt;
            </h2>
            <p className="text-terminal-cyan text-sm sm:text-base">No projects available yet.</p>
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
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-terminal-green glow-text mb-2 sm:mb-4">
            &lt; Projects /&gt;
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-terminal-cyan">
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
                        ? 'bg-terminal-green text-terminal-dark' 
                        : 'hover:bg-terminal-gray'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-mono truncate mr-2">
                        {String(index + 1).padStart(2, '0')}. {project.title}
                      </span>
                      {project.featured && (
                        <span className="text-xs px-2 py-1 rounded bg-terminal-red text-white flex-shrink-0">
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
            <div className="cyber-card h-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <h3 className="text-lg sm:text-xl lg:text-2xl text-terminal-cyan glow-text">
                  {currentProject.title}
                </h3>
                {currentProject.featured && (
                  <span className="px-3 py-1 rounded text-xs bg-terminal-red text-white">
                    Featured
                  </span>
                )}
              </div>

              <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                {currentProject.description}
              </p>

              <div className="mb-4 sm:mb-6">
                <h4 className="text-terminal-green mb-2 sm:mb-3 text-sm sm:text-base">Technologies Used:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentProject.tech_stack.map((tech, index) => (
                    <span 
                      key={index}
                      className="bg-terminal-gray border border-terminal-cyan px-2 sm:px-3 py-1 rounded text-xs sm:text-sm"
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
                      ? 'border-terminal-green hover:bg-terminal-green hover:text-terminal-dark'
                      : 'border-gray-500 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!currentProject.source_url}
                >
                  View Code
                </button>
                <button 
                  onClick={() => handleLiveDemo(currentProject.live_url)}
                  className={`cyber-card border transition-all duration-300 px-4 sm:px-6 py-2 rounded text-sm sm:text-base ${
                    currentProject.live_url 
                      ? 'border-terminal-cyan hover:bg-terminal-cyan hover:text-terminal-dark'
                      : 'border-gray-500 text-gray-500 cursor-not-allowed'
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

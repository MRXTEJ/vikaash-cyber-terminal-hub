
import { useState } from 'react';
import TerminalWindow from './TerminalWindow';

const ProjectsSection = () => {
  const [selectedProject, setSelectedProject] = useState(0);

  const projects = [
    {
      id: 1,
      title: 'Network Vulnerability Scanner',
      description: 'Custom Python-based network scanner for identifying security vulnerabilities',
      technologies: ['Python', 'Nmap', 'Scapy', 'Flask'],
      features: [
        'Port scanning and service detection',
        'Vulnerability database integration',
        'Automated report generation',
        'Web-based dashboard'
      ],
      status: 'Completed',
      github: 'https://github.com/vikash-tripathi/network-scanner',
      demo: 'https://network-scanner-demo.vercel.app'
    },
    {
      id: 2,
      title: 'Web Application Penetration Testing',
      description: 'Comprehensive security assessment of e-commerce platform',
      technologies: ['Burp Suite', 'OWASP ZAP', 'SQLMap', 'XSStrike'],
      features: [
        'SQL injection testing',
        'XSS vulnerability assessment',
        'Authentication bypass attempts',
        'Session management analysis'
      ],
      status: 'Completed',
      github: 'https://github.com/vikash-tripathi/webapp-pentest',
      demo: 'https://pentest-report.netlify.app'
    },
    {
      id: 3,
      title: 'Malware Analysis Lab',
      description: 'Isolated environment for analyzing malicious software samples',
      technologies: ['VirtualBox', 'Wireshark', 'IDA Pro', 'Ghidra'],
      features: [
        'Sandbox environment setup',
        'Dynamic analysis tools',
        'Network traffic monitoring',
        'Reverse engineering workflow'
      ],
      status: 'In Progress',
      github: 'https://github.com/vikash-tripathi/malware-lab',
      demo: null
    },
    {
      id: 4,
      title: 'Incident Response Automation',
      description: 'Automated incident response system for rapid threat containment',
      technologies: ['Python', 'SIEM', 'APIs', 'Docker'],
      features: [
        'Automated threat detection',
        'Incident classification',
        'Response playbooks',
        'Forensic data collection'
      ],
      status: 'Planning',
      github: 'https://github.com/vikash-tripathi/incident-response',
      demo: null
    }
  ];

  const handleViewCode = (github: string) => {
    window.open(github, '_blank', 'noopener,noreferrer');
  };

  const handleLiveDemo = (demo: string | null) => {
    if (demo) {
      window.open(demo, '_blank', 'noopener,noreferrer');
    } else {
      alert('Demo not available for this project yet.');
    }
  };

  return (
    <section id="projects" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-terminal-green glow-text mb-4">
            &lt; Projects /&gt;
          </h2>
          <p className="text-xl text-terminal-cyan">
            Security research and development
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      <span className="text-sm font-mono">
                        {String(index + 1).padStart(2, '0')}. {project.title}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        project.status === 'Completed' ? 'bg-green-600' :
                        project.status === 'In Progress' ? 'bg-yellow-600' :
                        'bg-blue-600'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TerminalWindow>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            <div className="cyber-card h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl text-terminal-cyan glow-text">
                  {projects[selectedProject].title}
                </h3>
                <span className={`px-3 py-1 rounded text-xs ${
                  projects[selectedProject].status === 'Completed' ? 'bg-green-600' :
                  projects[selectedProject].status === 'In Progress' ? 'bg-yellow-600' :
                  'bg-blue-600'
                }`}>
                  {projects[selectedProject].status}
                </span>
              </div>

              <p className="text-gray-300 mb-6">
                {projects[selectedProject].description}
              </p>

              <div className="mb-6">
                <h4 className="text-terminal-green mb-3">Technologies Used:</h4>
                <div className="flex flex-wrap gap-2">
                  {projects[selectedProject].technologies.map((tech, index) => (
                    <span 
                      key={index}
                      className="bg-terminal-gray border border-terminal-cyan px-3 py-1 rounded text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-terminal-green mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {projects[selectedProject].features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-terminal-cyan mr-2">&gt;</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleViewCode(projects[selectedProject].github)}
                  className="cyber-card border border-terminal-green hover:bg-terminal-green hover:text-terminal-dark transition-all duration-300 px-6 py-2 rounded"
                >
                  View Code
                </button>
                <button 
                  onClick={() => handleLiveDemo(projects[selectedProject].demo)}
                  className={`cyber-card border transition-all duration-300 px-6 py-2 rounded ${
                    projects[selectedProject].demo 
                      ? 'border-terminal-cyan hover:bg-terminal-cyan hover:text-terminal-dark'
                      : 'border-gray-500 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!projects[selectedProject].demo}
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

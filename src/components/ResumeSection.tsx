
import TerminalWindow from './TerminalWindow';

const ResumeSection = () => {
  const experience = [
    {
      title: 'Junior Security Analyst',
      company: 'SecureTech Solutions',
      period: '2023 - Present',
      responsibilities: [
        'Conducted vulnerability assessments on client networks',
        'Performed penetration testing on web applications',
        'Developed security documentation and incident response procedures',
        'Collaborated with development teams to remediate security issues'
      ]
    },
    {
      title: 'Cybersecurity Intern',
      company: 'TechGuard Inc.',
      period: '2022 - 2023',
      responsibilities: [
        'Assisted in security monitoring and analysis',
        'Supported malware analysis and threat hunting activities',
        'Helped maintain security tools and systems',
        'Participated in security awareness training programs'
      ]
    }
  ];

  const education = [
    {
      degree: 'Bachelor of Technology in Computer Science',
      institution: 'Indian Institute of Technology',
      year: '2020 - 2024',
      grade: '8.2 CGPA'
    },
    {
      degree: 'Higher Secondary Education',
      institution: 'Central Board of Secondary Education',
      year: '2018 - 2020',
      grade: '88.5%'
    }
  ];

  const handleDownloadResume = () => {
    // Create a dummy PDF download
    const link = document.createElement('a');
    link.href = '#'; // Replace with actual resume PDF URL
    link.download = 'Vikash_Tripathi_Resume.pdf';
    link.click();
    
    // Show a message since we don't have an actual PDF
    alert('Resume download will start shortly. Please contact for the actual PDF file.');
  };

  const handleEmailResume = () => {
    const subject = encodeURIComponent('Resume Request - Vikash Tripathi');
    const body = encodeURIComponent('Hello Vikash,\n\nI would like to request your resume for review.\n\nBest regards,');
    const mailtoLink = `mailto:vikash.tripathi@example.com?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;
  };

  return (
    <section id="resume" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-terminal-green glow-text mb-4">
            &lt; Resume /&gt;
          </h2>
          <p className="text-xl text-terminal-cyan">
            Professional experience and education
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Experience */}
          <div>
            <TerminalWindow title="experience.log">
              <div className="space-y-6">
                <div className="text-terminal-cyan mb-4">
                  cat work_experience.txt
                </div>
                {experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-terminal-green pl-4">
                    <h3 className="text-terminal-cyan text-lg font-bold">{exp.title}</h3>
                    <p className="text-terminal-green">{exp.company}</p>
                    <p className="text-gray-400 text-sm mb-3">{exp.period}</p>
                    <ul className="space-y-1">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx} className="text-gray-300 text-sm">
                          <span className="text-terminal-cyan">&gt; </span>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </TerminalWindow>
          </div>

          {/* Education & Skills */}
          <div className="space-y-8">
            {/* Education */}
            <TerminalWindow title="education.txt">
              <div className="space-y-4">
                <div className="text-terminal-cyan mb-4">
                  grep -i "education" profile.txt
                </div>
                {education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-terminal-cyan pl-4">
                    <h3 className="text-terminal-green text-lg font-bold">{edu.degree}</h3>
                    <p className="text-white">{edu.institution}</p>
                    <div className="flex justify-between">
                      <p className="text-gray-400 text-sm">{edu.year}</p>
                      <p className="text-terminal-cyan text-sm">{edu.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TerminalWindow>

            {/* Download Resume */}
            <div className="cyber-card text-center">
              <h3 className="text-terminal-cyan text-xl mb-4 glow-text">Download Resume</h3>
              <p className="text-gray-300 mb-6">
                Get the complete PDF version of my resume with detailed information 
                about my experience, skills, and achievements.
              </p>
              <div className="space-y-4">
                <button 
                  onClick={handleDownloadResume}
                  className="cyber-card border border-terminal-green hover:bg-terminal-green hover:text-terminal-dark transition-all duration-300 px-8 py-3 rounded-lg w-full glow-border"
                >
                  <span className="mr-2">📄</span>
                  Download PDF Resume
                </button>
                <button 
                  onClick={handleEmailResume}
                  className="cyber-card border border-terminal-cyan hover:bg-terminal-cyan hover:text-terminal-dark transition-all duration-300 px-8 py-3 rounded-lg w-full"
                >
                  <span className="mr-2">📧</span>
                  Email Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeSection;

import { useState, useEffect, useCallback } from 'react';
import TerminalWindow from './TerminalWindow';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';

const ResumeSection = () => {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  const fetchResumeUrl = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('file_url')
        .eq('key', 'resume_pdf')
        .maybeSingle();

      if (error) {
        console.error('Error fetching resume:', error);
      }
      
      setResumeUrl(data?.file_url || null);
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  }, []);

  useEffect(() => {
    fetchResumeUrl();
  }, [fetchResumeUrl]);

  // Realtime subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('resume-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'key=eq.resume_pdf',
        },
        () => {
          fetchResumeUrl();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchResumeUrl]);

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

  const handleDownloadResume = async () => {
    if (resumeUrl) {
      // Log the download activity
      try {
        await supabase.from('activity_log').insert({
          activity_type: 'resume_download',
          title: 'Resume Downloaded',
          description: 'Someone downloaded your resume',
          metadata: { url: resumeUrl },
        });
      } catch (error) {
        console.error('Error logging activity:', error);
      }
      
      window.open(resumeUrl, '_blank');
    } else {
      toast({
        title: 'Resume Not Available',
        description: 'Resume PDF has not been uploaded yet.',
        variant: 'destructive',
      });
    }
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
          <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-terminal-green glow-text' : 'text-primary'}`}>
            &lt; Resume /&gt;
          </h2>
          <p className={`text-xl ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>
            Professional experience and education
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Experience */}
          <div>
            <TerminalWindow title="experience.log">
              <div className="space-y-6">
                <div className={`mb-4 ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>
                  cat work_experience.txt
                </div>
                {experience.map((exp, index) => (
                  <div key={index} className={`border-l-2 pl-4 ${theme === 'dark' ? 'border-terminal-green' : 'border-primary'}`}>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>{exp.title}</h3>
                    <p className={theme === 'dark' ? 'text-terminal-green' : 'text-primary'}>{exp.company}</p>
                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>{exp.period}</p>
                    <ul className="space-y-1">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx} className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>
                          <span className={theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}>&gt; </span>
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
                <div className={`mb-4 ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>
                  grep -i "education" profile.txt
                </div>
                {education.map((edu, index) => (
                  <div key={index} className={`border-l-2 pl-4 ${theme === 'dark' ? 'border-terminal-cyan' : 'border-secondary'}`}>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>{edu.degree}</h3>
                    <p className={theme === 'dark' ? 'text-foreground' : 'text-foreground'}>{edu.institution}</p>
                    <div className="flex justify-between">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>{edu.year}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>{edu.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TerminalWindow>

            {/* Download Resume */}
            <div className={`cyber-card text-center ${theme === 'light' ? 'bg-card border-border' : ''}`}>
              <h3 className={`text-xl mb-4 ${theme === 'dark' ? 'text-terminal-cyan glow-text' : 'text-secondary font-semibold'}`}>Download Resume</h3>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>
                Get the complete PDF version of my resume with detailed information 
                about my experience, skills, and achievements.
              </p>
              <div className="space-y-4">
                <button 
                  onClick={handleDownloadResume}
                  className={`cyber-card border transition-all duration-300 px-8 py-3 rounded-lg w-full ${
                    resumeUrl 
                      ? theme === 'dark' 
                        ? 'border-terminal-green hover:bg-terminal-green hover:text-terminal-dark glow-border' 
                        : 'border-primary hover:bg-primary hover:text-primary-foreground bg-card'
                      : 'border-muted-foreground/30 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!resumeUrl}
                >
                  <span className="mr-2">📄</span>
                  {resumeUrl ? 'Download PDF Resume' : 'Resume Not Available'}
                </button>
                <button 
                  onClick={handleEmailResume}
                  className={`cyber-card border transition-all duration-300 px-8 py-3 rounded-lg w-full ${
                    theme === 'dark' 
                      ? 'border-terminal-cyan hover:bg-terminal-cyan hover:text-terminal-dark' 
                      : 'border-secondary hover:bg-secondary hover:text-secondary-foreground bg-card'
                  }`}
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

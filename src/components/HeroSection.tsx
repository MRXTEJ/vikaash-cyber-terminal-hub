import { useState, useEffect, useCallback } from 'react';
import TypeWriter from './TypeWriter';
import TerminalWindow from './TerminalWindow';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/useTheme';

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

const defaultHeroData: HeroData = {
  firstName: 'VIKASH',
  lastName: 'TRIPATHI',
  skills: ['Ethical Hacker', 'Cybersecurity Specialist', 'Penetration Tester', 'Security Analyst'],
  bio: 'Cybersecurity professional with expertise in ethical hacking, penetration testing, and vulnerability assessment. Passionate about securing digital infrastructure and protecting organizations against evolving cyber threats.',
  linkedinUrl: 'https://www.linkedin.com/in/vikash-tripathi80',
  linkedinUsername: '/in/vikash-tripathi80',
  specialization: 'Cybersecurity',
  status: 'Available for Opportunities',
};

const HeroSection = () => {
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showThirdLine, setShowThirdLine] = useState(false);
  const [heroData, setHeroData] = useState<HeroData>(defaultHeroData);
  const [currentSkill, setCurrentSkill] = useState(0);
  const { theme } = useTheme();

  const fetchHeroData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_data')
        .maybeSingle();

      if (error) throw error;
      if (data?.value) {
        setHeroData(JSON.parse(data.value));
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
    }
  }, []);

  useEffect(() => {
    fetchHeroData();
  }, [fetchHeroData]);

  // Realtime subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('hero-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'key=eq.hero_data',
        },
        () => {
          fetchHeroData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHeroData]);

  // Animate through skills
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSkill((prev) => (prev + 1) % heroData.skills.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroData.skills.length]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const downloadResume = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${heroData.firstName}_${heroData.lastName}_Resume.pdf`;
    link.click();
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* 3D Floating Elements */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute top-20 left-4 md:left-10 w-12 md:w-20 h-12 md:h-20 border rounded-lg animate-float opacity-20 ${theme === 'dark' ? 'border-terminal-green' : 'border-primary'}`}></div>
        <div className={`absolute top-32 md:top-40 right-8 md:right-20 w-10 md:w-16 h-10 md:h-16 border rounded-full animate-float opacity-30 ${theme === 'dark' ? 'border-terminal-cyan' : 'border-secondary'}`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-24 md:bottom-32 left-1/4 w-8 md:w-12 h-8 md:h-12 border rounded-lg animate-float opacity-25 ${theme === 'dark' ? 'border-terminal-red' : 'border-destructive'}`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-16 md:bottom-20 right-1/3 w-10 md:w-14 h-10 md:h-14 border rounded-full animate-float opacity-20 ${theme === 'dark' ? 'border-terminal-orange' : 'border-accent'}`} style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Left Column - Terminal */}
          <div className="space-y-4 lg:space-y-6 order-2 lg:order-1">
            <TerminalWindow title="root@cybersec:~#">
              <div className="space-y-1 text-xs sm:text-sm">
                <div className={theme === 'dark' ? 'text-terminal-green' : 'text-primary'}>
                  <span className={theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}>root@cybersec</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-foreground'}>:</span>
                  <span className="text-blue-500">~</span>
                  <span className={theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}># </span>
                  <TypeWriter 
                    text="whoami" 
                    onComplete={() => setShowSecondLine(true)}
                  />
                </div>
                {showSecondLine && (
                  <div className={theme === 'dark' ? 'text-terminal-green' : 'text-primary'}>
                    <TypeWriter 
                      text={`${heroData.firstName} ${heroData.lastName} - ${heroData.specialization} Expert`}
                      onComplete={() => setShowThirdLine(true)}
                    />
                  </div>
                )}
                {showThirdLine && (
                  <div className={theme === 'dark' ? 'text-terminal-green' : 'text-primary'}>
                    <span className={theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}>root@cybersec</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-foreground'}>:</span>
                    <span className="text-blue-500">~</span>
                    <span className={theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}># </span>
                    <TypeWriter text="cat profile.txt" />
                  </div>
                )}
              </div>
            </TerminalWindow>

            <div className={`cyber-card ${theme === 'light' ? 'bg-card border-border' : ''}`}>
              <h3 className={`text-sm md:text-lg mb-3 ${theme === 'dark' ? 'text-terminal-red glow-text' : 'text-destructive font-semibold'}`}>System Status</h3>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-white' : 'text-foreground'}>Security Level:</span>
                  <span className={theme === 'dark' ? 'text-terminal-red' : 'text-destructive font-medium'}>ROOT ACCESS</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-white' : 'text-foreground'}>Penetration Testing:</span>
                  <span className={theme === 'dark' ? 'text-terminal-green' : 'text-primary font-medium'}>ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-white' : 'text-foreground'}>Vulnerability Scanner:</span>
                  <span className={theme === 'dark' ? 'text-terminal-green' : 'text-primary font-medium'}>RUNNING</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-white' : 'text-foreground'}>LinkedIn Status:</span>
                  <span className={theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary font-medium'}>CONNECTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="text-center lg:text-left space-y-4 lg:space-y-6 order-1 lg:order-2">
            <div>
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 ${theme === 'dark' ? 'text-terminal-green glow-text' : 'text-primary'}`}>
                {heroData.firstName}
              </h1>
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-3 lg:mb-4 ${theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}`}>
                {heroData.lastName}
              </h2>
              <div className={`text-sm sm:text-base lg:text-lg mb-4 lg:mb-6 ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}>
                <span className={theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}>&gt; </span>
                <span className={`transition-all duration-500 ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>
                  {heroData.skills[currentSkill]}
                </span>
              </div>
            </div>

            <p className={`text-xs sm:text-sm lg:text-base leading-relaxed px-2 lg:px-0 ${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>
              {heroData.bio}
            </p>

            {/* LinkedIn Profile Info */}
            <div className={`cyber-card ${theme === 'dark' ? 'border-terminal-red' : 'border-destructive/30 bg-card'}`}>
              <h3 className={`text-sm lg:text-base mb-3 ${theme === 'dark' ? 'text-terminal-red glow-text' : 'text-destructive font-semibold'}`}>Professional Profile</h3>
              <div className="space-y-2 text-xs lg:text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className={theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}>LinkedIn:</span>
                  <a 
                    href={heroData.linkedinUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`transition-colors duration-300 break-all ${theme === 'dark' ? 'text-terminal-green hover:text-terminal-red' : 'text-primary hover:text-destructive'}`}
                  >
                    {heroData.linkedinUsername}
                  </a>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className={theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}>Specialization:</span>
                  <span className={theme === 'dark' ? 'text-terminal-green' : 'text-primary'}>{heroData.specialization}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className={theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}>Status:</span>
                  <span className={theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}>{heroData.status}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => scrollToSection('projects')}
                className={`cyber-card border transition-all duration-300 px-4 lg:px-6 py-2 rounded-lg text-xs lg:text-sm ${
                  theme === 'dark' 
                    ? 'border-terminal-green hover:bg-terminal-green hover:text-terminal-dark glow-border' 
                    : 'border-primary hover:bg-primary hover:text-primary-foreground bg-card'
                }`}
              >
                View Projects
              </button>
              <button 
                onClick={downloadResume}
                className={`cyber-card border transition-all duration-300 px-4 lg:px-6 py-2 rounded-lg text-xs lg:text-sm ${
                  theme === 'dark' 
                    ? 'border-terminal-red hover:bg-terminal-red hover:text-white' 
                    : 'border-destructive hover:bg-destructive hover:text-destructive-foreground bg-card'
                }`}
              >
                Download Resume
              </button>
              <a 
                href={heroData.linkedinUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className={`cyber-card border transition-all duration-300 px-4 lg:px-6 py-2 rounded-lg text-xs lg:text-sm text-center ${
                  theme === 'dark' 
                    ? 'border-terminal-cyan hover:bg-terminal-cyan hover:text-terminal-dark' 
                    : 'border-secondary hover:bg-secondary hover:text-secondary-foreground bg-card'
                }`}
              >
                LinkedIn Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


import { useState, useEffect } from 'react';
import TypeWriter from './TypeWriter';
import TerminalWindow from './TerminalWindow';

const HeroSection = () => {
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showThirdLine, setShowThirdLine] = useState(false);

  const skills = ['Ethical Hacker', 'Cybersecurity Specialist', 'Penetration Tester', 'Security Analyst'];
  const [currentSkill, setCurrentSkill] = useState(0);

  // Animate through skills
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSkill((prev) => (prev + 1) % skills.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [skills.length]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const downloadResume = () => {
    // Create a dummy PDF download link
    const link = document.createElement('a');
    link.href = '#'; // Replace with actual resume PDF URL
    link.download = 'Vikash_Tripathi_Resume.pdf';
    link.click();
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* 3D Floating Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-4 md:left-10 w-12 md:w-20 h-12 md:h-20 border border-terminal-green rounded-lg animate-float opacity-20"></div>
        <div className="absolute top-32 md:top-40 right-8 md:right-20 w-10 md:w-16 h-10 md:h-16 border border-terminal-cyan rounded-full animate-float opacity-30" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-24 md:bottom-32 left-1/4 w-8 md:w-12 h-8 md:h-12 border border-terminal-red rounded-lg animate-float opacity-25" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-16 md:bottom-20 right-1/3 w-10 md:w-14 h-10 md:h-14 border border-terminal-orange rounded-full animate-float opacity-20" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Left Column - Terminal */}
          <div className="space-y-4 lg:space-y-6 order-2 lg:order-1">
            <TerminalWindow title="root@cybersec:~#">
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="text-terminal-green">
                  <span className="text-terminal-red">root@cybersec</span>
                  <span className="text-white">:</span>
                  <span className="text-blue-400">~</span>
                  <span className="text-terminal-red"># </span>
                  <TypeWriter 
                    text="whoami" 
                    onComplete={() => setShowSecondLine(true)}
                  />
                </div>
                {showSecondLine && (
                  <div className="text-terminal-green">
                    <TypeWriter 
                      text="Vikash Tripathi - Cybersecurity Expert" 
                      onComplete={() => setShowThirdLine(true)}
                    />
                  </div>
                )}
                {showThirdLine && (
                  <div className="text-terminal-green">
                    <span className="text-terminal-red">root@cybersec</span>
                    <span className="text-white">:</span>
                    <span className="text-blue-400">~</span>
                    <span className="text-terminal-red"># </span>
                    <TypeWriter text="cat profile.txt" />
                  </div>
                )}
              </div>
            </TerminalWindow>

            <div className="cyber-card">
              <h3 className="text-terminal-red text-sm md:text-lg mb-3 glow-text">System Status</h3>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span>Security Level:</span>
                  <span className="text-terminal-red">ROOT ACCESS</span>
                </div>
                <div className="flex justify-between">
                  <span>Penetration Testing:</span>
                  <span className="text-terminal-green">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span>Vulnerability Scanner:</span>
                  <span className="text-terminal-green">RUNNING</span>
                </div>
                <div className="flex justify-between">
                  <span>LinkedIn Status:</span>
                  <span className="text-terminal-cyan">CONNECTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="text-center lg:text-left space-y-4 lg:space-y-6 order-1 lg:order-2">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-terminal-green glow-text mb-2 animate-pulse">
                VIKASH
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-terminal-red mb-3 lg:mb-4 animate-glow">
                TRIPATHI
              </h2>
              <div className="text-sm sm:text-base lg:text-lg text-white mb-4 lg:mb-6">
                <span className="text-terminal-red">&gt; </span>
                <span className="text-terminal-green transition-all duration-500">
                  {skills[currentSkill]}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm lg:text-base text-gray-300 leading-relaxed px-2 lg:px-0">
              Cybersecurity professional with expertise in ethical hacking, penetration testing, 
              and vulnerability assessment. Passionate about securing digital infrastructure 
              and protecting organizations against evolving cyber threats.
            </p>

            {/* LinkedIn Profile Info */}
            <div className="cyber-card border-terminal-red">
              <h3 className="text-terminal-red text-sm lg:text-base mb-3 glow-text">Professional Profile</h3>
              <div className="space-y-2 text-xs lg:text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-terminal-cyan">LinkedIn:</span>
                  <a 
                    href="https://www.linkedin.com/in/vikash-tripathi80" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-terminal-green hover:text-terminal-red transition-colors duration-300 break-all"
                  >
                    /in/vikash-tripathi80
                  </a>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-terminal-cyan">Specialization:</span>
                  <span className="text-terminal-green">Cybersecurity</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-terminal-cyan">Status:</span>
                  <span className="text-terminal-red">Available for Opportunities</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => scrollToSection('projects')}
                className="cyber-card border border-terminal-green hover:bg-terminal-green hover:text-terminal-dark transition-all duration-300 px-4 lg:px-6 py-2 rounded-lg glow-border text-xs lg:text-sm"
              >
                View Projects
              </button>
              <button 
                onClick={downloadResume}
                className="cyber-card border border-terminal-red hover:bg-terminal-red hover:text-white transition-all duration-300 px-4 lg:px-6 py-2 rounded-lg text-xs lg:text-sm"
              >
                Download Resume
              </button>
              <a 
                href="https://www.linkedin.com/in/vikash-tripathi80" 
                target="_blank" 
                rel="noopener noreferrer"
                className="cyber-card border border-terminal-cyan hover:bg-terminal-cyan hover:text-terminal-dark transition-all duration-300 px-4 lg:px-6 py-2 rounded-lg text-xs lg:text-sm text-center"
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

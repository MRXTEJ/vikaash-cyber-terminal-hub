
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

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 3D Floating Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-20 h-20 border border-terminal-green rounded-lg animate-float opacity-20"></div>
        <div className="absolute top-40 right-20 w-16 h-16 border border-terminal-cyan rounded-full animate-float opacity-30" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-12 h-12 border border-terminal-green rounded-lg animate-float opacity-25" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-14 h-14 border border-terminal-cyan rounded-full animate-float opacity-20" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Terminal */}
          <div className="space-y-6">
            <TerminalWindow title="vikaash@cybersec:~$">
              <div className="space-y-2">
                <div className="text-terminal-green">
                  <span className="text-terminal-cyan">vikaash@cybersec</span>
                  <span className="text-white">:</span>
                  <span className="text-blue-400">~</span>
                  <span className="text-white">$ </span>
                  <TypeWriter 
                    text="whoami" 
                    onComplete={() => setShowSecondLine(true)}
                  />
                </div>
                {showSecondLine && (
                  <div className="text-terminal-green">
                    <TypeWriter 
                      text="Vikaash Tripathi - Cybersecurity Enthusiast" 
                      onComplete={() => setShowThirdLine(true)}
                    />
                  </div>
                )}
                {showThirdLine && (
                  <div className="text-terminal-green">
                    <span className="text-terminal-cyan">vikaash@cybersec</span>
                    <span className="text-white">:</span>
                    <span className="text-blue-400">~</span>
                    <span className="text-white">$ </span>
                    <TypeWriter text="cat skills.txt" />
                  </div>
                )}
              </div>
            </TerminalWindow>

            <div className="cyber-card">
              <h3 className="text-terminal-cyan text-lg mb-3 glow-text">System Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Security Level:</span>
                  <span className="text-terminal-green">MAXIMUM</span>
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
                  <span>Firewall Status:</span>
                  <span className="text-terminal-green">SECURED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="text-center lg:text-left space-y-6">
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold text-terminal-green glow-text mb-2">
                VIKAASH
              </h1>
              <h2 className="text-2xl lg:text-3xl font-bold text-terminal-cyan mb-4">
                TRIPATHI
              </h2>
              <div className="text-lg text-white mb-6">
                <span className="text-terminal-cyan">&gt; </span>
                <span className="text-terminal-green transition-all duration-500">
                  {skills[currentSkill]}
                </span>
              </div>
            </div>

            <p className="text-base text-gray-300 leading-relaxed">
              Passionate cybersecurity professional specializing in ethical hacking, 
              penetration testing, and vulnerability assessment. Dedicated to securing 
              digital infrastructure and protecting against cyber threats.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="cyber-card border border-terminal-green hover:bg-terminal-green hover:text-terminal-dark transition-all duration-300 px-6 py-2 rounded-lg glow-border text-sm">
                View Projects
              </button>
              <button className="cyber-card border border-terminal-cyan hover:bg-terminal-cyan hover:text-terminal-dark transition-all duration-300 px-6 py-2 rounded-lg text-sm">
                Download Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

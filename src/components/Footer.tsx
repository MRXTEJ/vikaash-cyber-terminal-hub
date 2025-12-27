import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

const Footer = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretClick = () => {
    clickCountRef.current += 1;
    
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      navigate('/auth');
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 800);
    }
  };

  const socialLinks = [
    { name: 'LinkedIn', url: '#' },
    { name: 'GitHub', url: '#' },
    { name: 'Twitter', url: '#' },
    { name: 'Email', url: 'mailto:vikaash@example.com' },
  ];

  return (
    <footer className={`border-t py-8 ${theme === 'dark' ? 'bg-terminal-dark border-terminal-gray' : 'bg-card border-border'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className={`mb-4 ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>
            <span 
              onClick={handleSecretClick}
              className={`text-2xl cursor-default select-none ${theme === 'dark' ? 'glow-text' : 'font-bold'}`}
            >
              &lt;/VikaashTripathi&gt;
            </span>
          </div>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
            Cybersecurity Professional | Ethical Hacker | Security Researcher
          </p>
          <div className="flex justify-center space-x-6 mb-4">
            {socialLinks.map((link) => (
              <a 
                key={link.name}
                href={link.url} 
                
                target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className={`transition-colors ${theme === 'dark' ? 'text-terminal-cyan hover:text-terminal-green' : 'text-secondary hover:text-primary'}`}
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className={`text-sm font-mono ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`}>
            © 2024 Vikaash Tripathi. All rights reserved. | Securing the digital frontier.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

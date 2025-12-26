
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detect active section on scroll using Intersection Observer
  useEffect(() => {
    const sectionIds = ['home', 'about', 'projects', 'certificates', 'resume', 'contact'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id || 'home');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach((id) => {
      if (id === 'home') {
        // For home, observe the first section or body
        const heroSection = document.querySelector('section') || document.body;
        if (heroSection && !heroSection.id) {
          heroSection.id = 'home';
        }
        if (heroSection) observer.observe(heroSection);
      } else {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'resume', label: 'Resume' },
    { id: 'contact', label: 'Contact' }
  ];

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? theme === 'dark' 
          ? 'bg-terminal-dark/95 backdrop-blur-md border-b border-terminal-red/20' 
          : 'bg-card/95 backdrop-blur-md border-b border-border'
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <div className={`font-bold text-sm sm:text-base lg:text-xl ${theme === 'dark' ? 'text-terminal-green glow-text' : 'text-primary'}`}>
            &lt;VikashTripathi/&gt;
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-xs lg:text-sm font-mono transition-all duration-300 ${
                  activeSection === item.id 
                    ? theme === 'dark' 
                      ? 'text-terminal-red glow-text' 
                      : 'text-destructive font-semibold'
                    : theme === 'dark' 
                      ? 'text-white hover:text-terminal-red' 
                      : 'text-foreground hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 ${
                theme === 'dark'
                  ? 'text-terminal-yellow hover:bg-terminal-green/10 hover:text-terminal-green'
                  : 'text-amber-500 hover:bg-primary/10 hover:text-primary'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 lg:w-5 lg:h-5" /> : <Moon className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>

            <Link
              to="/auth"
              className={`flex items-center gap-1 text-xs lg:text-sm font-mono transition-all duration-300 px-3 py-1 rounded ${
                theme === 'dark'
                  ? 'text-terminal-green border border-terminal-green/50 hover:text-terminal-red hover:border-terminal-red/50'
                  : 'text-primary border border-primary/50 hover:text-destructive hover:border-destructive/50'
              }`}
            >
              <User className="w-3 h-3 lg:w-4 lg:h-4" />
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme Toggle - Mobile */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 ${
                theme === 'dark'
                  ? 'text-terminal-yellow hover:bg-terminal-green/10'
                  : 'text-amber-500 hover:bg-primary/10'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`text-lg transition-colors duration-300 ${
                theme === 'dark' ? 'text-terminal-green hover:text-terminal-red' : 'text-primary hover:text-destructive'
              }`}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden absolute top-14 lg:top-16 left-0 right-0 backdrop-blur-md border-b ${
            theme === 'dark' ? 'bg-terminal-dark/95 border-terminal-red/20' : 'bg-card/95 border-border'
          }`}>
            <div className="flex flex-col space-y-2 p-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left text-sm font-mono transition-all duration-300 py-2 ${
                    activeSection === item.id 
                      ? theme === 'dark' ? 'text-terminal-red glow-text' : 'text-destructive font-semibold'
                      : theme === 'dark' ? 'text-white hover:text-terminal-red' : 'text-foreground hover:text-primary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/auth"
                className={`flex items-center gap-2 text-sm font-mono transition-all duration-300 py-2 ${
                  theme === 'dark' ? 'text-terminal-green hover:text-terminal-red' : 'text-primary hover:text-destructive'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

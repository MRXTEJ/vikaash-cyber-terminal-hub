
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      isScrolled ? 'bg-terminal-dark/95 backdrop-blur-md border-b border-terminal-red/20' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <div className="text-terminal-green font-bold text-sm sm:text-base lg:text-xl glow-text">
            &lt;VikashTripathi/&gt;
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-xs lg:text-sm font-mono transition-all duration-300 hover:text-terminal-red ${
                  activeSection === item.id ? 'text-terminal-red glow-text' : 'text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/auth"
              className="flex items-center gap-1 text-xs lg:text-sm font-mono text-terminal-green hover:text-terminal-red transition-all duration-300 border border-terminal-green/50 hover:border-terminal-red/50 px-3 py-1 rounded"
            >
              <User className="w-3 h-3 lg:w-4 lg:h-4" />
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-terminal-green text-lg hover:text-terminal-red transition-colors duration-300"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-14 lg:top-16 left-0 right-0 bg-terminal-dark/95 backdrop-blur-md border-b border-terminal-red/20">
            <div className="flex flex-col space-y-2 p-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left text-sm font-mono transition-all duration-300 hover:text-terminal-red py-2 ${
                    activeSection === item.id ? 'text-terminal-red glow-text' : 'text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Link
                to="/auth"
                className="flex items-center gap-2 text-sm font-mono text-terminal-green hover:text-terminal-red transition-all duration-300 py-2"
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

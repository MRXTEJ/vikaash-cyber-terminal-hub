
import MatrixRain from '../components/MatrixRain';
import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ProjectsSection from '../components/ProjectsSection';
import CertificatesSection from '../components/CertificatesSection';
import ResumeSection from '../components/ResumeSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import { useTheme } from '@/hooks/useTheme';

const Index = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-terminal-darker text-terminal-green' 
        : 'bg-background text-foreground'
    }`}>
      {theme === 'dark' && <MatrixRain />}
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <CertificatesSection />
        <ResumeSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

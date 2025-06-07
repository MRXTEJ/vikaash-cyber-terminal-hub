
const Footer = () => {
  return (
    <footer className="bg-terminal-dark border-t border-terminal-gray py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="text-terminal-green mb-4">
            <span className="text-2xl glow-text">&lt;/VikaashTripathi&gt;</span>
          </div>
          <p className="text-gray-400 mb-4">
            Cybersecurity Professional | Ethical Hacker | Security Researcher
          </p>
          <div className="flex justify-center space-x-6 mb-4">
            <a href="#" className="text-terminal-cyan hover:text-terminal-green transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-terminal-cyan hover:text-terminal-green transition-colors">
              GitHub
            </a>
            <a href="#" className="text-terminal-cyan hover:text-terminal-green transition-colors">
              Twitter
            </a>
            <a href="mailto:vikaash@example.com" className="text-terminal-cyan hover:text-terminal-green transition-colors">
              Email
            </a>
          </div>
          <div className="text-sm text-gray-500 font-mono">
            © 2024 Vikaash Tripathi. All rights reserved. | Securing the digital frontier.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

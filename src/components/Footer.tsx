import { supabase } from '@/integrations/supabase/client';

const Footer = () => {
  const trackLinkClick = async (linkName: string, linkUrl: string) => {
    try {
      // Log activity for link click
      await supabase.from('activity_log').insert({
        activity_type: 'link_click',
        title: `${linkName} Link Clicked`,
        description: `Someone visited your ${linkName} profile`,
        metadata: { url: linkUrl, platform: linkName, source: 'footer' },
      });

      // Send email notification
      await supabase.functions.invoke('notify-link-click', {
        body: { linkName, linkUrl }
      });
    } catch (error) {
      console.error('Error tracking link click:', error);
    }
  };

  const socialLinks = [
    { name: 'LinkedIn', url: '#' },
    { name: 'GitHub', url: '#' },
    { name: 'Twitter', url: '#' },
    { name: 'Email', url: 'mailto:vikaash@example.com' },
  ];

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
            {socialLinks.map((link) => (
              <a 
                key={link.name}
                href={link.url} 
                onClick={() => trackLinkClick(link.name, link.url)}
                target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="text-terminal-cyan hover:text-terminal-green transition-colors"
              >
                {link.name}
              </a>
            ))}
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
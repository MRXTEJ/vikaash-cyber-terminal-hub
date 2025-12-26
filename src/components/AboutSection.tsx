import { useState, useEffect, useCallback } from 'react';
import TerminalWindow from './TerminalWindow';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/useTheme';

interface Skill {
  name: string;
  level: number;
}

interface AboutData {
  bio1: string;
  bio2: string;
  skills: Skill[];
  tools: string[];
}

const defaultAboutData: AboutData = {
  bio1: "I'm a passionate cybersecurity enthusiast with a strong foundation in ethical hacking and penetration testing. My journey began with a curiosity about how systems work and evolved into a mission to protect them from malicious actors.",
  bio2: "Currently focusing on expanding my knowledge in advanced persistent threats, cloud security, and IoT security. I believe in continuous learning and staying updated with the latest security trends and vulnerabilities.",
  skills: [
    { name: 'Penetration Testing', level: 90 },
    { name: 'Network Security', level: 85 },
    { name: 'Vulnerability Assessment', level: 88 },
    { name: 'Incident Response', level: 75 },
    { name: 'Digital Forensics', level: 80 },
    { name: 'Malware Analysis', level: 70 },
  ],
  tools: ['Kali Linux', 'Metasploit', 'Burp Suite', 'Nmap', 'Wireshark', 'OWASP ZAP', 'Nessus', 'Nikto', 'Aircrack-ng', 'John the Ripper'],
};

const AboutSection = () => {
  const [aboutData, setAboutData] = useState<AboutData>(defaultAboutData);
  const { theme } = useTheme();

  const fetchAboutData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'about_data')
        .maybeSingle();

      if (error) throw error;
      if (data?.value) {
        setAboutData(JSON.parse(data.value));
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    }
  }, []);

  useEffect(() => {
    fetchAboutData();
  }, [fetchAboutData]);

  // Realtime subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('about-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings',
        },
        (payload) => {
          if (payload.new && (payload.new as { key: string }).key === 'about_data') {
            const newValue = (payload.new as { value: string }).value;
            if (newValue) {
              try {
                setAboutData(JSON.parse(newValue));
              } catch (e) {
                console.error('Error parsing about data:', e);
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'site_settings',
        },
        (payload) => {
          if (payload.new && (payload.new as { key: string }).key === 'about_data') {
            const newValue = (payload.new as { value: string }).value;
            if (newValue) {
              try {
                setAboutData(JSON.parse(newValue));
              } catch (e) {
                console.error('Error parsing about data:', e);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-terminal-green glow-text' : 'text-primary'}`}>
            &lt; About Me /&gt;
          </h2>
          <p className={`text-xl ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>
            Exploring the depths of cybersecurity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Terminal About */}
          <TerminalWindow title="about.sh">
            <div className="space-y-4">
              <div className={theme === 'dark' ? 'text-terminal-green' : 'text-primary'}>
                <span className={theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}>#!/bin/bash</span>
              </div>
              <div className={theme === 'dark' ? 'text-terminal-green' : 'text-primary'}>
                <span className={theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}>echo</span> "Cybersecurity Professional"
              </div>
              <div className={`mt-4 ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}>
                {aboutData.bio1}
              </div>
              <div className={`mt-4 ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}>
                {aboutData.bio2}
              </div>
              <div className={`mt-4 ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>
                <span className={theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}>chmod</span> +x secure_future.sh
              </div>
            </div>
          </TerminalWindow>

          {/* Skills and Tools */}
          <div className="space-y-8">
            {/* Skills Progress */}
            <div className={`cyber-card ${theme === 'light' ? 'bg-card border-border' : ''}`}>
              <h3 className={`text-xl mb-6 ${theme === 'dark' ? 'text-terminal-cyan glow-text' : 'text-secondary font-semibold'}`}>Technical Skills</h3>
              <div className="space-y-4">
                {aboutData.skills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className={theme === 'dark' ? 'text-white' : 'text-foreground'}>{skill.name}</span>
                      <span className={theme === 'dark' ? 'text-terminal-green' : 'text-primary'}>{skill.level}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${theme === 'dark' ? 'bg-terminal-gray' : 'bg-muted'}`}>
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${theme === 'dark' ? 'bg-gradient-to-r from-terminal-green to-terminal-cyan glow-border' : 'bg-gradient-to-r from-primary to-secondary'}`}
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className={`cyber-card ${theme === 'light' ? 'bg-card border-border' : ''}`}>
              <h3 className={`text-xl mb-6 ${theme === 'dark' ? 'text-terminal-cyan glow-text' : 'text-secondary font-semibold'}`}>Security Tools</h3>
              <div className="grid grid-cols-2 gap-3">
                {aboutData.tools.map((tool, index) => (
                  <div 
                    key={index}
                    className={`border rounded px-3 py-2 text-center text-sm transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-terminal-gray border-terminal-green hover:bg-terminal-green hover:text-terminal-dark' 
                        : 'bg-muted border-primary/30 hover:bg-primary hover:text-primary-foreground text-foreground'
                    }`}
                  >
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

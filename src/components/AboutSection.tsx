import { useState, useEffect } from 'react';
import TerminalWindow from './TerminalWindow';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'about_data')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data?.value) {
        setAboutData(JSON.parse(data.value));
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    }
  };

  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-terminal-green glow-text mb-4">
            &lt; About Me /&gt;
          </h2>
          <p className="text-xl text-terminal-cyan">
            Exploring the depths of cybersecurity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Terminal About */}
          <TerminalWindow title="about.sh">
            <div className="space-y-4">
              <div className="text-terminal-green">
                <span className="text-terminal-cyan">#!/bin/bash</span>
              </div>
              <div className="text-terminal-green">
                <span className="text-terminal-cyan">echo</span> "Cybersecurity Professional"
              </div>
              <div className="text-white mt-4">
                {aboutData.bio1}
              </div>
              <div className="text-white mt-4">
                {aboutData.bio2}
              </div>
              <div className="text-terminal-green mt-4">
                <span className="text-terminal-cyan">chmod</span> +x secure_future.sh
              </div>
            </div>
          </TerminalWindow>

          {/* Skills and Tools */}
          <div className="space-y-8">
            {/* Skills Progress */}
            <div className="cyber-card">
              <h3 className="text-terminal-cyan text-xl mb-6 glow-text">Technical Skills</h3>
              <div className="space-y-4">
                {aboutData.skills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white">{skill.name}</span>
                      <span className="text-terminal-green">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-terminal-gray rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-terminal-green to-terminal-cyan h-2 rounded-full transition-all duration-1000 glow-border"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="cyber-card">
              <h3 className="text-terminal-cyan text-xl mb-6 glow-text">Security Tools</h3>
              <div className="grid grid-cols-2 gap-3">
                {aboutData.tools.map((tool, index) => (
                  <div 
                    key={index}
                    className="bg-terminal-gray border border-terminal-green rounded px-3 py-2 text-center text-sm hover:bg-terminal-green hover:text-terminal-dark transition-all duration-300"
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

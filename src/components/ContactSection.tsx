
import { useState } from 'react';
import TerminalWindow from './TerminalWindow';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const socialLinks = [
    { name: 'LinkedIn', url: '#', icon: '💼' },
    { name: 'GitHub', url: '#', icon: '📁' },
    { name: 'Twitter', url: '#', icon: '🐦' },
    { name: 'Email', url: 'mailto:vikaash@example.com', icon: '📧' }
  ];

  return (
    <section id="contact" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-terminal-green glow-text mb-4">
            &lt; Contact /&gt;
          </h2>
          <p className="text-xl text-terminal-cyan">
            Let's connect and secure the digital world together
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <TerminalWindow title="send_message.sh">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-terminal-cyan mb-4">
                  #!/bin/bash
                </div>
                <div className="text-terminal-green mb-4">
                  echo "Initiating secure communication..."
                </div>
                
                <div>
                  <label className="block text-terminal-cyan text-sm mb-2">
                    Name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-terminal-gray border border-terminal-green rounded px-3 py-2 text-white focus:border-terminal-cyan focus:outline-none glow-border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-terminal-cyan text-sm mb-2">
                    Email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-terminal-gray border border-terminal-green rounded px-3 py-2 text-white focus:border-terminal-cyan focus:outline-none glow-border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-terminal-cyan text-sm mb-2">
                    Subject:
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full bg-terminal-gray border border-terminal-green rounded px-3 py-2 text-white focus:border-terminal-cyan focus:outline-none glow-border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-terminal-cyan text-sm mb-2">
                    Message:
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full bg-terminal-gray border border-terminal-green rounded px-3 py-2 text-white focus:border-terminal-cyan focus:outline-none glow-border resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full cyber-card border border-terminal-green hover:bg-terminal-green hover:text-terminal-dark transition-all duration-300 px-6 py-3 rounded glow-border"
                >
                  Execute send_message.sh
                </button>
              </form>
            </TerminalWindow>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="cyber-card">
              <h3 className="text-terminal-cyan text-xl mb-6 glow-text">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-terminal-green mr-3">📧</span>
                  <span className="text-white">vikaash.tripathi@example.com</span>
                </div>
                <div className="flex items-center">
                  <span className="text-terminal-green mr-3">📱</span>
                  <span className="text-white">+91 XXXXX XXXXX</span>
                </div>
                <div className="flex items-center">
                  <span className="text-terminal-green mr-3">📍</span>
                  <span className="text-white">India</span>
                </div>
                <div className="flex items-center">
                  <span className="text-terminal-green mr-3">🌐</span>
                  <span className="text-white">Available for remote work</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="cyber-card">
              <h3 className="text-terminal-cyan text-xl mb-6 glow-text">Connect With Me</h3>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    className="cyber-card border border-terminal-gray hover:border-terminal-green hover:bg-terminal-green hover:text-terminal-dark transition-all duration-300 p-4 text-center rounded"
                  >
                    <div className="text-2xl mb-2">{link.icon}</div>
                    <div className="text-sm">{link.name}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Status */}
            <TerminalWindow title="status.log">
              <div className="space-y-2">
                <div className="text-terminal-green">
                  <span className="text-terminal-cyan">Status:</span> Available for opportunities
                </div>
                <div className="text-terminal-green">
                  <span className="text-terminal-cyan">Response Time:</span> Usually within 24 hours
                </div>
                <div className="text-terminal-green">
                  <span className="text-terminal-cyan">Preferred Contact:</span> Email
                </div>
                <div className="text-terminal-green animate-pulse">
                  <span className="text-terminal-cyan">&gt;</span> Ready to collaborate_
                </div>
              </div>
            </TerminalWindow>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

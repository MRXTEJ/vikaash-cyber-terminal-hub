
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
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/vikash-tripathi80', icon: '💼' },
    { name: 'GitHub', url: '#', icon: '📁' },
    { name: 'Twitter', url: '#', icon: '🐦' },
    { name: 'Email', url: 'mailto:vikash@example.com', icon: '📧' }
  ];

  return (
    <section id="contact" className="py-12 lg:py-20 relative px-4">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        <div className="text-center mb-8 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-terminal-green glow-text mb-4">
            &lt; Contact /&gt;
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-terminal-red">
            Let's connect and secure the digital world together
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Contact Form */}
          <div className="order-2 lg:order-1">
            <TerminalWindow title="root@cybersec:~# send_message.sh">
              <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
                <div className="text-terminal-red mb-2 text-xs lg:text-sm">
                  #!/bin/bash
                </div>
                <div className="text-terminal-green mb-3 lg:mb-4 text-xs lg:text-sm">
                  echo "Initiating secure communication..."
                </div>
                
                <div>
                  <label className="block text-terminal-red text-xs lg:text-sm mb-1 lg:mb-2">
                    Name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-terminal-gray border border-terminal-green rounded px-2 lg:px-3 py-1 lg:py-2 text-white text-xs lg:text-sm focus:border-terminal-red focus:outline-none glow-border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-terminal-red text-xs lg:text-sm mb-1 lg:mb-2">
                    Email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-terminal-gray border border-terminal-green rounded px-2 lg:px-3 py-1 lg:py-2 text-white text-xs lg:text-sm focus:border-terminal-red focus:outline-none glow-border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-terminal-red text-xs lg:text-sm mb-1 lg:mb-2">
                    Subject:
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full bg-terminal-gray border border-terminal-green rounded px-2 lg:px-3 py-1 lg:py-2 text-white text-xs lg:text-sm focus:border-terminal-red focus:outline-none glow-border"
                    required
                  />
                </div>

                <div>
                  <label className="block text-terminal-red text-xs lg:text-sm mb-1 lg:mb-2">
                    Message:
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-terminal-gray border border-terminal-green rounded px-2 lg:px-3 py-1 lg:py-2 text-white text-xs lg:text-sm focus:border-terminal-red focus:outline-none glow-border resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full cyber-card border border-terminal-red hover:bg-terminal-red hover:text-white transition-all duration-300 px-4 lg:px-6 py-2 lg:py-3 rounded glow-border text-xs lg:text-sm"
                >
                  Execute send_message.sh
                </button>
              </form>
            </TerminalWindow>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 lg:space-y-8 order-1 lg:order-2">
            {/* Contact Details */}
            <div className="cyber-card border-terminal-red">
              <h3 className="text-terminal-red text-base lg:text-xl mb-4 lg:mb-6 glow-text">Contact Information</h3>
              <div className="space-y-2 lg:space-y-4">
                <div className="flex items-center">
                  <span className="text-terminal-green mr-2 lg:mr-3 text-sm lg:text-base">📧</span>
                  <span className="text-white text-xs lg:text-sm">vikash.tripathi@example.com</span>
                </div>
                <div className="flex items-center">
                  <span className="text-terminal-green mr-2 lg:mr-3 text-sm lg:text-base">📱</span>
                  <span className="text-white text-xs lg:text-sm">+91 XXXXX XXXXX</span>
                </div>
                <div className="flex items-center">
                  <span className="text-terminal-green mr-2 lg:mr-3 text-sm lg:text-base">📍</span>
                  <span className="text-white text-xs lg:text-sm">India</span>
                </div>
                <div className="flex items-center">
                  <span className="text-terminal-red mr-2 lg:mr-3 text-sm lg:text-base">💼</span>
                  <a 
                    href="https://www.linkedin.com/in/vikash-tripathi80" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-terminal-cyan hover:text-terminal-red transition-colors duration-300 text-xs lg:text-sm"
                  >
                    LinkedIn: /in/vikash-tripathi80
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="cyber-card">
              <h3 className="text-terminal-cyan text-base lg:text-xl mb-4 lg:mb-6 glow-text">Connect With Me</h3>
              <div className="grid grid-cols-2 gap-2 lg:gap-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-card border border-terminal-gray hover:border-terminal-red hover:bg-terminal-red hover:text-white transition-all duration-300 p-2 lg:p-4 text-center rounded"
                  >
                    <div className="text-lg lg:text-2xl mb-1 lg:mb-2">{link.icon}</div>
                    <div className="text-xs lg:text-sm">{link.name}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Status */}
            <TerminalWindow title="root@cybersec:~# status.log">
              <div className="space-y-1 lg:space-y-2">
                <div className="text-terminal-green text-xs lg:text-sm">
                  <span className="text-terminal-red">Status:</span> Available for opportunities
                </div>
                <div className="text-terminal-green text-xs lg:text-sm">
                  <span className="text-terminal-red">Response Time:</span> Usually within 24 hours
                </div>
                <div className="text-terminal-green text-xs lg:text-sm">
                  <span className="text-terminal-red">Preferred Contact:</span> LinkedIn/Email
                </div>
                <div className="text-terminal-green animate-pulse text-xs lg:text-sm">
                  <span className="text-terminal-red">&gt;</span> Ready to collaborate_
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

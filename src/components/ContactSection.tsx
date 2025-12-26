import { useState, useEffect, useCallback } from 'react';
import TerminalWindow from './TerminalWindow';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useTheme } from '@/hooks/useTheme';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().trim().email('Invalid email').max(255, 'Email too long'),
  subject: z.string().trim().max(200, 'Subject too long').optional(),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message too long'),
});

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface ContactData {
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  linkedinUsername: string;
  responseTime: string;
  preferredContact: string;
  socialLinks: SocialLink[];
}

const defaultContactData: ContactData = {
  email: 'vikash.tripathi@example.com',
  phone: '+91 XXXXX XXXXX',
  location: 'India',
  linkedinUrl: 'https://www.linkedin.com/in/vikash-tripathi80',
  linkedinUsername: '/in/vikash-tripathi80',
  responseTime: 'Usually within 24 hours',
  preferredContact: 'LinkedIn/Email',
  socialLinks: [
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/vikash-tripathi80', icon: '💼' },
    { name: 'GitHub', url: '#', icon: '📁' },
    { name: 'Twitter', url: '#', icon: '🐦' },
    { name: 'Email', url: 'mailto:vikash@example.com', icon: '📧' },
  ],
};

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [contactData, setContactData] = useState<ContactData>(defaultContactData);
  const { toast } = useToast();
  const { theme } = useTheme();

  const fetchContactData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'contact_data')
        .maybeSingle();

      if (error) throw error;
      if (data?.value) {
        setContactData(JSON.parse(data.value));
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
    }
  }, []);

  useEffect(() => {
    fetchContactData();
  }, [fetchContactData]);

  // Realtime subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('contact-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'key=eq.contact_data',
        },
        () => {
          fetchContactData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContactData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0]?.message || 'Please check your input',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Save message to database
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          name: result.data.name,
          email: result.data.email,
          subject: result.data.subject || null,
          message: result.data.message,
        });

      if (messageError) throw messageError;

      // Log activity
      await supabase.from('activity_log').insert({
        activity_type: 'message',
        title: 'New Contact Message',
        description: `Message from ${result.data.name} (${result.data.email})`,
        metadata: { subject: result.data.subject || 'No subject' },
      });

      toast({
        title: 'Message Sent!',
        description: 'Your message has been delivered successfully.',
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const trackLinkClick = async (linkName: string, linkUrl: string) => {
    try {
      await supabase.from('activity_log').insert({
        activity_type: 'link_click',
        title: `${linkName} Link Clicked`,
        description: `Someone visited your ${linkName} profile`,
        metadata: { url: linkUrl, platform: linkName },
      });
    } catch (error) {
      console.error('Error tracking link click:', error);
    }
  };

  return (
    <section id="contact" className="py-12 lg:py-20 relative px-4">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        <div className="text-center mb-8 lg:mb-16">
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-terminal-green glow-text' : 'text-primary'}`}>
            &lt; Contact /&gt;
          </h2>
          <p className={`text-base sm:text-lg lg:text-xl ${theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}`}>
            Let's connect and secure the digital world together
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Contact Form */}
          <div className="order-2 lg:order-1">
            <TerminalWindow title="root@cybersec:~# send_message.sh">
              <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
                <div className={`mb-2 text-xs lg:text-sm ${theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}`}>
                  #!/bin/bash
                </div>
                <div className={`mb-3 lg:mb-4 text-xs lg:text-sm ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>
                  echo "Initiating secure communication..."
                </div>
                
                <div>
                  <label className={`block text-xs lg:text-sm mb-1 lg:mb-2 ${theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}`}>
                    Name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border rounded px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm focus:outline-none transition-colors ${
                      theme === 'dark' 
                        ? 'bg-terminal-gray border-terminal-green text-white focus:border-terminal-red glow-border' 
                        : 'bg-muted border-primary/30 text-foreground focus:border-primary'
                    }`}
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className={`block text-xs lg:text-sm mb-1 lg:mb-2 ${theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}`}>
                    Email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border rounded px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm focus:outline-none transition-colors ${
                      theme === 'dark' 
                        ? 'bg-terminal-gray border-terminal-green text-white focus:border-terminal-red glow-border' 
                        : 'bg-muted border-primary/30 text-foreground focus:border-primary'
                    }`}
                    required
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className={`block text-xs lg:text-sm mb-1 lg:mb-2 ${theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}`}>
                    Subject:
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full border rounded px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm focus:outline-none transition-colors ${
                      theme === 'dark' 
                        ? 'bg-terminal-gray border-terminal-green text-white focus:border-terminal-red glow-border' 
                        : 'bg-muted border-primary/30 text-foreground focus:border-primary'
                    }`}
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className={`block text-xs lg:text-sm mb-1 lg:mb-2 ${theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}`}>
                    Message:
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full border rounded px-2 lg:px-3 py-1 lg:py-2 text-xs lg:text-sm focus:outline-none resize-none transition-colors ${
                      theme === 'dark' 
                        ? 'bg-terminal-gray border-terminal-green text-white focus:border-terminal-red glow-border' 
                        : 'bg-muted border-primary/30 text-foreground focus:border-primary'
                    }`}
                    required
                    maxLength={2000}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full cyber-card border transition-all duration-300 px-4 lg:px-6 py-2 lg:py-3 rounded text-xs lg:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    theme === 'dark' 
                      ? 'border-terminal-red hover:bg-terminal-red hover:text-white glow-border' 
                      : 'border-destructive hover:bg-destructive hover:text-destructive-foreground bg-card'
                  }`}
                >
                  {submitting ? 'Sending...' : 'Execute send_message.sh'}
                </button>
              </form>
            </TerminalWindow>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 lg:space-y-8 order-1 lg:order-2">
            {/* Contact Details */}
            <div className={`cyber-card ${theme === 'dark' ? 'border-terminal-red' : 'border-destructive/30 bg-card'}`}>
              <h3 className={`text-base lg:text-xl mb-4 lg:mb-6 ${theme === 'dark' ? 'text-terminal-red glow-text' : 'text-destructive font-semibold'}`}>Contact Information</h3>
              <div className="space-y-2 lg:space-y-4">
                <div className="flex items-center">
                  <span className={`mr-2 lg:mr-3 text-sm lg:text-base ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>📧</span>
                  <span className={`text-xs lg:text-sm ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}>{contactData.email}</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 lg:mr-3 text-sm lg:text-base ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>📱</span>
                  <span className={`text-xs lg:text-sm ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}>{contactData.phone}</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 lg:mr-3 text-sm lg:text-base ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>📍</span>
                  <span className={`text-xs lg:text-sm ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}>{contactData.location}</span>
                </div>
                <div className="flex items-center">
                  <span className={`mr-2 lg:mr-3 text-sm lg:text-base ${theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}`}>💼</span>
                  <a 
                    href={contactData.linkedinUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`transition-colors duration-300 text-xs lg:text-sm ${theme === 'dark' ? 'text-terminal-cyan hover:text-terminal-red' : 'text-secondary hover:text-destructive'}`}
                  >
                    LinkedIn: {contactData.linkedinUsername}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className={`cyber-card ${theme === 'light' ? 'bg-card border-border' : ''}`}>
              <h3 className={`text-base lg:text-xl mb-4 lg:mb-6 ${theme === 'dark' ? 'text-terminal-cyan glow-text' : 'text-secondary font-semibold'}`}>Connect With Me</h3>
              <div className="grid grid-cols-2 gap-2 lg:gap-4">
                {contactData.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackLinkClick(link.name, link.url)}
                    className={`cyber-card border transition-all duration-300 p-2 lg:p-4 text-center rounded ${
                      theme === 'dark' 
                        ? 'border-terminal-gray hover:border-terminal-red hover:bg-terminal-red hover:text-white' 
                        : 'border-border hover:border-destructive hover:bg-destructive hover:text-destructive-foreground bg-card'
                    }`}
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
                <div className={`text-xs lg:text-sm ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>
                  <span className={theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}>Status:</span> Available for opportunities
                </div>
                <div className={`text-xs lg:text-sm ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>
                  <span className={theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}>Response Time:</span> {contactData.responseTime}
                </div>
                <div className={`text-xs lg:text-sm ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>
                  <span className={theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}>Preferred Contact:</span> {contactData.preferredContact}
                </div>
                <div className={`animate-pulse text-xs lg:text-sm ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>
                  <span className={theme === 'dark' ? 'text-terminal-red' : 'text-destructive'}>&gt;</span> Ready to collaborate_
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


import { useState } from 'react';
import TerminalWindow from './TerminalWindow';

const CertificatesSection = () => {
  const [selectedCert, setSelectedCert] = useState(0);

  const certificates = [
    {
      name: 'Certified Ethical Hacker (CEH)',
      issuer: 'EC-Council',
      date: '2024',
      status: 'Active',
      description: 'Comprehensive certification covering ethical hacking methodologies and penetration testing techniques.',
      skills: ['Penetration Testing', 'Vulnerability Assessment', 'Network Security', 'Web Application Security']
    },
    {
      name: 'CompTIA Security+',
      issuer: 'CompTIA',
      date: '2023',
      status: 'Active',
      description: 'Foundation-level cybersecurity certification covering essential security concepts and practices.',
      skills: ['Risk Management', 'Cryptography', 'Identity Management', 'Incident Response']
    },
    {
      name: 'OSCP (Offensive Security Certified Professional)',
      issuer: 'Offensive Security',
      date: 'In Progress',
      status: 'Pursuing',
      description: 'Advanced hands-on penetration testing certification requiring practical exploitation skills.',
      skills: ['Buffer Overflows', 'Privilege Escalation', 'Active Directory', 'Manual Exploitation']
    },
    {
      name: 'Cybersecurity Fundamentals',
      issuer: 'IBM',
      date: '2023',
      status: 'Completed',
      description: 'Foundational course covering cybersecurity principles and threat landscape.',
      skills: ['Threat Intelligence', 'Security Architecture', 'Compliance', 'Risk Assessment']
    }
  ];

  return (
    <section id="certificates" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-terminal-green glow-text mb-4">
            &lt; Certificates /&gt;
          </h2>
          <p className="text-xl text-terminal-cyan">
            Professional certifications and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Certificate Terminal */}
          <TerminalWindow title="certificates.db">
            <div className="space-y-3">
              <div className="text-terminal-cyan">
                SELECT * FROM certifications WHERE status = 'active';
              </div>
              <div className="border-t border-terminal-gray pt-3">
                {certificates.map((cert, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedCert(index)}
                    className={`cursor-pointer p-3 rounded mb-2 transition-all duration-300 ${
                      selectedCert === index 
                        ? 'bg-terminal-green text-terminal-dark' 
                        : 'hover:bg-terminal-gray border border-terminal-gray'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm">{cert.name}</div>
                        <div className="text-xs opacity-75">{cert.issuer}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs">{cert.date}</div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          cert.status === 'Active' ? 'bg-green-600' :
                          cert.status === 'Pursuing' ? 'bg-yellow-600' :
                          'bg-blue-600'
                        }`}>
                          {cert.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TerminalWindow>

          {/* Certificate Details */}
          <div className="cyber-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl text-terminal-cyan glow-text">
                {certificates[selectedCert].name}
              </h3>
              <span className={`px-3 py-1 rounded text-xs ${
                certificates[selectedCert].status === 'Active' ? 'bg-green-600' :
                certificates[selectedCert].status === 'Pursuing' ? 'bg-yellow-600' :
                'bg-blue-600'
              }`}>
                {certificates[selectedCert].status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-terminal-green mb-2">Issuing Authority:</h4>
                <p className="text-white">{certificates[selectedCert].issuer}</p>
              </div>

              <div>
                <h4 className="text-terminal-green mb-2">Date:</h4>
                <p className="text-white">{certificates[selectedCert].date}</p>
              </div>

              <div>
                <h4 className="text-terminal-green mb-2">Description:</h4>
                <p className="text-gray-300">{certificates[selectedCert].description}</p>
              </div>

              <div>
                <h4 className="text-terminal-green mb-3">Key Skills:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {certificates[selectedCert].skills.map((skill, index) => (
                    <div 
                      key={index}
                      className="bg-terminal-gray border border-terminal-cyan rounded px-3 py-2 text-center text-sm"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button className="cyber-card border border-terminal-green hover:bg-terminal-green hover:text-terminal-dark transition-all duration-300 px-6 py-2 rounded w-full">
                  View Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificatesSection;

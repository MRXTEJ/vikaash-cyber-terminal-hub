import { useState, useEffect } from 'react';
import TerminalWindow from './TerminalWindow';
import { supabase } from '@/integrations/supabase/client';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credential_url: string | null;
  description: string | null;
  display_order: number;
}

const CertificatesSection = () => {
  const [selectedCert, setSelectedCert] = useState(0);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = (link: string | null) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <section id="certificates" className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-terminal-green animate-pulse text-sm sm:text-base">Loading certificates...</p>
          </div>
        </div>
      </section>
    );
  }

  if (certificates.length === 0) {
    return (
      <section id="certificates" className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-terminal-green glow-text mb-4">
              &lt; Certificates /&gt;
            </h2>
            <p className="text-terminal-cyan text-sm sm:text-base">No certificates available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  const currentCert = certificates[selectedCert];

  return (
    <section id="certificates" className="py-12 sm:py-16 lg:py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-terminal-green glow-text mb-2 sm:mb-4">
            &lt; Certificates /&gt;
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-terminal-cyan">
            Professional certifications and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Certificate Terminal */}
          <TerminalWindow title="certificates.db">
            <div className="space-y-3">
              <div className="text-terminal-cyan text-xs sm:text-sm">
                SELECT * FROM certifications ORDER BY display_order;
              </div>
              <div className="border-t border-terminal-gray pt-3">
                {certificates.map((cert, index) => (
                  <div
                    key={cert.id}
                    onClick={() => setSelectedCert(index)}
                    className={`cursor-pointer p-2 sm:p-3 rounded mb-2 transition-all duration-300 ${
                      selectedCert === index 
                        ? 'bg-terminal-green text-terminal-dark' 
                        : 'hover:bg-terminal-gray border border-terminal-gray'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs sm:text-sm truncate">{cert.title}</div>
                        <div className="text-xs opacity-75">{cert.issuer}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs">{cert.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TerminalWindow>

          {/* Certificate Details */}
          <div className="cyber-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h3 className="text-lg sm:text-xl lg:text-2xl text-terminal-cyan glow-text">
                {currentCert.title}
              </h3>
            </div>

            <div className="flex gap-4">
              {/* Text Content */}
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div>
                  <h4 className="text-terminal-green mb-1 sm:mb-2 text-sm sm:text-base">Issuing Authority:</h4>
                  <p className="text-white text-sm sm:text-base">{currentCert.issuer}</p>
                </div>

                <div>
                  <h4 className="text-terminal-green mb-1 sm:mb-2 text-sm sm:text-base">Date:</h4>
                  <p className="text-white text-sm sm:text-base">{currentCert.date}</p>
                </div>

                {currentCert.description && (
                  <div>
                    <h4 className="text-terminal-green mb-1 sm:mb-2 text-sm sm:text-base">Description:</h4>
                    <p className="text-gray-300 text-sm sm:text-base">{currentCert.description}</p>
                  </div>
                )}

                <div className="pt-2 sm:pt-4">
                  <button 
                    onClick={() => handleViewCertificate(currentCert.credential_url)}
                    className={`cyber-card border transition-all duration-300 px-4 sm:px-6 py-2 rounded w-full text-sm sm:text-base ${
                      currentCert.credential_url 
                        ? 'border-terminal-green hover:bg-terminal-green hover:text-terminal-dark'
                        : 'border-gray-500 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!currentCert.credential_url}
                  >
                    View Certificate
                  </button>
                </div>
              </div>

              {/* Certificate Preview - Small with glowing line */}
              {currentCert.credential_url && (
                <div className="flex-shrink-0 flex items-stretch gap-2">
                  {/* Glowing vertical line */}
                  <div className="w-1 rounded-full bg-gradient-to-b from-terminal-green via-terminal-cyan to-terminal-green shadow-[0_0_10px_#00ff41,0_0_20px_#00ff41] animate-pulse" />
                  
                  <div className="w-24 sm:w-32">
                    {currentCert.credential_url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                      <img 
                        src={currentCert.credential_url} 
                        alt={currentCert.title}
                        className="w-full h-24 sm:h-32 object-cover rounded border border-terminal-gray cursor-pointer hover:border-terminal-green transition-all duration-300"
                        onClick={() => handleViewCertificate(currentCert.credential_url)}
                      />
                    ) : (
                      <div 
                        className="w-full h-24 sm:h-32 bg-terminal-gray/30 rounded border border-terminal-gray flex items-center justify-center cursor-pointer hover:border-terminal-green transition-all duration-300"
                        onClick={() => handleViewCertificate(currentCert.credential_url)}
                      >
                        <div className="text-center">
                          <div className="text-terminal-cyan text-2xl">📄</div>
                          <span className="text-terminal-green text-xs">PDF</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificatesSection;

import { useState, useEffect, useCallback } from 'react';
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

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewLoading, setPdfPreviewLoading] = useState(false);
  const [pdfPreviewError, setPdfPreviewError] = useState(false);

  const selectedCredentialUrl = certificates[selectedCert]?.credential_url ?? null;

  const fetchCertificates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCertificates(data || []);

      // Keep selected index valid after list changes
      setSelectedCert((prev) => Math.min(prev, Math.max((data?.length ?? 1) - 1, 0)));
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let objectUrl: string | null = null;
    const controller = new AbortController();

    const isPdf = !!selectedCredentialUrl && /\.pdf(\?|#|$)/i.test(selectedCredentialUrl);

    setPdfPreviewUrl(null);
    setPdfPreviewError(false);
    setPdfPreviewLoading(isPdf);

    if (!isPdf) {
      return () => {
        controller.abort();
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }

    (async () => {
      try {
        const res = await fetch(selectedCredentialUrl, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setPdfPreviewUrl(objectUrl);
      } catch (e) {
        setPdfPreviewError(true);
        setPdfPreviewUrl(null);
      } finally {
        setPdfPreviewLoading(false);
      }
    })();

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedCredentialUrl]);

  // Initial load
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Realtime subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('certificates-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'certificates',
        },
        () => {
          // Refetch on any change (INSERT, UPDATE, DELETE)
          fetchCertificates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCertificates]);

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

              {/* Certificate Preview with glowing border */}
              {currentCert.credential_url && (
                <div className="flex-shrink-0 w-32 sm:w-40">
                  <div className="p-[2px] rounded-lg bg-gradient-to-br from-terminal-green via-terminal-cyan to-terminal-green shadow-[0_0_10px_#00ff41]">
                    {/\.(jpg|jpeg|png|webp|gif)$/i.test(currentCert.credential_url) ? (
                      <img
                        src={currentCert.credential_url}
                        alt={currentCert.title}
                        loading="lazy"
                        className="w-full h-32 sm:h-40 object-cover rounded cursor-pointer"
                        onClick={() => handleViewCertificate(currentCert.credential_url)}
                      />
                    ) : /\.pdf(\?|#|$)/i.test(currentCert.credential_url) ? (
                      <div
                        className="w-full h-32 sm:h-40 bg-terminal-dark rounded overflow-hidden cursor-pointer relative group"
                        onClick={() => handleViewCertificate(currentCert.credential_url)}
                      >
                        {pdfPreviewUrl ? (
                          <iframe
                            key={pdfPreviewUrl}
                            src={pdfPreviewUrl}
                            className="w-full h-full pointer-events-none"
                            title={currentCert.title}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <div className="text-terminal-cyan text-2xl">📄</div>
                            {pdfPreviewLoading ? (
                              <span className="text-terminal-green text-xs">Loading PDF...</span>
                            ) : pdfPreviewError ? (
                              <span className="text-terminal-green text-xs">PDF preview not supported</span>
                            ) : (
                              <span className="text-terminal-green text-xs">Select to preview</span>
                            )}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-transparent group-hover:bg-terminal-green/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-terminal-green text-xs font-bold transition-opacity">
                            Click to view
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-full h-32 sm:h-40 bg-terminal-dark rounded flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => handleViewCertificate(currentCert.credential_url)}
                      >
                        <div className="text-terminal-cyan text-2xl">🔗</div>
                        <span className="text-terminal-green text-xs">Open link</span>
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

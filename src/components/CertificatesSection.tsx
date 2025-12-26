import { useState, useEffect, useCallback } from 'react';
import TerminalWindow from './TerminalWindow';
import CertificateViewer from './CertificateViewer';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/useTheme';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credential_url: string | null;
  thumbnail_url: string | null;
  description: string | null;
  display_order: number;
}

const CertificatesSection = () => {
  const [selectedCert, setSelectedCert] = useState(0);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const { theme } = useTheme();

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

  const handleOpenViewer = () => {
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
  };

  if (loading) {
    return (
      <section id="certificates" className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className={`animate-pulse text-sm sm:text-base ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>Loading certificates...</p>
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
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-terminal-green glow-text' : 'text-primary'}`}>
              &lt; Certificates /&gt;
            </h2>
            <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>No certificates available yet.</p>
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
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 ${theme === 'dark' ? 'text-terminal-green glow-text' : 'text-primary'}`}>
            &lt; Certificates /&gt;
          </h2>
          <p className={`text-base sm:text-lg lg:text-xl ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>
            Professional certifications and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Certificate Terminal */}
          <TerminalWindow title="certificates.db">
            <div className="space-y-3">
              <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>
                SELECT * FROM certifications ORDER BY display_order;
              </div>
              <div className={`border-t pt-3 ${theme === 'dark' ? 'border-terminal-gray' : 'border-border'}`}>
                {certificates.map((cert, index) => (
                  <div
                    key={cert.id}
                    onClick={() => setSelectedCert(index)}
                    className={`cursor-pointer p-2 sm:p-3 rounded mb-2 transition-all duration-300 ${
                      selectedCert === index 
                        ? theme === 'dark' ? 'bg-terminal-green text-terminal-dark' : 'bg-primary text-primary-foreground'
                        : theme === 'dark' ? 'hover:bg-terminal-gray border border-terminal-gray' : 'hover:bg-muted border border-border'
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
          <div className={`cyber-card ${theme === 'light' ? 'bg-card border-border' : ''}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
              <h3 className={`text-lg sm:text-xl lg:text-2xl ${theme === 'dark' ? 'text-terminal-cyan glow-text' : 'text-secondary font-semibold'}`}>
                {currentCert.title}
              </h3>
            </div>

            <div className="flex gap-4">
              {/* Text Content */}
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div>
                  <h4 className={`mb-1 sm:mb-2 text-sm sm:text-base ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>Issuing Authority:</h4>
                  <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}>{currentCert.issuer}</p>
                </div>

                <div>
                  <h4 className={`mb-1 sm:mb-2 text-sm sm:text-base ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>Date:</h4>
                  <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-white' : 'text-foreground'}`}>{currentCert.date}</p>
                </div>

                {currentCert.description && (
                  <div>
                    <h4 className={`mb-1 sm:mb-2 text-sm sm:text-base ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>Description:</h4>
                    <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'}`}>{currentCert.description}</p>
                  </div>
                )}

                <div className="pt-2 sm:pt-4">
                  <button 
                    onClick={handleOpenViewer}
                    className={`cyber-card border transition-all duration-300 px-4 sm:px-6 py-2 rounded w-full text-sm sm:text-base ${
                      currentCert.credential_url || currentCert.thumbnail_url
                        ? theme === 'dark' 
                          ? 'border-terminal-green hover:bg-terminal-green hover:text-terminal-dark'
                          : 'border-primary hover:bg-primary hover:text-primary-foreground bg-card'
                        : 'border-muted-foreground/30 text-muted-foreground cursor-not-allowed'
                    }`}
                    disabled={!currentCert.credential_url && !currentCert.thumbnail_url}
                  >
                    View Certificate
                  </button>
                </div>
              </div>

              {/* Certificate Preview with glowing border */}
              {(currentCert.thumbnail_url || currentCert.credential_url) && (
                <div className="flex-shrink-0">
                  <div className={`p-[2px] rounded-lg ${theme === 'dark' ? 'bg-gradient-to-br from-terminal-green via-terminal-cyan to-terminal-green shadow-[0_0_10px_#00ff41]' : 'bg-gradient-to-br from-primary via-secondary to-primary shadow-lg'}`}>
                    {currentCert.thumbnail_url ? (
                      <img
                        src={currentCert.thumbnail_url}
                        alt={currentCert.title}
                        loading="lazy"
                        className={`max-w-32 sm:max-w-40 max-h-44 sm:max-h-52 w-auto h-auto object-contain rounded cursor-pointer ${theme === 'dark' ? 'bg-terminal-dark' : 'bg-card'}`}
                        onClick={handleOpenViewer}
                      />
                    ) : /\.(jpg|jpeg|png|webp|gif)$/i.test(currentCert.credential_url || '') ? (
                      <img
                        src={currentCert.credential_url!}
                        alt={currentCert.title}
                        loading="lazy"
                        className={`max-w-32 sm:max-w-40 max-h-44 sm:max-h-52 w-auto h-auto object-contain rounded cursor-pointer ${theme === 'dark' ? 'bg-terminal-dark' : 'bg-card'}`}
                        onClick={handleOpenViewer}
                      />
                    ) : /\.pdf(\?|#|$)/i.test(currentCert.credential_url || '') ? (
                      <div
                        className={`w-32 sm:w-40 h-44 sm:h-52 rounded overflow-hidden cursor-pointer relative group ${theme === 'dark' ? 'bg-terminal-dark' : 'bg-card'}`}
                        onClick={handleOpenViewer}
                      >
                        {pdfPreviewUrl ? (
                          <div className="w-full h-full overflow-hidden">
                            <iframe
                              key={pdfPreviewUrl}
                              src={pdfPreviewUrl}
                              className="w-[250%] h-[250%] origin-top-left scale-[0.4] pointer-events-none border-0"
                              title={currentCert.title}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <div className={`text-2xl ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>📄</div>
                            {pdfPreviewLoading ? (
                              <span className={`text-xs ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>Loading...</span>
                            ) : pdfPreviewError ? (
                              <span className={`text-xs ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>Click to view</span>
                            ) : (
                              <span className={`text-xs ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>PDF</span>
                            )}
                          </div>
                        )}
                        <div className={`absolute inset-0 bg-transparent transition-colors flex items-end justify-center pb-2 ${theme === 'dark' ? 'group-hover:bg-terminal-green/10' : 'group-hover:bg-primary/10'}`}>
                          <span className={`opacity-0 group-hover:opacity-100 text-xs font-bold transition-opacity px-2 py-1 rounded ${theme === 'dark' ? 'text-terminal-green bg-terminal-dark/80' : 'text-primary bg-card/80'}`}>
                            Click to view
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-32 sm:w-40 h-32 sm:h-40 rounded flex flex-col items-center justify-center cursor-pointer ${theme === 'dark' ? 'bg-terminal-dark' : 'bg-card'}`}
                        onClick={handleOpenViewer}
                      >
                        <div className={`text-2xl ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>🔗</div>
                        <span className={`text-xs mt-1 ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>Open link</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Certificate Viewer */}
      <CertificateViewer
        isOpen={viewerOpen}
        onClose={handleCloseViewer}
        title={currentCert.title}
        imageUrl={currentCert.thumbnail_url || (/\.(jpg|jpeg|png|webp|gif)$/i.test(currentCert.credential_url || '') ? currentCert.credential_url : null)}
        pdfUrl={/\.pdf(\?|#|$)/i.test(currentCert.credential_url || '') ? currentCert.credential_url : null}
        credentialUrl={currentCert.credential_url}
      />
    </section>
  );
};

export default CertificatesSection;

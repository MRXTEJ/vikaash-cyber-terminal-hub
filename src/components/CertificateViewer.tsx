import { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink } from 'lucide-react';

interface CertificateViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl?: string | null;
  pdfUrl?: string | null;
  credentialUrl?: string | null;
}

const CertificateViewer = ({ 
  isOpen, 
  onClose, 
  title, 
  imageUrl, 
  pdfUrl,
  credentialUrl 
}: CertificateViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const url = imageUrl || pdfUrl || credentialUrl;
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleOpenExternal = () => {
    const url = credentialUrl || imageUrl || pdfUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const isPdf = pdfUrl || (credentialUrl && /\.pdf(\?|#|$)/i.test(credentialUrl));
  const displayUrl = imageUrl || pdfUrl || credentialUrl;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 sm:p-4 bg-terminal-dark/80 border-b border-terminal-green/30"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-terminal-green font-bold text-sm sm:text-lg truncate max-w-[50%]">
          {title}
        </h3>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-terminal-dark rounded-lg border border-terminal-green/30 p-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 sm:p-2 text-terminal-cyan hover:text-terminal-green hover:bg-terminal-green/10 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span className="text-terminal-green text-xs sm:text-sm min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 sm:p-2 text-terminal-cyan hover:text-terminal-green hover:bg-terminal-green/10 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Rotate (only for images) */}
          {!isPdf && (
            <button
              onClick={handleRotate}
              className="p-1.5 sm:p-2 text-terminal-cyan hover:text-terminal-green hover:bg-terminal-green/10 rounded border border-terminal-green/30 transition-colors"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Open External */}
          <button
            onClick={handleOpenExternal}
            className="p-1.5 sm:p-2 text-terminal-cyan hover:text-terminal-green hover:bg-terminal-green/10 rounded border border-terminal-green/30 transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 sm:p-2 text-terminal-cyan hover:text-terminal-green hover:bg-terminal-green/10 rounded border border-terminal-green/30 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-terminal-cyan hover:text-red-500 hover:bg-red-500/10 rounded border border-terminal-green/30 transition-colors ml-1 sm:ml-2"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        className="flex-1 overflow-auto flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isPdf ? (
          <iframe
            src={displayUrl || ''}
            className="w-full h-full max-w-4xl rounded-lg border border-terminal-green/30"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease'
            }}
            title={title}
          />
        ) : displayUrl ? (
          <img
            src={displayUrl}
            alt={title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_30px_rgba(0,255,65,0.3)]"
            style={{ 
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease'
            }}
            onDoubleClick={handleReset}
          />
        ) : (
          <div className="text-terminal-cyan text-center">
            <p>No preview available</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-2 text-center text-terminal-green/50 text-xs">
        {!isPdf && "Double-click image to reset • "}Click outside to close
      </div>
    </div>
  );
};

export default CertificateViewer;

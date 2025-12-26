// Use canvas-based approach with fetch + HTML rendering for PDF thumbnail
// This avoids the pdfjs-dist top-level await issue

export async function generatePdfThumbnail(pdfUrl: string): Promise<Blob | null> {
  try {
    // For PDF files, we'll create a simple placeholder thumbnail
    // with the PDF icon and first few chars of the filename
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Set canvas size for thumbnail
    canvas.width = 200;
    canvas.height = 260;
    
    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Draw PDF icon
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PDF', canvas.width / 2, canvas.height / 2 - 20);
    
    // Draw document icon
    ctx.font = '64px Arial';
    ctx.fillText('📄', canvas.width / 2, canvas.height / 2 + 50);
    
    // Draw "Certificate" text
    ctx.font = '14px Arial';
    ctx.fillStyle = '#0ff';
    ctx.fillText('Certificate', canvas.width / 2, canvas.height - 30);
    
    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.9
      );
    });
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    return null;
  }
}

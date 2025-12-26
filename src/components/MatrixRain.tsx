import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Different characters for each theme
    const darkChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const lightChars = '{}[]<>/\\|=+-*&^%$#@!?;:.,~`ABCDEFabcdef0123456789';
    
    const chars = theme === 'dark' ? darkChars : lightChars;
    const charArray = chars.split('');

    const fontSize = theme === 'dark' ? 14 : 12;
    const columns = canvas.width / fontSize;

    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    // Theme-specific colors
    const getColors = () => {
      if (theme === 'dark') {
        return {
          bg: 'rgba(5, 5, 5, 0.05)',
          primary: '#00ff41',
          secondary: '#00cc33',
          accent: '#ff0040'
        };
      } else {
        return {
          bg: 'rgba(250, 250, 245, 0.08)',
          primary: 'hsl(140, 70%, 35%)',
          secondary: 'hsl(180, 60%, 40%)',
          accent: 'hsl(0, 70%, 50%)'
        };
      }
    };

    const colors = getColors();

    const draw = () => {
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // Vary colors slightly for visual interest
        const colorChoice = Math.random();
        if (colorChoice > 0.98) {
          ctx.fillStyle = colors.accent;
        } else if (colorChoice > 0.9) {
          ctx.fillStyle = colors.secondary;
        } else {
          ctx.fillStyle = colors.primary;
        }

        // Add slight transparency variation
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        ctx.globalAlpha = 1;

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, theme === 'dark' ? 35 : 50);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 transition-opacity duration-500"
      style={{ opacity: theme === 'dark' ? 0.1 : 0.06 }}
    />
  );
};

export default MatrixRain;

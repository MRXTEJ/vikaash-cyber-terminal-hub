
import { useState, useEffect } from 'react';

interface TypeWriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

const TypeWriter = ({ text, speed = 50, className = '', onComplete }: TypeWriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-terminal-blink">_</span>
    </span>
  );
};

export default TypeWriter;

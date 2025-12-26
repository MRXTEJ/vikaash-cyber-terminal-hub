import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface TerminalWindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const TerminalWindow = ({ title, children, className = '' }: TerminalWindowProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`rounded-lg border ${theme === 'dark' ? 'bg-terminal-dark border-terminal-gray shadow-[0_0_20px_rgba(255,0,64,0.1)]' : 'bg-card border-border shadow-lg'} ${className}`}>
      <div className={`flex items-center p-2 lg:p-3 border-b ${theme === 'dark' ? 'border-terminal-gray' : 'border-border'}`}>
        <div className="w-2 lg:w-3 h-2 lg:h-3 rounded-full mr-1 lg:mr-2 bg-red-500"></div>
        <div className="w-2 lg:w-3 h-2 lg:h-3 rounded-full mr-1 lg:mr-2 bg-yellow-500"></div>
        <div className="w-2 lg:w-3 h-2 lg:h-3 rounded-full mr-1 lg:mr-2 bg-green-500"></div>
        <span className={`text-sm ml-3 ${theme === 'dark' ? 'text-terminal-green' : 'text-primary'}`}>{title}</span>
        <span className={`text-xs ml-auto ${theme === 'dark' ? 'text-terminal-cyan' : 'text-secondary'}`}>
          {currentTime.toLocaleTimeString()}
        </span>
      </div>
      <div className="p-3 lg:p-4 font-mono text-xs lg:text-sm">
        {children}
      </div>
    </div>
  );
};

export default TerminalWindow;

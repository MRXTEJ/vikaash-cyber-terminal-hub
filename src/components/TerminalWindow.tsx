
import { useState, useEffect } from 'react';

interface TerminalWindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const TerminalWindow = ({ title, children, className = '' }: TerminalWindowProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`terminal-window ${className}`}>
      <div className="terminal-header">
        <div className="terminal-dot bg-red-500"></div>
        <div className="terminal-dot bg-yellow-500"></div>
        <div className="terminal-dot bg-green-500"></div>
        <span className="text-terminal-green text-sm ml-3">{title}</span>
        <span className="text-terminal-cyan text-xs ml-auto">
          {currentTime.toLocaleTimeString()}
        </span>
      </div>
      <div className="terminal-content">
        {children}
      </div>
    </div>
  );
};

export default TerminalWindow;


import React from 'react';

type LogoProps = {
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img src="/media/logo.png" alt="StyleMatch Logo" className="h-12 w-auto" />
    </div>
  );
};

export default Logo;


import React from 'react';

type LogoProps = {
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img src="/lovable-uploads/ab7a3cb6-856b-4dc7-bedd-f4b2138593e8.png" alt="StyleMatch Logo" className="h-12 w-auto" />
    </div>
  );
};

export default Logo;

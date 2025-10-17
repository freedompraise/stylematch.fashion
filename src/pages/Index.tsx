
import React from 'react';
import Navbar from '@/components/Navbar';
import StyleMatchLanding from '@/components/StyleMatchLanding';
import SupportChat from '@/components/SupportChat';

const Index: React.FC = () => {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />
        <StyleMatchLanding />
      </div>
      <SupportChat isVendor={false} />
    </>
  );
};

export default Index;

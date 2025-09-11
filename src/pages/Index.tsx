
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Benefits from '@/components/Benefits';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/stores';
import { useEffect } from 'react';
import SupportChat from '@/components/SupportChat';

const Index: React.FC = () => {
  const { user } = useAuthStore();
  return (
    <>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Hero />
        <Features />
        <Benefits />
        {/* <Testimonials /> */}
        <CallToAction />
        <Footer />
      </div>
      <SupportChat isVendor={false} />
    </>
  );
};

export default Index;

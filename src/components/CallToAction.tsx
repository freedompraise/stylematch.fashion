
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const CallToAction: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <section id="cta" className="section bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-bold text-baseContent mb-4">Ready to Start Your Fashion Journey?</h2>
          <p className="text-baseContent-secondary text-lg mb-8">
            Join StyleMatch today and create your free online store. No setup fees, no monthly costs - just pure fashion success.
          </p>
          <Button size="lg" onClick={handleGetStarted}>Get Started Free</Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;

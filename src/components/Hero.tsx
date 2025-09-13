
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { ArrowRight, ShoppingBag, TrendingUp, Users } from 'lucide-react';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <section className="pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden bg-gradient-to-br from-background to-muted">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-baseContent mb-6 leading-tight">
              Transform Your <span className="text-primary">Fashion Business</span> Into a Digital Success
            </h1>
            <p className="text-lg md:text-xl text-baseContent/80 mb-8 leading-relaxed max-w-xl">
              Stylematch helps local fashion vendors create stunning online stores with powerful tools that boost sales and customer engagement.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Button size="lg" className="rounded-lg group" onClick={handleGetStarted}>
                Start Selling Online
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-lg" onClick={handleGetStarted}>
                Explore Features
              </Button>
            </div>
            
            {/* <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <ShoppingBag size={20} className="text-primary" />
                </div>
                <p className="font-semibold">500+ Active Vendors</p>
              </div>
              <div className="flex items-center">
                <div className="bg-secondary/10 p-2 rounded-full mr-3">
                  <TrendingUp size={20} className="text-secondary" />
                </div>
                <p className="font-semibold">85% Increase in Sales</p>
              </div>
              <div className="flex items-center">
                <div className="bg-baseContent-secondary/10 p-2 rounded-full mr-3">
                  <Users size={20} className="text-baseContent-secondary" />
                </div>
                <p className="font-semibold">10k+ Daily Customers</p>
              </div>
            </div> */}
          </div>
          
          <div className="relative animate-scale-in">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=1287&auto=format&fit=crop" 
                alt="Fashion vendor managing inventory" 
                className="w-full h-auto object-cover mix-blend-overlay opacity-60"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-primary-foreground">
                <h3 className="text-2xl font-bold mb-2">Your Style. Your Store.</h3>
                <p className="mb-4">Join hundreds of fashion vendors already thriving online with Stylematch.</p>
                <Button 
                  variant="primary" 
                  className="bg-background text-primary hover:bg-background/90 w-full md:w-auto text-center"
                  onClick={handleGetStarted}
                >
                  Start Your Journey
                </Button>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-background rounded-lg p-4 shadow-xl max-w-xs hidden md:block">
              <div className="flex items-center mb-2">
                <div className="h-3 w-3 bg-success rounded-full mr-2"></div>
                <p className="text-sm font-semibold">Sales are up 24% this month</p>
              </div>
              <div className="h-10 bg-muted rounded-md flex overflow-hidden">
                <div className="h-full bg-primary w-1/4"></div>
                <div className="h-full bg-secondary w-1/2"></div>
                <div className="h-full bg-success w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* <div className="container mt-20">
        <div className="text-center">
          <p className="text-baseContent-secondary font-medium mb-4">TRUSTED BY FASHION ENTREPRENEURS NATIONWIDE</p>
          <div className="flex justify-center gap-8 md:gap-16 flex-wrap opacity-70">
            <img src="https://tailwindui.com/img/logos/tuple-logo-gray-900.svg" alt="Company" className="h-8" />
            <img src="https://tailwindui.com/img/logos/mirage-logo-gray-900.svg" alt="Company" className="h-8" />
            <img src="https://tailwindui.com/img/logos/statickit-logo-gray-900.svg" alt="Company" className="h-8" />
            <img src="https://tailwindui.com/img/logos/transistor-logo-gray-900.svg" alt="Company" className="h-8" />
            <img src="https://tailwindui.com/img/logos/workcation-logo-gray-900.svg" alt="Company" className="h-8" />
          </div>
        </div>
      </div> */}
    </section>
  );
};

export default Hero;

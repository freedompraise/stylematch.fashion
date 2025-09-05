
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Zap, Globe, BadgePercent } from 'lucide-react';
import Button from './Button';

const Benefits: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <section id="benefits" className="section bg-gray-50">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-bold text-baseContent mb-6">Transform Your Business with Digital Elegance</h2>
            <p className="text-baseContent-secondary text-lg mb-8">
              Take your fashion brand to new heights with a digital storefront that's as stylish as your products. 
              Our platform delivers more than just an online presence—it creates an experience.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Increased Revenue</h3>
                  <p className="text-baseContent-secondary">Vendors report an average 85% increase in sales after joining Stylematch.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-secondary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Effortless Management</h3>
                  <p className="text-baseContent-secondary">Spend less time on administration and more time on fashion with our intuitive tools.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Wider Reach</h3>
                  <p className="text-baseContent-secondary">Expand your customer base beyond geographical limitations.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-secondary/10 p-3 rounded-full h-12 w-12 flex items-center justify-center shrink-0">
                  <BadgePercent className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Data-Driven Decisions</h3>
                  <p className="text-baseContent-secondary">Make informed inventory and marketing choices with real-time analytics.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <Button size="lg" onClick={handleGetStarted}>Start Your Fashion Journey</Button>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1470&auto=format&fit=crop"
              alt="Fashion retail experience" 
              className="rounded-xl shadow-xl w-full"
            />
            
            <div className="absolute -bottom-8 -left-8 bg-white rounded-lg p-6 shadow-xl max-w-xs">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <p className="font-semibold text-sm">Real-time Dashboard</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Sales</span>
                  <span className="font-semibold text-green-600">+24%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-3/4 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span>Customer Growth</span>
                  <span className="font-semibold text-green-600">+36%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-4/5 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;


import React from 'react';
import Button from './Button';
import { Check } from 'lucide-react';

const CallToAction: React.FC = () => {
  return (
    <section id="pricing" className="section bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-bold text-baseContent mb-4">Ready to Transform Your Fashion Business?</h2>
          <p className="text-baseContent-secondary text-lg">Join our community of successful fashion entrepreneurs and take your business to the next level.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Plan */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">Starter</h3>
            <p className="text-baseContent-secondary mb-6">Perfect for new fashion vendors</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-baseContent-secondary">/month</span>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Basic online store</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Up to 50 products</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Basic analytics</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Standard payment processing</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">Get Started</Button>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-primary text-white rounded-xl shadow-xl p-8 transform scale-105 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary text-white px-4 py-1 rounded-full text-sm font-bold">
              Most Popular
            </div>
            <h3 className="text-xl font-bold mb-2">Professional</h3>
            <p className="text-white/80 mb-6">For growing fashion businesses</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$79</span>
              <span className="text-white/80">/month</span>
            </div>
            
            <div className="space-y-4 mb-8 text-white">
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3" />
                <span>Premium online store</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3" />
                <span>Up to 500 products</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3" />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3" />
                <span>Reduced payment fees</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3" />
                <span>Priority support</span>
              </div>
            </div>
            
            <Button className="w-full bg-white text-primary hover:bg-white/90">Get Started</Button>
          </div>
          
          {/* Enterprise Plan */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">Enterprise</h3>
            <p className="text-baseContent-secondary mb-6">For established fashion brands</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">$199</span>
              <span className="text-baseContent-secondary">/month</span>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Custom online store</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Unlimited products</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Enterprise analytics</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Lowest payment fees</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>24/7 dedicated support</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>API access</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">Contact Sales</Button>
          </div>
        </div>
        
        <div className="mt-16 text-center bg-gray-50 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl font-bold mb-4">Not sure which plan is right for you?</h3>
          <p className="text-baseContent-secondary text-lg mb-8 max-w-2xl mx-auto">
            Schedule a free consultation with our fashion e-commerce experts and get personalized recommendations for your business.
          </p>
          <Button size="lg">Book a Free Consultation</Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;

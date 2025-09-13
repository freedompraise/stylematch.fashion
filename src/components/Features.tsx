
import React from 'react';
import { ShoppingBag, BarChart3, CreditCard, Upload, Heart, Package } from 'lucide-react';

const features = [
  {
    icon: <ShoppingBag className="h-8 w-8 text-primary" />,
    title: "Elegant Storefront",
    description: "Create a stunning online store that reflects your brand identity and showcases your products beautifully."
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: "Real-Time Analytics",
    description: "Track sales, monitor product performance, and gain insights to optimize your business strategy."
  },
  {
    icon: <CreditCard className="h-8 w-8 text-primary" />,
    title: "Secure Payments",
    description: "Accept payments safely with Paystack integration, eliminating the need for manual verification (coming soon)."
  },
  {
    icon: <Upload className="h-8 w-8 text-primary" />,
    title: "Flexible Product Upload",
    description: "Choose from single upload, batch processing, or import directly from your existing catalogs."
  },
  {
    icon: <Heart className="h-8 w-8 text-primary" />,
    title: "Customer Engagement",
    description: "Get alerts when products are trending, wishlisted, or receiving high engagement."
  },
  {
    icon: <Package className="h-8 w-8 text-primary" />,
    title: "Order Management",
    description: "Efficiently handle orders, update statuses, and manage inventory in one place."
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="section bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-bold text-baseContent mb-4">Powerful Features for Fashion Success</h2>
          <p className="text-baseContent-secondary text-lg">Everything you need to transform your local fashion business into a thriving online store.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-background p-6 rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow group"
            >
              <div className="bg-primary/5 p-3 rounded-lg inline-block mb-4 group-hover:bg-primary/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-baseContent">{feature.title}</h3>
              <p className="text-baseContent-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

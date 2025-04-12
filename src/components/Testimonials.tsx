
import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    content: "Stylematch transformed my small boutique into a thriving online business. Sales have increased by 70% and I can finally reach customers beyond my local area.",
    author: "Sophia Chen",
    role: "Fashion Boutique Owner",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=faces"
  },
  {
    content: "The analytics dashboard gives me insights I never had before. Now I know which products are trending and can stock up accordingly. Game changer!",
    author: "Marcus Johnson",
    role: "Mens Apparel Store",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces"
  },
  {
    content: "The product upload feature saved me hours of work. I imported my entire Instagram catalog in minutes and was selling online the same day.",
    author: "Aisha Williams",
    role: "Vintage Fashion Retailer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="section bg-gradient-to-br from-primary to-secondary text-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-bold mb-4">Success Stories from Fashion Entrepreneurs</h2>
          <p className="text-white/80 text-lg">Join hundreds of vendors who have transformed their business with Stylematch.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-white leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author} 
                  className="h-12 w-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-white/70 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

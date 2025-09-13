
import React from 'react';
import Logo from './Logo';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-foreground text-foreground pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Logo className="mb-6 brightness-0 invert" />
            <p className="mb-6 text-foreground/80">
              Transforming local businesses into credible online stores with ease and efficiency.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-foreground/10 p-2 rounded-full hover:bg-foreground/20 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-foreground/10 p-2 rounded-full hover:bg-foreground/20 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-foreground/10 p-2 rounded-full hover:bg-foreground/20 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Fashion Blog</a></li>
              <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail size={18} className="mr-3 text-secondary" />
                <a href="mailto:info@stylematch.com" className="text-foreground/80 hover:text-foreground transition-colors">marketmatchofficial@gmail.com</a>
              </li>
              <li className="flex items-center">
                <MapPin size={18} className="mr-3 text-secondary" />
                <span className="text-foreground/80">Lagos, Nigeria</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 text-secondary" />
                <a href="tel:+2349074577147" className="text-foreground/80 hover:text-foreground transition-colors">+234 907 457 7147</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-foreground/10 pt-8 mt-8 text-center md:text-left md:flex md:justify-between md:items-center">
          <p className="text-foreground/60 mb-4 md:mb-0">
            © 2025 Stylematch. All rights reserved.
          </p>
          <div className="space-x-6">
            <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

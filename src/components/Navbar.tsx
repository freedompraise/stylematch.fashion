
import React, { useState } from 'react';
import Logo from './Logo';
import Button from './Button';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="container flex items-center justify-between py-4">
        <Logo />
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-baseContent hover:text-primary transition-colors font-semibold">Features</a>
          <a href="#benefits" className="text-baseContent hover:text-primary transition-colors font-semibold">Benefits</a>
          <a href="#testimonials" className="text-baseContent hover:text-primary transition-colors font-semibold">Success Stories</a>
          <a href="#pricing" className="text-baseContent hover:text-primary transition-colors font-semibold">Pricing</a>
          <Button variant="primary" size="sm">Get Started</Button>
          <Button variant="outline" size="sm">Login</Button>
        </nav>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg animate-fade-in">
          <div className="container py-4 flex flex-col space-y-4">
            <a 
              href="#features" 
              className="text-baseContent hover:text-primary py-3 border-b border-gray-100 font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#benefits" 
              className="text-baseContent hover:text-primary py-3 border-b border-gray-100 font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Benefits
            </a>
            <a 
              href="#testimonials" 
              className="text-baseContent hover:text-primary py-3 border-b border-gray-100 font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Success Stories
            </a>
            <a 
              href="#pricing" 
              className="text-baseContent hover:text-primary py-3 border-b border-gray-100 font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="flex flex-col space-y-3 py-3">
              <Button variant="primary" onClick={() => setIsMenuOpen(false)}>Get Started</Button>
              <Button variant="outline" onClick={() => setIsMenuOpen(false)}>Login</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

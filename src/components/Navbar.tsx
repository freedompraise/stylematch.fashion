
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import Button from './Button';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed w-full bg-background/95 backdrop-blur-sm shadow-sm z-50">
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
          <a href="#roadmap" className="text-baseContent hover:text-primary transition-colors font-semibold">Roadmap</a>
          <a href="#feedback" className="text-baseContent hover:text-primary transition-colors font-semibold">Feedback</a>
          <Link to="/auth">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </nav>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background shadow-lg animate-fade-in">
          <div className="container py-4 flex flex-col space-y-4">
            <a 
              href="#roadmap" 
              className="text-baseContent hover:text-primary py-3 border-b border-border font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Roadmap
            </a>
            <a 
              href="#feedback" 
              className="text-baseContent hover:text-primary py-3 border-b border-border font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Feedback
            </a>
            <div className="py-3">
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

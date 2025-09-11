// src/components/SupportChat.tsx
import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWhatsAppUrl } from '@/config/support';

interface SupportChatProps {
  variant?: 'floating' | 'inline';
  className?: string;
  isVendor?: boolean;
}

const SupportChat: React.FC<SupportChatProps> = ({
  variant = 'floating',
  className = '',
  isVendor = true
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    const whatsappUrl = getWhatsAppUrl(undefined, isVendor);
    window.open(whatsappUrl, '_blank');
  };

  if (variant === 'inline') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="mr-2" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-base-content-secondary">
            Our support team is available to help you with any questions or issues.
          </p>
          <Button onClick={handleWhatsAppClick} className="w-full">
            Chat with Us on WhatsApp
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {isOpen && (
        <Card className="mb-2 w-72 origin-bottom-right animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Live Support
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-base-content-secondary">
              Have questions? Chat with our support team on WhatsApp.
            </p>
            <Button onClick={handleWhatsAppClick} className="w-full">
              Start Chat
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
      <Button
        size="icon"
        className="rounded-full h-14 w-14 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle support chat"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>
    </div>
  );
};

export default SupportChat;

import React from 'react';

const PendingVerification: React.FC = () => {
  return (
    <div className="text-center py-12 px-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Store Profile Under Review</h1>
      <p className="mb-6 text-baseContent-secondary">
        Thanks for completing your store setup!<br />
        Our team is reviewing your profile.<br />
        This usually takes 1-2 business days.
      </p>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-full max-w-xs">
          <ol className="relative border-l border-border">
            <li className="mb-10 ml-6">
              <span className="flex absolute -left-3 justify-center items-center w-6 h-6 bg-primary rounded-full ring-8 ring-background">
                <span className="w-2 h-2 bg-background rounded-full"></span>
              </span>
              <h3 className="font-medium leading-tight">Profile Submitted</h3>
              <p className="text-sm text-muted-foreground">You&apos;ve completed onboarding</p>
            </li>
            <li className="mb-10 ml-6">
              <span className="flex absolute -left-3 justify-center items-center w-6 h-6 bg-muted rounded-full ring-8 ring-background"></span>
              <h3 className="font-medium leading-tight">Under Review</h3>
              <p className="text-sm text-muted-foreground">Our team is checking your details</p>
            </li>
            
            <li className="ml-6">
              <span className="flex absolute -left-3 justify-center items-center w-6 h-6 bg-muted rounded-full ring-8 ring-background"></span>
              <h3 className="font-medium leading-tight">Verification Complete</h3>
              <p className="text-sm text-muted-foreground">You&apos;ll get an email when approved</p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PendingVerification; 
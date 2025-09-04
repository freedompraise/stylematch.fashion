import React from 'react'

export const MockCloudinaryImage = ({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height}
      className={className}
      data-testid="cloudinary-image" 
    />
  )
}

export const MockVendorRouteGuard = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return <div data-testid="vendor-route-guard">{children}</div>
}

export const MockLogo = () => {
  return <div data-testid="logo">StyleMatch</div>
}

export const MockToast = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="toast">{children}</div>
}

export const MockLoadingSpinner = () => {
  return <div data-testid="loading-spinner">Loading...</div>
}

export const MockErrorBoundary = ({ 
  children, 
  hasError = false 
}: { 
  children: React.ReactNode
  hasError?: boolean 
}) => {
  if (hasError) {
    return <div data-testid="error-boundary">Something went wrong</div>
  }
  return <>{children}</>
}

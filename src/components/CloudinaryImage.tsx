import React from 'react';
import { Image } from 'cloudinary-react';

interface CloudinaryImageProps {
  publicId: string;
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  quality?: number;
  format?: string;
  className?: string;
  alt?: string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
}

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  publicId,
  width,
  height,
  crop = 'fill',
  gravity = 'auto',
  quality = 'auto',
  format = 'auto',
  className = '',
  alt = '',
  onClick,
}) => {
  return (
    <Image
      cloudName={import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}
      publicId={publicId}
      width={width}
      height={height}
      crop={crop}
      gravity={gravity}
      quality={quality}
      format={format}
      className={className}
      alt={alt}
      onClick={onClick}
    />
  );
};

export default CloudinaryImage; 
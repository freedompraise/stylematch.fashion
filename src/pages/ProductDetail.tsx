import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail: React.FC = () => {
  const { vendorSlug, productId } = useParams();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Product Detail Page</h1>
      <p>Vendor: {vendorSlug}</p>
      <p>Product ID: {productId}</p>
      <p>This is a placeholder. Product details will be shown here.</p>
    </div>
  );
};

export default ProductDetail; 
import React from 'react';
import { ProductCMS } from './ProductCMS';

export const ProductsSub: React.FC<{ subPage?: string }> = ({ subPage = 'catalog' }) => {
  return <ProductCMS />;
};

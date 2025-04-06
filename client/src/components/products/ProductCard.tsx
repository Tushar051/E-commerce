import React from 'react';
import { Link } from 'wouter';
import { Heart } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatCurrency, calculateDiscountPercentage, getProductUrl, getStarRating } from '@/lib/utils';
import { useCart } from '@/lib/context/CartContext';
import { useWishlist } from '@/lib/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  
  const { full, half, empty } = getStarRating(product.rating || 0);
  const discountPercentage = calculateDiscountPercentage(product.price, product.compareAtPrice);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group">
      <Link href={getProductUrl(product.slug)} className="block relative">
        <div className="aspect-square overflow-hidden">
          <img 
            src={product.featuredImage} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.isSale && (
            <Badge variant="destructive">
              {discountPercentage ? `${discountPercentage}% OFF` : 'SALE'}
            </Badge>
          )}
          {product.isNew && (
            <Badge variant="default" className="bg-green-500">NEW</Badge>
          )}
        </div>
        
        {/* Wishlist button */}
        <button 
          className={`absolute top-2 left-2 ${inWishlist ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 bg-white/80 rounded-full p-2`} 
          onClick={handleAddToWishlist}
        >
          <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </Link>
      
      <div className="p-4">
        <Link href={getProductUrl(product.slug)}>
          <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
        </Link>
        
        {/* Ratings */}
        <div className="flex text-yellow-400 mb-1">
          {[...Array(full)].map((_, i) => (
            <svg key={`star-full-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          
          {[...Array(half)].map((_, i) => (
            <svg key={`star-half-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" className="fill-gray-300" />
              <path d="M5.58 8.72l2.8 2.033a1 1 0 01.364 1.118l-1.07 3.292c-.3.921.755 1.688 1.54 1.118l2.8-2.034a1 1 0 00.587-.587V2.927c-.3-.921-1.603-.921-1.902 0L9.049 6.22a1 1 0 01-.951.69H4.636c-.969 0-1.371 1.24-.588 1.81H5.58z" />
            </svg>
          ))}
          
          {[...Array(empty)].map((_, i) => (
            <svg key={`star-empty-${i}`} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          
          {product.reviewCount > 0 && (
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
          )}
        </div>
        
        {/* Price */}
        <div className="flex items-center mb-4">
          <span className="text-lg font-bold text-gray-800">
            {formatCurrency(product.price)}
          </span>
          
          {product.compareAtPrice && (
            <span className="text-sm text-gray-500 line-through ml-2">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>
        
        {/* Add to cart button */}
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

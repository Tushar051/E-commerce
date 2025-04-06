import React from 'react';
import { Link } from 'wouter';
import { Trash, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/types';
import { useCart } from '@/lib/context/CartContext';
import { formatCurrency, getProductUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CartItemProps {
  item: CartItemType;
  compact?: boolean;
}

export default function CartItem({ item, compact = false }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product } = item;
  
  if (!product) return null;

  const handleIncreaseQuantity = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  if (compact) {
    return (
      <div className="flex items-center py-2 border-b">
        <Link href={getProductUrl(product.slug)} className="flex-shrink-0">
          <img 
            src={product.featuredImage} 
            alt={product.name} 
            className="w-16 h-16 object-cover rounded"
          />
        </Link>
        <div className="ml-4 flex-1">
          <Link href={getProductUrl(product.slug)}>
            <h4 className="text-sm font-medium text-gray-800 hover:text-primary">{product.name}</h4>
          </Link>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">
              {item.quantity} × {formatCurrency(product.price)}
            </p>
            <button 
              className="text-xs text-red-500 hover:text-red-700"
              onClick={handleRemove}
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b">
      <Link href={getProductUrl(product.slug)} className="flex-shrink-0">
        <img 
          src={product.featuredImage} 
          alt={product.name} 
          className="w-24 h-24 object-cover rounded"
        />
      </Link>
      
      <div className="sm:ml-4 flex-1 mt-2 sm:mt-0">
        <div className="flex justify-between">
          <Link href={getProductUrl(product.slug)}>
            <h3 className="text-lg font-medium text-gray-800 hover:text-primary">{product.name}</h3>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleRemove}
          >
            <Trash className="h-5 w-5" />
          </Button>
        </div>
        
        <p className="text-sm text-gray-500 mt-1">
          SKU: {product.sku} | Brand: {product.brand}
        </p>
        
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-none"
              onClick={handleDecreaseQuantity}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="px-3 py-1 text-center min-w-[40px]">
              {item.quantity}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-none"
              onClick={handleIncreaseQuantity}
              disabled={item.quantity >= product.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {formatCurrency(product.price)} each
            </div>
            <div className="text-lg font-bold text-gray-800">
              {formatCurrency(product.price * item.quantity)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { useCart } from '@/lib/context/CartContext';
import CartItem from './CartItem';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CartDropdownProps {
  onClose: () => void;
}

export default function CartDropdown({ onClose }: CartDropdownProps) {
  const { cartItems, cartCount, cartTotal, isLoading } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Prevent scrolling when dropdown is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg p-4 z-50"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">Your Cart ({cartCount})</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your cart...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Button asChild variant="outline" onClick={onClose}>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="max-h-60 overflow-y-auto">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} compact />
            ))}
          </div>
          
          <div className="mt-4 pt-2 border-t">
            <div className="flex justify-between font-medium">
              <span>Subtotal:</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            
            <div className="mt-3 grid grid-cols-1 gap-2">
              <Button asChild onClick={onClose}>
                <Link href="/checkout">Checkout</Link>
              </Button>
              
              <Button asChild variant="outline" onClick={onClose}>
                <Link href="/cart">View Cart</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

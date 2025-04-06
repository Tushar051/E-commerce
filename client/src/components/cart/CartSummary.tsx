import React, { useState } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
}

export default function CartSummary({ 
  showCheckoutButton = true,
  onCheckout 
}: CartSummaryProps) {
  const { cartItems, cartTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const { toast } = useToast();
  
  // Calculate tax (10%)
  const tax = cartTotal * 0.1;
  
  // Calculate shipping (free for orders over $100)
  const shipping = cartTotal > 100 ? 0 : 5.99;
  
  // Calculate final total
  const orderTotal = cartTotal + tax + shipping;
  
  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      toast({
        title: "Enter a promo code",
        description: "Please enter a promo code to apply.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would make an API call to validate the promo code
    toast({
      title: "Invalid promo code",
      description: "The promo code you entered is not valid or has expired.",
      variant: "destructive"
    });
  };
  
  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="divide-y space-y-4">
        {/* Item count */}
        {cartItems.length > 0 && (
          <div className="pb-4">
            <p className="text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        )}
        
        {/* Promo code input */}
        <div className="pt-4 pb-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex-1">
              <Input 
                type="text"
                placeholder="Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              variant="outline"
              onClick={handleApplyPromoCode}
            >
              Apply
            </Button>
          </div>
        </div>
        
        {/* Price calculations */}
        <div className="pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shipping === 0 ? 'Free' : formatCurrency(shipping)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (10%)</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>
        </div>
        
        {/* Total */}
        <div className="pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(orderTotal)}</span>
          </div>
        </div>
      </div>
      
      {/* Checkout button */}
      {showCheckoutButton && (
        <Button 
          className="w-full mt-6"
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
        >
          Proceed to Checkout
        </Button>
      )}
      
      {/* Secure checkout note */}
      <div className="p-4 bg-green-50 text-green-700 rounded-lg mt-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Secure Checkout</p>
            <p className="text-xs">Your payment information is secure</p>
          </div>
        </div>
      </div>
      
      {/* Terms */}
      <div className="text-center text-gray-500 text-xs mt-4">
        <p>By placing your order, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a></p>
      </div>
    </div>
  );
}

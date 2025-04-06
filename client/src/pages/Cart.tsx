import React from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/lib/context/CartContext';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { ShoppingCart, AlertTriangle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Cart() {
  const [location, setLocation] = useLocation();
  const { cartItems, cartCount, clearCart, isLoading } = useCart();
  
  const handleClearCart = () => {
    if (confirm('Are you sure you want to remove all items from your cart?')) {
      clearCart();
    }
  };
  
  const handleCheckout = () => {
    setLocation('/checkout');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="flex justify-center py-16">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cartCount})</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Items in Your Cart</h2>
              {cartItems.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
              )}
            </div>
            
            <Separator className="mb-4" />
            
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          
          {/* Shopping buttons */}
          <div className="mt-6 flex justify-between">
            <Button asChild variant="outline">
              <Link href="/products">
                Continue Shopping
              </Link>
            </Button>
            
            <Button onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
        
        {/* Cart Summary */}
        <div className="lg:w-1/3">
          <CartSummary onCheckout={handleCheckout} />
        </div>
      </div>
    </div>
  );
}

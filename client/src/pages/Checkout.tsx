import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useCart } from '@/lib/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import CartSummary from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { apiRequest } from '@/lib/queryClient';
import { Checkbox } from '@/components/ui/checkbox';
import { queryClient } from '@/lib/queryClient';
import { Check, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import PaymentProcessor from '@/components/checkout/PaymentProcessor';

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  
  // Checkout steps: shipping -> payment -> confirmation
  const [checkoutStep, setCheckoutStep] = useState<string>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Shipping form state with default empty values
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    saveAddress: true
  });
  
  // Shipping method with "standard" as default
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  // Payment method with "creditCard" as default
  const [paymentMethod, setPaymentMethod] = useState<'creditCard' | 'paypal' | 'applePay' | 'googlePay' | 'bankTransfer' | 'cashOnDelivery'>('creditCard');
  
  // Payment form state with default empty values
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    saveCard: false
  });
  
  // Get shipping cost based on method
  const getShippingCost = () => {
    switch (shippingMethod) {
      case 'express':
        return 12.99;
      case 'nextDay':
        return 24.99;
      case 'standard':
      default:
        return 5.99;
    }
  };
  
  // Calculate tax (10%)
  const tax = cartTotal * 0.1;
  
  // Calculate total
  const orderTotal = cartTotal + getShippingCost() + tax;
  
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate shipping form
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
        !shippingInfo.address || !shippingInfo.city || !shippingInfo.state || 
        !shippingInfo.postalCode || !shippingInfo.country) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Go to payment step
    setCheckoutStep('payment');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment form
    if (paymentMethod === 'creditCard' && 
        (!paymentInfo.cardName || !paymentInfo.cardNumber || 
         !paymentInfo.cardExpiry || !paymentInfo.cardCvv)) {
      toast({
        title: "Please fill all payment fields",
        description: "Complete all required credit card information.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate payment processing
    setIsSubmitting(true);
    
    try {
      // Create order using API
      const orderData = {
        userId: 1, // Using the default user
        total: orderTotal,
        status: 'pending',
        shippingAddress: shippingInfo.address,
        shippingCity: shippingInfo.city,
        shippingState: shippingInfo.state,
        shippingPostalCode: shippingInfo.postalCode,
        shippingCountry: shippingInfo.country
      };
      
      const response = await apiRequest('POST', '/api/orders', orderData);
      
      if (response.ok) {
        // Clear cart and invalidate cart queries
        await clearCart();
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        
        // Move to confirmation step
        setCheckoutStep('confirmation');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      toast({
        title: "Payment processing failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // If cart is empty, redirect to cart page
  if (cartItems.length === 0 && checkoutStep !== 'confirmation') {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            You need to add items to your cart before proceeding to checkout.
          </p>
          <Button asChild>
            <a href="/products">Start Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  // Order confirmation page
  if (checkoutStep === 'confirmation') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You for Your Order!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been received and is now being processed. We'll send you a confirmation email shortly.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-medium text-gray-800 mb-2">Order Details:</h3>
            <p className="text-gray-600">Order Number: #ORD-{Math.floor(Math.random() * 1000000)}</p>
            <p className="text-gray-600">Order Date: {new Date().toLocaleDateString()}</p>
            <p className="text-gray-600">Order Total: {formatCurrency(orderTotal)}</p>
            <p className="text-gray-600">Shipping Method: {shippingMethod === 'standard' ? 'Standard Shipping' : shippingMethod === 'express' ? 'Express Shipping' : 'Next Day Delivery'}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <a href="/account/orders">View Orders</a>
            </Button>
            <Button asChild>
              <a href="/">Continue Shopping</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="w-full absolute h-1 bg-gray-200 top-1/2 -translate-y-1/2 z-0">
              <div 
                className="h-full bg-primary" 
                style={{ width: checkoutStep === 'shipping' ? '0%' : checkoutStep === 'payment' ? '50%' : '100%' }}
              ></div>
            </div>
            
            {/* Always active */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold relative z-10 bg-primary text-white">
              1
            </div>
            
            {/* Active on payment and confirmation steps */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold relative z-10 ${(checkoutStep === 'payment' || checkoutStep === 'confirmation') ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
              2
            </div>
            
            {/* Active only on confirmation step */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold relative z-10 ${checkoutStep === 'confirmation' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
              3
            </div>
          </div>
          
          <div className="flex justify-between mt-2 text-sm font-medium">
            <span className="text-primary">Cart</span>
            <span className={`${(checkoutStep === 'payment' || checkoutStep === 'confirmation') ? 'text-primary' : 'text-gray-500'}`}>Shipping</span>
            <span className={`${checkoutStep === 'confirmation' ? 'text-primary' : 'text-gray-500'}`}>Payment</span>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Checkout Forms */}
          <div className="lg:w-2/3">
            {checkoutStep === 'shipping' && (
              <>
                {/* Shipping Address Form */}
                <form onSubmit={handleShippingSubmit}>
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input 
                          id="firstName"
                          name="firstName"
                          value={shippingInfo.firstName}
                          onChange={handleShippingInfoChange}
                          placeholder="John"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input 
                          id="lastName"
                          name="lastName"
                          value={shippingInfo.lastName}
                          onChange={handleShippingInfoChange}
                          placeholder="Doe"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={shippingInfo.email}
                          onChange={handleShippingInfoChange}
                          placeholder="john.doe@example.com"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input 
                          id="phone"
                          name="phone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={handleShippingInfoChange}
                          placeholder="(123) 456-7890"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input 
                          id="address"
                          name="address"
                          value={shippingInfo.address}
                          onChange={handleShippingInfoChange}
                          placeholder="123 Main St"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input 
                          id="city"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleShippingInfoChange}
                          placeholder="New York"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="postalCode">ZIP/Postal Code *</Label>
                        <Input 
                          id="postalCode"
                          name="postalCode"
                          value={shippingInfo.postalCode}
                          onChange={handleShippingInfoChange}
                          placeholder="10001"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="state">State/Province *</Label>
                        <Select 
                          value={shippingInfo.state}
                          onValueChange={(value) => setShippingInfo(prev => ({ ...prev, state: value }))}
                        >
                          <SelectTrigger id="state">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="IL">Illinois</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Select 
                          value={shippingInfo.country}
                          onValueChange={(value) => setShippingInfo(prev => ({ ...prev, country: value }))}
                        >
                          <SelectTrigger id="country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="saveAddress" 
                          checked={shippingInfo.saveAddress}
                          onCheckedChange={(checked) => 
                            setShippingInfo(prev => ({ ...prev, saveAddress: checked === true }))
                          }
                        />
                        <Label htmlFor="saveAddress">Save this address for future orders</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shipping Method */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4">Shipping Method</h2>
                    
                    <RadioGroup 
                      value={shippingMethod} 
                      onValueChange={setShippingMethod}
                      className="space-y-3"
                    >
                      <div className={`p-4 border rounded-lg ${shippingMethod === 'standard' ? 'border-primary bg-primary/5' : 'border-gray-200'} cursor-pointer`}>
                        <div className="flex items-center">
                          <RadioGroupItem 
                            value="standard" 
                            id="standard" 
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <Label htmlFor="standard" className="font-medium text-gray-800">Standard Shipping</Label>
                              <span className="font-medium">$5.99</span>
                            </div>
                            <p className="text-sm text-gray-500">Delivery in 4-6 business days</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-4 border rounded-lg ${shippingMethod === 'express' ? 'border-primary bg-primary/5' : 'border-gray-200'} cursor-pointer`}>
                        <div className="flex items-center">
                          <RadioGroupItem 
                            value="express" 
                            id="express" 
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <Label htmlFor="express" className="font-medium text-gray-800">Express Shipping</Label>
                              <span className="font-medium">$12.99</span>
                            </div>
                            <p className="text-sm text-gray-500">Delivery in 2-3 business days</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`p-4 border rounded-lg ${shippingMethod === 'nextDay' ? 'border-primary bg-primary/5' : 'border-gray-200'} cursor-pointer`}>
                        <div className="flex items-center">
                          <RadioGroupItem 
                            value="nextDay" 
                            id="nextDay" 
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <Label htmlFor="nextDay" className="font-medium text-gray-800">Next Day Delivery</Label>
                              <span className="font-medium">$24.99</span>
                            </div>
                            <p className="text-sm text-gray-500">Order by 2 PM for delivery next business day</p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                    
                    <div className="mt-6 flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setLocation('/cart')}
                        className="flex items-center"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Return to Cart
                      </Button>
                      
                      <Button type="submit">
                        Continue to Payment
                      </Button>
                    </div>
                  </div>
                </form>
              </>
            )}
            
            {checkoutStep === 'payment' && (
              <>
                {/* Payment Form */}
                <form onSubmit={handlePaymentSubmit}>
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                    
                    <div className="mb-6">
                      <PaymentMethodSelector 
                        value={paymentMethod}
                        onChange={(value) => setPaymentMethod(value)}
                      />
                    </div>
                    
                    {/* Payment Processor Component */}
                    <div className="mb-6">
                      <PaymentProcessor
                        amount={orderTotal}
                        onPaymentSuccess={() => {
                          // This will be triggered when payment is successful
                          toast({
                            title: "Payment successful!",
                            description: "Your payment has been processed.",
                            variant: "default"
                          });
                        }}
                        onPaymentError={(message) => {
                          toast({
                            title: "Payment failed",
                            description: message,
                            variant: "destructive"
                          });
                        }}
                      />
                    </div>
                    
                    {/* Credit Card Form */}
                    {paymentMethod === 'creditCard' && (
                      <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label htmlFor="cardName">Name on Card *</Label>
                          <Input 
                            id="cardName"
                            name="cardName"
                            value={paymentInfo.cardName}
                            onChange={handlePaymentInfoChange}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cardNumber">Card Number *</Label>
                          <Input 
                            id="cardNumber"
                            name="cardNumber"
                            value={paymentInfo.cardNumber}
                            onChange={handlePaymentInfoChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cardExpiry">Expiration Date (MM/YY) *</Label>
                            <Input 
                              id="cardExpiry"
                              name="cardExpiry"
                              value={paymentInfo.cardExpiry}
                              onChange={handlePaymentInfoChange}
                              placeholder="MM/YY"
                              maxLength={5}
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="cardCvv">CVV *</Label>
                            <Input 
                              id="cardCvv"
                              name="cardCvv"
                              type="password"
                              value={paymentInfo.cardCvv}
                              onChange={handlePaymentInfoChange}
                              placeholder="123"
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="saveCard" 
                              checked={paymentInfo.saveCard}
                              onCheckedChange={(checked) => 
                                setPaymentInfo(prev => ({ ...prev, saveCard: checked === true }))
                              }
                            />
                            <Label htmlFor="saveCard">Save this card for future purchases</Label>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* PayPal Instructions */}
                    {paymentMethod === 'paypal' && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-gray-600 mb-2">You'll be redirected to PayPal to complete your payment.</p>
                        <div className="flex items-center text-sm bg-blue-50 p-2 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Demo mode: No actual redirect will happen</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Apple Pay Instructions */}
                    {paymentMethod === 'applePay' && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-gray-600 mb-2">Use Apple Pay to complete your purchase quickly and securely.</p>
                        <div className="flex items-center text-sm bg-blue-50 p-2 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Demo mode: Apple Pay integration is simulated</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Google Pay Instructions */}
                    {paymentMethod === 'googlePay' && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-gray-600 mb-2">Use Google Pay for a faster checkout experience.</p>
                        <div className="flex items-center text-sm bg-blue-50 p-2 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Demo mode: Google Pay integration is simulated</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Billing Address</h3>
                      <p className="text-sm text-gray-600">
                        {shippingInfo.firstName} {shippingInfo.lastName}<br />
                        {shippingInfo.address}<br />
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}<br />
                        {shippingInfo.country}
                      </p>
                    </div>
                  </div>
                  
                  {/* Review order */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4">Review Order</h2>
                    
                    <div className="divide-y space-y-4">
                      {/* Items in order */}
                      <div className="space-y-4 pb-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center">
                            <img 
                              src={item.product?.featuredImage} 
                              alt={item.product?.name} 
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="ml-4">
                              <h4 className="font-medium">{item.product?.name}</h4>
                              <div className="flex justify-between">
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                <p className="font-medium">{formatCurrency((item.product?.price || 0) * item.quantity)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Order summary */}
                      <div className="pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">{formatCurrency(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping ({shippingMethod === 'standard' ? 'Standard' : shippingMethod === 'express' ? 'Express' : 'Next Day'})</span>
                          <span className="font-medium">{formatCurrency(getShippingCost())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax</span>
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
                    
                    <div className="mt-6 flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCheckoutStep('shipping')}
                        className="flex items-center"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shipping
                      </Button>
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Place Order'}
                      </Button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
          
          {/* Order summary */}
          <div className="lg:w-1/3">
            <CartSummary showCheckoutButton={false} />
          </div>
        </div>
      </div>
    </section>
  );
}

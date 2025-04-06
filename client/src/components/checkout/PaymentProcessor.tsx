import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface PaymentProcessorProps {
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (message: string) => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const processPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // Simulate payment processing with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock a server-side API call
      // In a real application, this would create a payment intent with Stripe
      const payload = { amount };
      const response = await apiRequest('POST', '/api/create-payment-intent', payload);
      
      if (!response.ok) {
        throw new Error('Payment intent creation failed');
      }
      
      // Payment succeeded
      setPaymentStatus('success');
      toast({
        title: "Payment Successful",
        description: `Your payment of ${formatCurrency(amount)} has been processed successfully.`,
        variant: "default",
      });
      onPaymentSuccess();
    } catch (error) {
      // Payment failed
      setPaymentStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      onPaymentError(errorMessage);
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="font-medium text-gray-600">Total amount to be charged:</p>
        <p className="text-2xl font-bold">{formatCurrency(amount)}</p>
      </div>
      
      <Button 
        onClick={processPayment}
        disabled={isProcessing}
        className="w-full h-12 text-base font-medium"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>
      
      {paymentStatus === 'success' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
          Payment processed successfully!
        </div>
      )}
      
      {paymentStatus === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          Payment processing failed. Please try again.
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p className="mb-2">This is a dummy payment implementation for testing purposes.</p>
        <p>In a production environment, this would securely process your payment using Stripe. 
           Developed by Gauri.</p>
      </div>
    </div>
  );
};

export default PaymentProcessor;
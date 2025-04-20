'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Define Razorpay Response type
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentFormProps {
  defaultAmount?: number;
  onSuccess?: (data: RazorpayResponse) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export function PaymentForm({
  defaultAmount = 999,
  onSuccess,
  onError,
  disabled = false
}: PaymentFormProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value);
    setAmount(Number.isNaN(value) ? 0 : value);
  };

  /**
   * Step-by-step implementation following:
   * https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
   */
  const handlePayment = async () => {
    // Validate amount before proceeding
    if (amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create an order on your server
      console.log('Step 1: Creating order on server for amount:', amount);
      const orderResponse = await fetch('/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      console.log('Order created successfully:', orderData);

      // Step 2: Load the Razorpay checkout script if not already loaded
      console.log('Step 2: Loading Razorpay checkout script');

      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => {
            console.log('Razorpay script loaded successfully');
            resolve();
          };
          script.onerror = () => {
            console.error('Failed to load Razorpay script');
            reject(new Error('Failed to load Razorpay script'));
          };
          document.body.appendChild(script);
        });
      } else {
        console.log('Razorpay script already loaded');
      }

      if (!window.Razorpay) {
        throw new Error('Failed to load Razorpay checkout');
      }

      // Step 3: Initiate payment using the order ID
      console.log('Step 3: Initiating payment with order ID:', orderData.id);

      // Create options object as per latest Razorpay documentation
      // https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#step-3-integrate-checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount.toString(),  // Required in paise (e.g., 100 = ₹1)
        currency: orderData.currency,
        name: "Demo Store",  // Organization/merchant name
        description: "Test Transaction",
        order_id: orderData.id,  // Required for server-side order creation
        handler: (response: RazorpayResponse) => {
          // See: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#step-5-handle-payment-success
          // Handle the payment success response
          console.log("Payment successful!", response);

          // Notify about the successful payment
          toast({
            title: 'Payment Successful',
            description: `Payment ID: ${response.razorpay_payment_id}`,
          });

          // Call the success callback if provided
          if (onSuccess) {
            onSuccess(response);
          }

          setLoading(false);
        }, // handler
        // TODO: Optionally populate prefill, notes, and theme from user profile or backend
        prefill: {
          name: "John Doe", // TODO: Replace with real user data
          email: "john@example.com",
          contact: "9999999999",
        },
        notes: {
          address: "Demo Address" // TODO: Replace with real data if needed
        },
        theme: {
          color: "#18181B",
        },
        modal: {
          // See: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/customize/#customize-modal-behaviour
          ondismiss: () => {
            // User closed the Razorpay modal without completing payment
            toast({
              title: 'Payment Cancelled',
              description: 'You closed the payment window before completing the transaction.',
              variant: 'destructive',
            });
            setLoading(false);
          },
        },
      };

      // Initialize Razorpay object with the options
      const paymentObject = new window.Razorpay(options);

      // Register event listeners for payment failures
      // See: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#step-6-handle-payment-failure
      paymentObject.on('payment.failed', (response: {
        error: {
          code: string;
          description: string;
          source: string;
          step: string;
          reason: string;
          metadata?: Record<string, unknown>;
        }
      }) => {
        console.error('Payment failed:', response.error);

        // Show error notification
        toast({
          title: 'Payment Failed',
          description: response.error.description || 'Your payment has failed',
          variant: 'destructive',
        });

        // Call error callback if provided
        if (onError) {
          onError(new Error(response.error.description || 'Payment failed'));
        }

        setLoading(false);
      }); // payment.failed

      // Open the Razorpay checkout form
      // See: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#step-4-open-checkout
      paymentObject.open();

    } catch (error) {
      // See: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/#step-7-handle-errors
      console.error('Payment process error:', error);

      // Extract error message
      let errorMessage = 'Payment failed';
      if (error instanceof Error) {
        errorMessage = error.message;

        // Call error callback if provided
        if (onError) {
          onError(error);
        }
      }

      // Show error notification
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });

      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Make a Payment</CardTitle>
        <CardDescription>Enter an amount and click Pay Now to proceed with Razorpay.</CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              disabled={disabled || loading}
            />
          </div>

          <div className="pt-3">
            <p className="text-sm text-muted-foreground">
              You will be redirected to Razorpay&apos;s secure payment gateway to complete your transaction.
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handlePayment}
          disabled={loading || amount <= 0 || disabled}
          className="w-full bg-zinc-900 hover:bg-zinc-800"
        >
          {loading ? 'Processing...' : disabled ? 'Verifying Payment...' : `Pay Now ₹${amount}`}
        </Button>
      </CardFooter>
    </Card>
  );
}

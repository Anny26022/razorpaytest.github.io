'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PaymentForm } from "@/components/PaymentForm";

// Define the response type
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentContainerProps {
  defaultAmount?: number;
}

export default function PaymentContainer({ defaultAmount }: PaymentContainerProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleSuccess = (data: RazorpayResponse) => {
    console.log('Payment successful:', data);

    // Show a success toast
    toast({
      title: 'Payment Successful',
      description: 'Transaction completed successfully!',
    });

    // Create the query parameters for the success page
    const params = new URLSearchParams();
    params.append('payment_id', data.razorpay_payment_id);
    params.append('order_id', data.razorpay_order_id);
    params.append('verified', 'true'); // Assume it's verified since we received a response

    // Redirect to the success page with payment details
    router.push(`/payment/success?${params.toString()}`);
  };

  const handleError = (error: Error) => {
    console.error('Payment failed:', error);

    // Create the query parameters for the failure page
    const params = new URLSearchParams();
    params.append('error', error.message);

    // Redirect to the failure page with error details
    router.push(`/payment/failure?${params.toString()}`);
  };

  return (
    <PaymentForm
      defaultAmount={defaultAmount}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}

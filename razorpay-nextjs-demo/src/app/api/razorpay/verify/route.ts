import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

// Razorpay Key Secret (required for signature verification)
// Docs:
// - Payment Verification: https://razorpay.com/docs/api/payments/payment-verification/
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
if (!RAZORPAY_KEY_SECRET) {
  throw new Error('RAZORPAY_KEY_SECRET is not set in environment variables');
}

// Interface for verification request
interface PaymentVerificationRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Interface for verification response
interface VerificationResponse {
  valid: boolean;
  orderId: string;
  paymentId: string;
  error?: string;
}

/**
 * Verify the Razorpay payment signature
 * https://razorpay.com/docs/api/payments/payment-verification/#server-side-verification
 */
function verifyPaymentSignature(
  paymentData: PaymentVerificationRequest,
  secret: string
): VerificationResponse {
  try {
    // Extract payment data fields
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        valid: false,
        orderId: razorpay_order_id || '',
        paymentId: razorpay_payment_id || '',
        error: 'Missing required payment verification fields'
      };
    }

    // Create signature string by concatenating order ID and payment ID
    // See: https://razorpay.com/docs/api/payments/payment-verification/#server-side-verification
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

    // Generate HMAC SHA256 hex digest
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Compare signatures
    const isValid = expectedSignature === razorpay_signature;

    return {
      valid: isValid,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      ...(isValid ? {} : { error: 'Invalid payment signature. Please check your API keys and data.' })
    };
  } catch (error) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown verification error';
    return {
      valid: false,
      orderId: paymentData.razorpay_order_id || '',
      paymentId: paymentData.razorpay_payment_id || '',
      error: `Verification error: ${errorMessage}`
    };
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    // Docs: https://razorpay.com/docs/api/payments/payment-verification/#server-side-verification
    const paymentData = await request.json() as PaymentVerificationRequest;

    // Verify the payment signature
    const verificationResult = verifyPaymentSignature(paymentData, RAZORPAY_KEY_SECRET);

    if (!verificationResult.valid) {
      console.error('Payment verification failed:', verificationResult.error);

      return NextResponse.json(
        {
          valid: false,
          error: verificationResult.error,
          orderId: verificationResult.orderId,
          paymentId: verificationResult.paymentId
        },
        { status: 400 }
      );
    }

    // If we reach here, the payment signature is valid
    // In a real application, you would update your database here
    console.log('Payment verified successfully:', {
      orderId: verificationResult.orderId,
      paymentId: verificationResult.paymentId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      valid: true,
      message: 'Payment verified successfully',
      orderId: verificationResult.orderId,
      paymentId: verificationResult.paymentId
    });
  } catch (error) {
    // Handle unexpected errors
    console.error('Error verifying payment:', error);

    return NextResponse.json(
      { error: 'Failed to verify payment. Please try again or contact support.' },
      { status: 500 }
    );
  }
}

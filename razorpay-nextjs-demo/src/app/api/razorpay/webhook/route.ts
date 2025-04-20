import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

// Razorpay Webhook Secret (required for signature verification)
// Docs:
// - Webhooks: https://razorpay.com/docs/api/webhooks/
// - Signature Verification: https://razorpay.com/docs/api/webhooks/#verifying-signatures
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  throw new Error('RAZORPAY_WEBHOOK_SECRET is not set in environment variables');
}

// Define types for the Razorpay webhook payloads
interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment?: {
      entity: RazorpayPayment;
    };
    refund?: {
      entity: RazorpayRefund;
    };
  };
}

interface RazorpayPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  error_code?: string;
  error_description?: string;
  method?: string;
  created_at: number;
}

interface RazorpayRefund {
  id: string;
  payment_id: string;
  amount: number;
  status: string;
  created_at: number;
}

/**
 * Verify Razorpay webhook signature
 * https://razorpay.com/docs/api/webhooks/#verifying-signatures
 */
function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Process different webhook event types
 */
async function processWebhookEvent(event: RazorpayWebhookEvent): Promise<string> {
  const eventType = event.event;

  // Log the event for debugging
  console.log(`Processing webhook event: ${eventType}`, {
    payload: JSON.stringify(event),
    timestamp: new Date().toISOString(),
  });

  switch (eventType) {
    case 'payment.authorized':
      // Payment has been authorized
      if (event.payload.payment?.entity) {
        await handlePaymentAuthorized(event.payload.payment.entity);
        return 'Payment authorized successfully';
      }
      return 'Invalid payment data';

    case 'payment.failed':
      // Payment has failed
      if (event.payload.payment?.entity) {
        await handlePaymentFailed(event.payload.payment.entity);
        return 'Payment failure recorded';
      }
      return 'Invalid payment data';

    case 'payment.captured':
      // Payment has been captured
      if (event.payload.payment?.entity) {
        await handlePaymentCaptured(event.payload.payment.entity);
        return 'Payment captured successfully';
      }
      return 'Invalid payment data';

    case 'refund.created':
      // Refund has been created
      if (event.payload.refund?.entity) {
        await handleRefundCreated(event.payload.refund.entity);
        return 'Refund created successfully';
      }
      return 'Invalid refund data';

    default:
      // Handle other event types
      console.log(`Unhandled webhook event type: ${eventType}`);
      return `Received unhandled event: ${eventType}`;
  }
}

/**
 * Handle payment authorized event
 */
async function handlePaymentAuthorized(payment: RazorpayPayment): Promise<void> {
  // Here you would update your database to mark the payment as authorized
  // For example:
  // await db.payments.update({
  //   where: { paymentId: payment.id },
  //   data: { status: 'authorized', updatedAt: new Date() }
  // });

  console.log('Payment authorized:', payment.id);
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(payment: RazorpayPayment): Promise<void> {
  // Here you would update your database to mark the payment as failed
  // For example:
  // await db.payments.update({
  //   where: { paymentId: payment.id },
  //   data: { status: 'failed', errorCode: payment.error_code, errorDescription: payment.error_description }
  // });

  console.log('Payment failed:', payment.id, payment.error_code, payment.error_description);
}

/**
 * Handle payment captured event
 */
async function handlePaymentCaptured(payment: RazorpayPayment): Promise<void> {
  // Here you would update your database to mark the payment as captured (completed)
  // For example:
  // await db.payments.update({
  //   where: { paymentId: payment.id },
  //   data: { status: 'captured', capturedAt: new Date() }
  // });

  console.log('Payment captured:', payment.id, payment.amount);
}

/**
 * Handle refund created event
 */
async function handleRefundCreated(refund: RazorpayRefund): Promise<void> {
  // Here you would update your database to record the refund
  // For example:
  // await db.refunds.create({
  //   data: {
  //     refundId: refund.id,
  //     paymentId: refund.payment_id,
  //     amount: refund.amount,
  //     status: refund.status,
  //     createdAt: new Date()
  //   }
  // });

  console.log('Refund created:', refund.id, refund.payment_id);
}

export async function POST(request: Request) {
  try {
    // Get the request body as text for signature verification
    // Docs: https://razorpay.com/docs/api/webhooks/#verifying-signatures
    const rawBody = await request.text();

    // Verify the webhook signature
    const signature = request.headers.get('x-razorpay-signature');
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature. Webhook not from Razorpay or secret mismatch.' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const event = JSON.parse(rawBody) as RazorpayWebhookEvent;

    // Process the webhook event
    const result = await processWebhookEvent(event);

    return NextResponse.json({ success: true, message: result });
  } catch (error) {
    // Handle unexpected errors
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook. Please check logs or contact support.' },
      { status: 500 }
    );
  }
}

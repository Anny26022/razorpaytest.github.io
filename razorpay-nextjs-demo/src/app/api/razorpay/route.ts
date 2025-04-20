import { NextResponse } from 'next/server';

/**
 * API endpoint to create a Razorpay order
 * Docs:
 * - Web Integration: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
 * - Orders API: https://razorpay.com/docs/api/orders/#create-an-order
 */

// Razorpay API Keys (Loaded from environment for security)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Razorpay Orders API endpoint
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1/orders';

export async function POST(request: Request) {
  try {
    console.log('Creating Razorpay order');

    // Step 1: Parse the request body
    // https://razorpay.com/docs/api/orders/#create-an-order-request-body
    const body = await request.json();
    console.log('Request body:', body);

    // Step 2: Extract and validate amount, currency, and receipt
    const { amount, currency, receipt, notes } = body;

    // Validate amount (required by Razorpay)
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      console.error('Invalid amount provided:', amount);
      return NextResponse.json(
        { success: false, error: 'Please provide a valid amount greater than 0' },
        { status: 400 }
      );
    }
    // Validate currency (optional, defaults to INR)
    const currencyValue = typeof currency === 'string' && currency.trim() ? currency : 'INR';
    // Validate receipt (optional, but recommended by Razorpay)
    const receiptValue = typeof receipt === 'string' && receipt.trim() ? receipt : `receipt_${Date.now()}`;

    // Step 3: Convert amount to paise (Razorpay requires amount in smallest currency unit)
    // 1 INR = 100 paise
    const amountInPaise = Math.round(Number(amount) * 100);

    // Step 4: Prepare order creation payload according to Razorpay API docs
    // Docs: https://razorpay.com/docs/api/orders/#create-an-order-request-body
    const orderPayload = {
      amount: amountInPaise, // amount in smallest currency unit (paise)
      currency: currencyValue,
      receipt: receiptValue,
      notes: typeof notes === 'object' && notes !== null ? notes : undefined, // Pass notes if provided
      // TODO: Add 'partial_payment', 'payment_capture', 'expire_by', etc., if advanced features are needed
    };

    console.log('Order payload:', orderPayload);

    // Debug: Print masked API credentials to help diagnose 401 errors
    console.log('RAZORPAY_KEY_ID:', RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.slice(0, 4) + '...' : 'undefined');
    console.log('RAZORPAY_KEY_SECRET:', RAZORPAY_KEY_SECRET ? RAZORPAY_KEY_SECRET.slice(0, 4) + '...' : 'undefined');

    // Step 5: Generate Basic Auth credentials
    // https://razorpay.com/docs/api/orders/#auth
    const authHeader = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    console.log(`Using Auth: Basic ${authHeader.substring(0, 5)}...`);

    // Step 6: Send request to Razorpay Orders API
    // https://razorpay.com/docs/api/orders/#create-an-order
    const response = await fetch(RAZORPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authHeader}`
      },
      body: JSON.stringify(orderPayload)
    });

    // Step 7: Parse and handle the response
    // Always parse response body before checking response.ok
    const data = await response.json();
    console.log('Razorpay API response status:', response.status);
    console.log('Razorpay API response body:', data);

    // Step 8: Handle error response
    if (!response.ok) {
      console.error('Razorpay API error:', data);

      // Extract error message from response
      const errorMessage = data.error?.description ||
                           data.error?.message ||
                           'Failed to create Razorpay order';

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    // Step 9: Return order details to client for checkout
    // Docs: https://razorpay.com/docs/api/orders/#response
    // Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
    console.log('Order created successfully:', data);

    return NextResponse.json({
      id: data.id,  // Razorpay Order ID
      amount: data.amount,  // Amount in paise
      currency: data.currency,  // Currency
      key: RAZORPAY_KEY_ID,  // Razorpay Key ID
      receipt: data.receipt,
      status: data.status,
      created_at: data.created_at,
      notes: data.notes
      // TODO: Add other fields as needed for your frontend (e.g., 'entity', 'offer_id', etc.)
    });
  } catch (error) {
    // Step 10: Handle unexpected errors
    console.error('Server error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown server error';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

# Razorpay Integration with Next.js + React

This is a clean, minimal, responsive, and elegant demo of Razorpay payment gateway integration with Next.js and React.

## Features

- 💳 Razorpay payment gateway integration
- 🚀 Built with Next.js 15
- 💅 Modern UI with Shadcn/UI components
- 📱 Fully responsive design
- 🔄 Client-side and server-side implementation
- 🔒 Type-safe with TypeScript
- ✅ Success and failure pages with details
- 🪝 Webhook integration for payment events
- 🛡️ Server-side payment verification with signatures

## Getting Started

1. Clone the repository
2. Install dependencies
   ```bash
   bun install
   ```
3. Create a `.env.local` file in the root directory with your Razorpay API keys:
   ```
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```
4. Run the development server
   ```bash
   bun run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### Setting Your API Keys

Replace the placeholder keys in `/app/api/razorpay/route.ts` with your actual Razorpay API keys:

```typescript
// Replace with your actual API keys
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key';
```

### Using the PaymentForm Component

Import and use the `PaymentForm` component in any of your pages:

```jsx
import { PaymentForm } from "@/components/PaymentForm";

export default function MyPage() {
  return (
    <div>
      <h1>My Payment Page</h1>
      <PaymentForm
        defaultAmount={999}
        onSuccess={(data) => console.log('Payment successful:', data)}
        onError={(error) => console.error('Payment failed:', error)}
      />
    </div>
  );
}
```

### PaymentForm Props

- `defaultAmount` (optional): Default payment amount in rupees (default: 100)
- `onSuccess` (optional): Callback function when payment is successful
- `onError` (optional): Callback function when payment fails
- `disabled` (optional): Whether the form is disabled (useful during verification)

### Direct API Usage

If you need more control, you can use the Razorpay utility functions directly:

```typescript
import { openRazorpayCheckout, createRazorpayOrder } from "@/lib/razorpay";

// Example: Create a payment on button click
async function handlePayment() {
  try {
    const response = await openRazorpayCheckout({
      amount: 1000, // amount in rupees
      name: "Your Company",
      description: "Order description",
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9876543210",
      },
    });

    console.log("Payment successful:", response);
  } catch (error) {
    console.error("Payment failed:", error);
  }
}
```

## Success and Failure Pages

The application includes dedicated pages for handling successful and failed payments:

- **Success Page** (`/payment/success`): Displays payment confirmation details, including transaction IDs.
- **Failure Page** (`/payment/failure`): Shows error details and provides options to try again.

These pages provide a seamless user experience with clean UI feedback.

## Server-Side Payment Verification

The application includes server-side verification of Razorpay payments using cryptographic signatures to ensure payment authenticity. This critical security feature protects against tampering and fraud.

### How Payment Verification Works

1. When a payment is successful, Razorpay provides three important values:
   - `razorpay_payment_id`: The unique identifier for the payment
   - `razorpay_order_id`: The unique identifier for the order
   - `razorpay_signature`: A HMAC SHA256 signature created by Razorpay

2. The application sends these values to the server-side verification endpoint:
   ```
   POST /api/razorpay/verify
   ```

3. The server uses your Razorpay secret key to independently generate a signature and compares it with the one provided by Razorpay. This confirms the payment data is authentic and has not been tampered with.

4. If verified, the payment is marked as verified and the user is shown a verified badge on the success page.

### Verification Testing

For testing and debugging purposes, the application includes a verification test tool at `/payment/verify-test`. This allows you to manually enter payment details and test the verification process.

## Webhook Integration

The application includes a webhook endpoint at `/api/razorpay/webhook` that Razorpay can call to notify your application of various payment events.

### Setting Up Webhooks

1. Go to your Razorpay Dashboard
2. Navigate to Settings > Webhooks
3. Add a new webhook with your endpoint URL (`https://yourdomain.com/api/razorpay/webhook`)
4. Set a webhook secret and add it to your `.env.local` file
5. Select events you want to be notified about (payment.authorized, payment.failed, etc.)

### Supported Webhook Events

The webhook handler supports the following events:

- `payment.authorized`: When a payment is authorized
- `payment.failed`: When a payment fails
- `payment.captured`: When a payment is captured (completed)
- `refund.created`: When a refund is created

You can extend the webhook handler to support additional events as needed.

## Project Structure

- `/app/api/razorpay/route.ts` - API endpoint for creating Razorpay orders
- `/app/api/razorpay/verify/route.ts` - API endpoint for verifying payment signatures
- `/app/api/razorpay/webhook/route.ts` - Webhook endpoint for handling Razorpay events
- `/app/payment/success/page.tsx` - Success page shown after successful payment
- `/app/payment/failure/page.tsx` - Failure page shown after failed payment
- `/app/payment/verify-test/page.tsx` - Test tool for payment verification
- `/lib/razorpay.ts` - Utility functions for Razorpay integration
- `/lib/razorpay-verify.ts` - Verification utility for Razorpay signatures
- `/components/PaymentForm.tsx` - Reusable payment form component
- `/components/PaymentContainer.tsx` - Container component with verification logic

## Testing Razorpay

In test mode, you can use these Razorpay test credentials:

- Test Card Number: 4111 1111 1111 1111
- CVV: Any 3-digit number
- Expiry Date: Any future date
- OTP: 1234

## License

MIT

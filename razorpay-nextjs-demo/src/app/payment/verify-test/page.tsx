'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";

interface VerificationResult {
  valid: boolean;
  message?: string;
  error?: string;
  orderId?: string;
  paymentId?: string;
}

export default function VerifyTestPage() {
  const [paymentId, setPaymentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [signature, setSignature] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = () => {
    if (!paymentId || !orderId || !signature) {
      setResult({
        valid: false,
        error: 'Please fill in all fields'
      });
      return;
    }

    setResult(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            razorpay_signature: signature,
          }),
        });

        const resultData = await response.json();
        setResult({
          valid: resultData.valid,
          message: resultData.message,
          error: resultData.error,
          orderId: resultData.orderId,
          paymentId: resultData.paymentId,
        });
      } catch (error) {
        setResult({
          valid: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
      }
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Payment Verification Test</CardTitle>
            <CardDescription>
              Enter Razorpay payment details to verify a payment signature
            </CardDescription>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="order_xxxxxxxxxx"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentId">Payment ID</Label>
              <Input
                id="paymentId"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="pay_xxxxxxxxxx"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature">Signature</Label>
              <Input
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                disabled={isPending}
              />
            </div>

            {result && (
              <Alert variant={result.valid ? "default" : "destructive"} className={result.valid ? "bg-green-50 text-green-800 border-green-200" : undefined}>
                {result.valid ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{result.valid ? 'Verification Successful' : 'Verification Failed'}</AlertTitle>
                <AlertDescription>
                  {result.valid
                    ? (result.message || `The payment signature for order ${result.orderId} is valid.`)
                    : (result.error || 'Invalid payment signature')}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground pt-2">
              <p>You can get these values from the Razorpay callback after a payment.</p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleVerify}
              disabled={isPending || !paymentId || !orderId || !signature}
              className="w-full"
            >
              {isPending ? 'Verifying...' : 'Verify Payment'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

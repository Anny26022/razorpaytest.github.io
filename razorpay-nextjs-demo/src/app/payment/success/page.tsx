'use client';

import { Suspense } from 'react';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

function PaymentDetails() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');
  const isVerified = searchParams.get('verified') === 'true';

  return (
    <>
      {(paymentId || orderId) && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium">Payment Details</h3>
            {paymentId && (
              <div className="grid grid-cols-3 gap-1 text-sm">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="col-span-2 font-mono truncate">{paymentId}</span>
              </div>
            )}
            {orderId && (
              <div className="grid grid-cols-3 gap-1 text-sm">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="col-span-2 font-mono truncate">{orderId}</span>
              </div>
            )}
            {isVerified && (
              <div className="grid grid-cols-3 gap-1 text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="col-span-2 text-green-600">Payment signature verified</span>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function VerificationBadge() {
  const searchParams = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';

  if (!isVerified) return null;

  return (
    <div className="flex justify-center items-center mt-2">
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
        <ShieldCheck className="h-3 w-3" />
        Verified
      </Badge>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>

          <Suspense fallback={null}>
            <VerificationBadge />
          </Suspense>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Your payment has been processed successfully. Thank you for your purchase!
          </p>

          <Suspense fallback={<div className="py-2 text-center text-sm">Loading payment details...</div>}>
            <PaymentDetails />
          </Suspense>

          <div className="pt-4 text-center">
            <p className="text-sm">
              A confirmation has been sent to your email address.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link href="/" passHref>
            <Button>Return to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}

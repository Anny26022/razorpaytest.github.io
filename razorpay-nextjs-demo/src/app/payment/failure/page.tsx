'use client';

import { Suspense } from 'react';
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function ErrorDetails() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error');

  return (
    <>
      {errorMessage && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium">Error Details</h3>
            <div className="p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-700">
              {errorMessage}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function PaymentFailurePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Payment Failed</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Your payment could not be processed. Please try again or use a different payment method.
          </p>

          <Suspense fallback={<div className="py-2 text-center text-sm">Loading error details...</div>}>
            <ErrorDetails />
          </Suspense>

          <div className="pt-4 text-center">
            <p className="text-sm">
              If you continue to experience issues, please contact our support team.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center gap-4">
          <Link href="/" passHref>
            <Button variant="outline">Return to Home</Button>
          </Link>
          <Link href="/" passHref>
            <Button>Try Again</Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}

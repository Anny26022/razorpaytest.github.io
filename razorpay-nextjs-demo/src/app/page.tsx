import Image from "next/image";
import Link from "next/link";
import PaymentContainer from "@/components/PaymentContainer";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="max-w-5xl w-full flex flex-col items-center justify-center space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Razorpay Integration Demo
          </h1>
          <p className="text-xl text-muted-foreground leading-7 max-w-3xl">
            A simple Next.js application with Razorpay payment gateway integration
          </p>
        </div>

        <div className="w-full max-w-md">
          <PaymentContainer defaultAmount={999} />
        </div>

        <div className="flex flex-col items-center text-center pt-4 space-y-4">
          <Link href="/payment/verify-test">
            <Button variant="outline" size="sm">
              Payment Verification Test Tool
            </Button>
          </Link>

          <div className="flex flex-col items-center text-center mt-4 pt-8 border-t w-full">
            <p className="text-sm text-muted-foreground">
              Made with Next.js and Razorpay
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

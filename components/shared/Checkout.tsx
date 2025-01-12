import { useToast } from "@/components/ui/use-toast";
import { createTransaction } from "@/lib/action/transaction.action";
import { Button } from "@material-tailwind/react";

import Script from "next/script";

const Checkout = ({
  planId,
  amount,
  buyerId,
  productId,
}: {
  planId: string;
  amount: number;
  buyerId: string;
  productId: string;
}) => {
  const { toast } = useToast();

  const onCheckout = async () => {
    toast({
      title: "For International Users Use Paypal",
      description: "Buy Credits > Wallet > Paypal",
      duration: 3000,
      className: "success-toast z-55",
    });

    const response = await fetch("/api/webhooks/razerpay/subscription", {
      method: "POST",
      body: JSON.stringify({ planId, buyerId, productId }),
      headers: { "Content-Type": "application/json" },
    });
    console.log(response);
    const subscriptionCreate = await response.json();
    if (!subscriptionCreate.subscription) {
      throw new Error("Purchase Order is not created");
    }

    const paymentOptions = {
      key_id: process.env.RAZORPAY_KEY_ID!,
      amount: amount * 100,
      currency: "INR",
      name: "GK Services",
      description: "Thanks For Taking Our Services",
      subscription_id: subscriptionCreate.subscription,
      notes: {
        plan: planId,
        buyerId: buyerId,
        amount: amount,
      },
      handler: async function (response: any) {
        const data = {
          orderCreationId: subscriptionCreate.subscription,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        };
        console.log("data", data);
        const result = await fetch("/api/webhooks/razerpay/verify", {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        });
        const res = await result.json();
        if (res.isOk) {
          toast({
            title: "Order placed!",
            description: "Credits are added in your account",
            duration: 3000,
            className: "success-toast",
          });
          const transaction1 = {
            customerId: subscriptionCreate.subscription,
            amount: amount,
            plan: planId,
            buyerId: buyerId,
            createdAt: new Date(),
          };

          await createTransaction(transaction1);
        } else {
          toast({
            title: "Order canceled!",
            description: res.message,
            duration: 3000,
            className: "error-toast",
          });
        }
      },
      theme: {
        color: "#3399cc",
      },
    };

    const paymentObject = new (window as any).Razorpay(paymentOptions);
    console.log(paymentObject);
    paymentObject.on("payment.failed", function (response: any) {
      toast({
        title: "Order failed!",
        description: response.error.description,
        duration: 3000,
        className: "error-toast",
      });
    });

    paymentObject.open();
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <form action={onCheckout}>
        <Button
          type="submit"
          role="link"
          size="lg"
          color="green"
          variant="gradient"
          className="px-3"
        >
          Buy Now
        </Button>
      </form>
    </>
  );
};

export default Checkout;

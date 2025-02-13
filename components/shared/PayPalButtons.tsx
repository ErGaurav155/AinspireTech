// "use client";
// import { useEffect } from "react";
// import Script from "next/script";

// interface PayPalButtonProps {
//   planId: string;
//   planName?: string;
// }

// export default function PayPalButton({ planId, planName }: PayPalButtonProps) {
//   console.log(planId, planName);
//   useEffect(() => {
//     if (typeof window !== "undefined" && (window as any).paypal) {
//       (window as any).paypal
//         .Buttons({
//           style: {
//             shape: "rect",
//             color: "gold",
//             layout: "vertical",
//             label: "subscribe",
//           },
//           createSubscription: function (data: any, actions: any) {
//             return actions.subscription.create({
//               plan_id: planId,
//             });
//           },
//           onApprove: function (data: any, actions: any) {
//             alert(`Subscription created: ${data.subscriptionID}`);
//           },
//         })
//         .render(`#paypal-button-container-${planId}`);
//     }
//   }, [planId]);

//   return (
//     <div className="p-4 border rounded shadow my-4">
//       {planName && <h2 className="text-xl font-bold mb-2">{planName}</h2>}
//       <div id={`paypal-button-container-${planId}`} />
//       {/* Load the PayPal SDK script using afterInteractive */}
//       <Script
//         src="https://www.paypal.com/sdk/js?client-id=AfW1iMa0sPttfeyYILnlLXAl6-dQRfhkBvXC_2oog2152KNpApbK9Sc1QVKMvdv3pcR4j7qUTcOfRKdL&vault=true&intent=subscription"
//         strategy="afterInteractive"
//       />
//     </div>
//   );
// }

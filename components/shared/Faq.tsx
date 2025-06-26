"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const Faq = () => {
  return (
    <div>
      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8   ">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Can I change my plan anytime?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept Razorpay and PayPal Payment Gateways for our customers.",
              },
              {
                question: "Is there a setup fee?",
                answer:
                  "No, there are no setup fees or hidden costs. You only pay the monthly or yearly subscription.",
              },
              {
                question: "Can I cancel anytime?",
                answer:
                  "Yes, you can cancel your subscription at any time. No questions asked.",
              },
              {
                question: "How quickly can I get started?",
                answer:
                  "You can be up and running within 5 minutes of subscribing. No technical setup required.",
              },
            ].map((faq, index) => (
              <Card
                key={index}
                className="bg-[#0a0a0a]/60 border border-[#333]"
              >
                <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-300 font-mono">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Faq;

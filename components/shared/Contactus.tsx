"use client";

import React, { useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "@/lib/validator";
import { toast } from "../ui/use-toast";
import { createAppointment } from "@/lib/action/appointment.actions";

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      email: "",
      address: "",
      budget: "",
      phone: "",
      message: "",
    },
  });

  // Submit handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const Appointmentdata = {
        name: values.name,
        phone: values.phone,
        address: values.address,
        email: values.email,
        budget: values.budget,
        subject: values.subject,
        message: values.message,
      };

      const response = await createAppointment(Appointmentdata);

      if (response) {
        toast({
          title: "Appointment Booked Successfully",
          description: `We will contact you soon`,
          duration: 2000,
          className: "success-toast",
        });
        form.reset(); // Reset form after successful submission
      } else {
        toast({
          title: "Appointment booking Failed",
          description: `Please try again`,
          duration: 2000,
          className: "error-toast",
        });
      }
    } catch (error) {
      toast({
        title: "Appointment booking Failed",
        description: `Please try again`,
        duration: 2000,
        className: "error-toast",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-screen py-16 relative z-10">
      <div className="container mx-auto p-2 md:px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Content Section */}
          <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-2 md:p-8 rounded-2xl border border-[#B026FF]/30">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              THE FUTURE, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#55edab]">
                AWAITS.
              </span>
            </h1>
            <p className="text-gray-300 mt-6 text-lg">
              Got a burning AI idea, question, or just want to chat about what
              we do? We are all ears! Reach out, and our friendly team at
              AinspireTech AI will be right there to guide, assist, or simply
              share in your excitement. Lets make your AI journey memorable
              together!
            </p>

            {/* Owner Details */}
            <div className="mt-10 border-t border-[#00F0FF]/30 pt-6">
              <h1 className="text-white text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#55edab]">
                Owner Details:
              </h1>
              <div className="space-y-3">
                <p className="text-gray-300 flex">
                  <span className="text-[#00F0FF] min-w-[100px]">Owner: </span>{" "}
                  Mr. GAURAV KHIARE
                </p>
                <p className="text-gray-300 flex">
                  <span className="text-[#00F0FF] min-w-[100px]">
                    Business:
                  </span>
                  GK Services
                </p>
                <p className="text-gray-300 flex">
                  <span className="text-[#00F0FF] min-w-[100px]">Email:</span>
                  <a
                    href="mailto:gauravgkhaire@gmail.com"
                    className="text-[#55edab] hover:underline"
                  >
                    gauravgkhaire@gmail.com
                  </a>
                </p>
                <p className="text-gray-300 flex">
                  <span className="text-[#00F0FF] min-w-[100px]">Address:</span>
                  Chandwad, Nashik, Maharashtra - 423104
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-900/50 backdrop-blur-md border border-[#B026FF]/30 rounded-2xl p-2 md:p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Name and Phone Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            className="bg-gray-800/50 border border-gray-700 text-white rounded-lg py-6 px-4 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]"
                            placeholder="Full Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-gray-800/50 border border-gray-700 text-white rounded-lg py-6 px-4 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]"
                            placeholder="Phone Number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Subject and Email Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            className="bg-gray-800/50 border border-gray-700 text-white rounded-lg py-6 px-4 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]"
                            placeholder="Subject"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            className="bg-gray-800/50 border border-gray-700 text-white rounded-lg py-6 px-4 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]"
                            placeholder="Enter email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Budget and Address Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="bg-gray-800/50 border border-gray-700 text-white rounded-lg py-6 px-4 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]">
                            <SelectValue placeholder="Choose Budget" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border border-[#B026FF]/30 backdrop-blur-md">
                            {[
                              "$100 - $500",
                              "$500 - $1000",
                              "$1,000 - $1,500",
                              "$1,500- $2,000",
                              "$2,000 +",
                            ].map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                                className="text-white hover:bg-gray-800/50 py-3"
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            className="bg-gray-800/50 border border-gray-700 text-white rounded-lg py-6 px-4 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]"
                            placeholder="Enter address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Message Field */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          rows={6}
                          className="bg-gray-800/50 border border-gray-700 text-white rounded-lg py-4 px-4 focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]"
                          placeholder="Your Message"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-4">
                  {isSubmitting ? (
                    <Button
                      type="submit"
                      disabled
                      className="w-full py-6 bg-gradient-to-r from-[#00F0FF] to-[#55edab] text-black font-bold text-lg rounded-lg opacity-70 cursor-not-allowed"
                    >
                      Submitting...
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="w-full py-6 bg-gradient-to-r from-[#00F0FF] to-[#55edab] text-black font-bold text-lg rounded-lg hover:from-[#00F0FF]/90 hover:to-[#55edab]/90 transition-all duration-300 shadow-lg shadow-[#00F0FF]/20"
                    >
                      Send Message
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

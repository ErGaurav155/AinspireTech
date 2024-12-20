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
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentBooked, setAppointmentBooked] = useState<boolean>(false);

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
      console.log(values); // Handle form submission
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
        setAppointmentBooked(true);
      } else {
        toast({
          title: "Appointment booking Failed",
          description: `Plz Try Again `,
          duration: 2000,
          className: "error-toast",
        });
      }
    } catch (error) {
      toast({
        title: "Appointment booking Failed",
        description: `Plz Try Again `,
        duration: 2000,
        className: "error-toast",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (appointmentBooked) {
    return <InsufficientCreditsModal />;
  }
  return (
    <section className=" w-full shadow-lg my-5 rounded-md py-16 bg-black">
      <div className="container  mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Google Map */}

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl  lg:text-6xl font-bold  text-white leading-tight">
              THE FUTURE, <br />
              <span className="  text-[#55edab]">AWAITS.</span>
            </h1>
            <p className="p-20-regular text-white mt-4">
              Got a burning AI idea, question, or just want to chat about what
              we do? We are all ears! Reach out, and our friendly team at
              Morningside AI will be right there to guide, assist, or simply
              share in your excitement. Lets make your AI journey memorable
              together!
            </p>
          </div>
          {/* Contact Form */}
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Department and Doctor Fields */}
                <div className="flex flex-col sm:flex-row gap-1 items-center justify-between w-full">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-auto w-full">
                        <FormControl>
                          <Input
                            type="text"
                            className="select-field"
                            placeholder="Full Name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="flex-auto w-full">
                        <FormControl>
                          <Input
                            type="number"
                            className="select-field"
                            placeholder="Phone Number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date and Time Fields */}
                <div className="flex flex-col sm:flex-row gap-1 items-center justify-between w-full">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem className="flex-auto w-full">
                        <FormControl>
                          <Input
                            type="text"
                            className="select-field"
                            placeholder="subject"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex-auto w-full">
                        <FormControl>
                          <Input
                            type="email"
                            className="select-field"
                            placeholder=" Enter email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-1 items-center justify-between w-full">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem className="flex-auto w-full">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="select-field ">
                            <SelectValue placeholder="Choose Budget" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              className="bg-white hover:bg-gray-100 text-black text-lg  py-2 px- mb-4 m-auto text-center flex min-w-max"
                              value="Budget A"
                            >
                              $100 - $500
                            </SelectItem>
                            <SelectItem
                              className="bg-white hover:bg-gray-100 text-black text-lg  py-2 px- mb-4 m-auto text-center flex min-w-max"
                              value="Budget B"
                            >
                              $500 - $1000
                            </SelectItem>
                            <SelectItem
                              className="bg-white hover:bg-gray-100 text-black text-lg  py-2 px- mb-4 m-auto text-center flex min-w-max"
                              value="Budget C"
                            >
                              $1,000 - $1,500
                            </SelectItem>
                            <SelectItem
                              className="bg-white hover:bg-gray-100 text-black text-lg  py-2 px- mb-4 m-auto text-center flex min-w-max"
                              value="Budget D"
                            >
                              $1,500- $2,000
                            </SelectItem>
                            <SelectItem
                              className="bg-white hover:bg-gray-100 text-black text-lg  py-2 px- mb-4 m-auto text-center flex min-w-max"
                              value="Budget E"
                            >
                              $2,000 +
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="flex-auto w-full">
                        <FormControl>
                          <Input
                            type="text"
                            className="select-field"
                            placeholder=" Enter address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Name and Phone Fields */}

                {/* Message Field */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          rows={6}
                          className="select-field"
                          placeholder="Your Message"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="col-span-2">
                  {isSubmitting ? (
                    <Button
                      type="submit"
                      className="px-4 py-2 text-base md:text-xl hover:bg-indigo-600 bg-indigo-700 text-white w-full"
                    >
                      Submitting...
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="px-4 py-2 text-base md:text-xl hover:bg-indigo-600 bg-indigo-700 text-white w-full"
                    >
                      Send
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

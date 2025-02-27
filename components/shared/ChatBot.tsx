"use client";

import React, { useEffect, useState } from "react";
import { Collapse, Button } from "@material-tailwind/react";
import {
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  ChevronDoubleDownIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { toast } from "../ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formSchema1 } from "@/lib/validator";
import { generateGptResponse } from "@/lib/action/ai.action";
import Link from "next/link";
import { createAllProducts } from "@/lib/action/plan.action";
import { getUserByDbId } from "@/lib/action/user.actions";

export default function AIChatBot() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    { sender: "AI Bot", text: "Hello! How can I help you?" },
  ]);
  const [submit, setSubmit] = useState(false);

  const toggleOpen = () => setOpen((cur) => !cur);

  const form = useForm<z.infer<typeof formSchema1>>({
    resolver: zodResolver(formSchema1),
    defaultValues: {
      message: "",
    },
  });

  // Submit handler
  const onSubmit = async (values: z.infer<typeof formSchema1>) => {
    const { message } = values;
    setSubmit(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "You", text: message },
    ]);

    form.reset({ message: "" });

    try {
      const response = await generateGptResponse({
        userInput: message,
        userfileName: "morningside.ai.json",
      });

      if (response) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "AI Bot", text: response },
        ]);
      } else {
        toast({
          title: "Content Warning",
          duration: 2000,
          className: "error-toast",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "AI Bot", text: "Sorry, something went wrong!" },
      ]);
    } finally {
      setSubmit(false);
    }
  };

  const restartChat = () => {
    setMessages([{ sender: "AI Bot", text: "Hello! How can I help you?" }]);
  };

  return (
    <div className="h-auto w-auto flex flex-col ">
      <div
        className={` fixed bottom-4 right-4 z-40 text-center  ${
          open ? "hidden" : "inline-block"
        }  `}
      >
        <div
          className={` bg-[#143796] text-white rounded-full shadow-lg p-3  hover:bg-[#5372c0] transition`}
        >
          <ChatBubbleLeftIcon
            onClick={toggleOpen}
            className="text-white h-12 w-12"
          />
        </div>
        <h1
          className={`font-semibold text-base text-[#0f1788]  hover:text-[#5372c0]`}
        >
          Help
        </h1>
      </div>

      <Collapse
        open={open}
        className={`fixed bottom-4 right-5 w-[90vw] ${
          open ? "border" : "border-none"
        } sm:w-96 h-[90vh] max-h-[90vh] bg-gray-50 flex flex-col gap-4 rounded-xl shadow-xl shadow-gray-700 z-20 `}
      >
        <div className="flex p-4 items-center justify-between gap-2 w-full border-b">
          <div className="pl-3 w-full flex items-center text-nowrap justify-start gap-4">
            <div className="border w-14 h-14 p-3 rounded-full bg-gray-200">
              <SparklesIcon className="text-gray-700" />
            </div>
            <span className="font-normal flex gap-1 md:gap-2 text-xl md:text-2xl">
              {["Dev", "Ai"].map((word, index) => (
                <span
                  key={index}
                  style={{
                    display: "block ",
                    animation: `colorChangeHorizontal  2s infinite ${
                      index * 0.5
                    }s`,
                  }}
                >
                  {word}
                </span>
              ))}
            </span>
          </div>
          <div className="w-full flex items-center justify-center gap-4">
            <button
              className="w-10 h-10 p-2 rounded-full hover:bg-gray-300"
              onClick={restartChat}
            >
              <ArrowPathIcon className="text-gray-700" />
            </button>
            <button className="w-10 h-10 p-2 rounded-full hover:bg-gray-300">
              <ChevronDoubleDownIcon
                onClick={toggleOpen}
                className="text-gray-700"
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col p-4 flex-1 min-h-[50vh] max-h-[50vh] z-10 overflow-y-auto no-scrollbar">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "You" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 my-1 rounded-lg ${
                  msg.sender === "You"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                <span>{msg.text}</span>
              </div>
            </div>
          ))}
          <Link
            target="_blank"
            href="https://ainspiretech.com/"
            className="absolute flex items-center justify-center gap-1 bottom-0 left-1/3 text-xs font-thin text-gray-400 mb-1"
          >
            <div className="relative w-4 h-2 overflow-hidden">
              <div className="absolute w-4 h-8 bg-orange-300 rounded-full"></div>
            </div>
            Powered by AinspireTech
          </Link>
        </div>

        <div className="flex items-center gap-2 p-4 border-t">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-center justify-between gap-3 w-full"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="w-full ">
                    <FormControl>
                      <input
                        className="select-field w-full"
                        placeholder="Your Message"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {submit ? (
                <Button
                  type="submit"
                  className="pl-1 py-2 text-base md:text-xl hover:bg-[#88e2bb] bg-[#6ee5b2] text-white "
                >
                  Sending..
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="px-4 py-2 text-base md:text-xl hover:bg-[#88e2bb] bg-[#6ee5b2] text-white "
                >
                  Send
                </Button>
              )}
            </form>
          </Form>
        </div>
      </Collapse>
    </div>
  );
}

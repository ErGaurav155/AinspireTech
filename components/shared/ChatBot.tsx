"use client";

import React, { useEffect, useState } from "react";
import { Collapse } from "@material-tailwind/react";
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

export default function AIChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "AI Bot", text: "Hello! How can I help you?" },
  ]);
  const [submit, setSubmit] = useState(false);

  // const toggleOpen = async () => {
  //   setOpen(true);
  //   const response = await fetch("/api/scrape-anu", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       mainUrl: "https://ainspiretech.com/",
  //       userId: "user_2zSxTB9PwSs67PGtuSzFw37CpNv",
  //     }),
  //   });
  //   console.log("response:", response);
  // };
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
    <div className="h-auto w-auto flex flex-col">
      {/* Closed state button */}
      <div
        className={`fixed bottom-4 right-4 z-40 text-center justify-center ${
          open ? "hidden" : "inline-block"
        }`}
      >
        <button
          onClick={toggleOpen}
          disabled={open}
          className="bg-gradient-to-r h-14 w-14 from-[#00F0FF] to-[#FF2E9F] rounded-full shadow-lg p-3 flex items-center justify-center hover:shadow-[0_0_15px_5px_rgba(0,240,255,0.5)] transition-all duration-300"
        >
          <ChatBubbleLeftIcon className="text-white h-12 w-12" />
        </button>
        <h1 className="font-semibold text-base text-white mt-1">Help </h1>
      </div>

      {/* Chat window */}
      <Collapse
        open={open}
        className={`fixed bottom-4 right-4 w-[90vw] sm:w-96 h-[80vh] max-h-[80vh] bg-gray-900/80 backdrop-blur-lg border ${
          open ? "border border-[#B026FF]/30" : "border-none"
        }  rounded-xl shadow-xl shadow-[#00F0FF]/20 z-20 flex flex-col`}
      >
        {/* Header */}
        <div className="flex p-4 items-center justify-between gap-2 w-full bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="border-2 border-white w-12 h-12 p-2 rounded-full bg-black/30">
              <SparklesIcon className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              DevAI Assistant
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-10 h-10 p-2 rounded-full hover:bg-black/20 transition"
              onClick={restartChat}
            >
              <ArrowPathIcon className="text-white" />
            </button>
            <button
              className="w-10 h-10 p-2 rounded-full hover:bg-black/20 transition"
              onClick={toggleOpen}
            >
              <ChevronDoubleDownIcon className="text-white" />
            </button>
          </div>
        </div>

        {/* Messages container */}
        <div className="flex flex-col p-4 flex-1 min-h-[50vh] max-h-[50vh] overflow-y-auto no-scrollbar space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "You" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-xl max-w-[80%] ${
                  msg.sender === "You"
                    ? "bg-gradient-to-r from-[#B026FF] to-[#FF2E9F] text-white"
                    : "bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-white"
                }`}
              >
                <span>{msg.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-[#00F0FF]/30">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-center gap-3 w-full"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <input
                        className="w-full bg-gray-800/50 border border-[#00F0FF]/30 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
                        placeholder="Your message..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <button
                type="submit"
                disabled={submit}
                className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black font-bold py-3 px-5 rounded-lg hover:from-[#00F0FF]/90 hover:to-[#B026FF]/90 transition-all duration-300 disabled:opacity-70"
              >
                {submit ? "Sending..." : "Send"}
              </button>
            </form>
          </Form>

          {/* Footer */}
          <div className="mt-2 text-center">
            <Link
              target="_blank"
              href="https://ainspiretech.com/"
              className="text-xs text-gray-400 hover:text-[#00F0FF] transition-colors"
            >
              Powered by AinspireTech
            </Link>
          </div>
        </div>
      </Collapse>
    </div>
  );
}

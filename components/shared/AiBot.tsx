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
import {
  generateGptResponse,
  generateMcqResponse,
} from "@/lib/action/ai.action";
import Link from "next/link";
import { createAllProducts } from "@/lib/action/plan.action";
import { getUserByDbId } from "@/lib/action/user.actions";
import { sendWhatsAppInfo } from "@/lib/action/sendEmail.action";
import FeedbackForm from "./FeedBack";
import { handleError } from "@/lib/utils";

interface AibotCollapseProps {
  authorised: boolean;
  userId: string | null;
}

export default function AibotCollapse({
  authorised,
  userId,
}: AibotCollapseProps) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [messages, setMessages] = useState([
    { sender: "AI Bot", text: "Hello! How can I help you?" },
  ]);
  const [submit, setSubmit] = useState(false);
  const [userfileName, setUserFileName] = useState("");

  const toggleOpen = () => setOpen((cur) => !cur);

  const form = useForm<z.infer<typeof formSchema1>>({
    resolver: zodResolver(formSchema1),
    defaultValues: {
      message: "",
    },
  });

  // Submit handler (same as before)
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
        userfileName: userfileName,
      });

      if (response) {
        setCount((pre: number) => pre + 1);
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
    setCount(-10);
    setMessages([{ sender: "AI Bot", text: "Hello! How can I help you?" }]);
  };
  useEffect(() => {
    const getFileName = async () => {
      try {
        if (!userId) {
          authorised === false;
          return;
        }
        const user = await getUserByDbId(userId);

        if (user) {
          setUserFileName(user.scrappedFile);
        }
      } catch (error) {
        console.error("Error fetching file name:", error);
      }
    };

    getFileName();
  }, [userId, authorised]); // Add userId as a dependency

  async function handleFeedbackSubmit(data: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }) {
    try {
      setCount(-999);
      const response = await sendWhatsAppInfo({ data, userId });
      if (!response) {
        handleError;
      }
      toast({
        title: "Form Submmitted Successfully,We will contact you soon",
        duration: 2000,
        className: "success-toast",
      });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  }

  return (
    <div className="h-auto w-auto flex flex-col">
      {/* Closed state button */}
      <div
        className={`fixed bottom-4 right-4 z-40 text-center ${
          open ? "hidden" : "inline-block"
        }`}
      >
        <div className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-white rounded-full shadow-lg p-3 hover:opacity-90 transition-all shadow-[#00F0FF]/40">
          <ChatBubbleLeftIcon
            onClick={toggleOpen}
            className="text-white h-12 w-12"
          />
        </div>
        <h1 className="font-semibold text-base text-[#00F0FF]">Help</h1>
      </div>

      {/* Open state chat window */}
      <Collapse
        open={open}
        className={`fixed bottom-4 right-5 w-[90vw] ${
          open ? "border" : "border-none"
        } sm:w-[26rem] h-[100vh] max-h-[100vh] bg-[#0a0a0a]/90 backdrop-blur-lg flex flex-col gap-4 rounded-xl border-[#00F0FF]/30 shadow-[0_0_20px_5px_rgba(0,240,255,0.2)] z-20`}
      >
        {/* Header */}
        <div className="flex p-4 items-center justify-between gap-2 w-full border-b border-[#00F0FF]/30">
          <div className="pl-3 w-full flex items-center text-nowrap justify-start gap-4">
            <div className="border w-14 h-14 p-3 rounded-full bg-gradient-to-r from-[#00F0FF]/20 to-[#B026FF]/20 backdrop-blur-sm">
              <SparklesIcon className="text-[#00F0FF]" />
            </div>
            <span className="font-normal flex gap-1 md:gap-2 text-xl text-white">
              {["Support", "Ai"].map((word, index) => (
                <span
                  key={index}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]"
                >
                  {word}
                </span>
              ))}
            </span>
          </div>
          <div className="w-full flex items-center justify-center gap-4">
            <button
              className="w-10 h-10 p-2 rounded-full hover:bg-[#00F0FF]/10"
              onClick={restartChat}
            >
              <ArrowPathIcon className="text-[#00F0FF]" />
            </button>
            <button className="w-10 h-10 p-2 rounded-full hover:bg-[#00F0FF]/10">
              <ChevronDoubleDownIcon
                onClick={toggleOpen}
                className="text-[#00F0FF]"
              />
            </button>
          </div>
        </div>

        {authorised ? (
          <div>
            {/* Chat messages */}
            <div className="flex flex-col p-4 flex-1 min-h-[60vh] max-h-[60vh] z-10 overflow-y-auto no-scrollbar">
              {messages.map((msg, index) => (
                <div key={index}>
                  <div
                    className={`flex ${
                      msg.sender === "You" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 my-1 rounded-lg max-w-[80%] ${
                        msg.sender === "You"
                          ? "bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-white"
                          : "bg-[#1a1a1a] border border-[#00F0FF]/20 text-gray-300"
                      }`}
                    >
                      <span>{msg.text}</span>
                    </div>
                  </div>
                  {index === 6 && count > 2 && (
                    <FeedbackForm onSubmit={handleFeedbackSubmit} />
                  )}
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="border-t border-[#00F0FF]/30 p-1">
              <div className="flex items-center gap-2 pt-4 px-4">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex items-center justify-between gap-3 w-full"
                  >
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <input
                              className="w-full p-2 rounded-lg bg-[#1a1a1a] border border-[#00F0FF]/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
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
                        className="px-4 py-2 text-base md:text-xl bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black hover:opacity-90 transition-opacity rounded-lg"
                      >
                        Sending..
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="px-4 py-2 text-base md:text-xl bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black hover:opacity-90 transition-opacity rounded-lg"
                      >
                        Send
                      </Button>
                    )}
                  </form>
                </Form>
              </div>
              <Link
                target="_blank"
                href="https://ainspiretech.com/"
                className="flex items-center justify-center gap-1 bottom-0 left-1/3 text-xs font-thin text-[#00F0FF] mt-1"
              >
                <div className="relative w-4 h-2 overflow-hidden">
                  <div className="absolute w-4 h-8 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full animate-pulse"></div>
                </div>
                Powered by AinspireTech
              </Link>
            </div>
          </div>
        ) : (
          // Unauthorized message
          <div className="flex flex-col p-4 flex-1 min-h-[50vh] z-10 overflow-y-auto no-scrollbar text-gray-300">
            <p className="mb-4">
              Unauthorized access. Please check your monthly subscription. If
              you are a user, please notify the owner.
            </p>
            <Link
              className="px-4 py-2 text-center mt-4 text-base md:text-xl bg-gradient-to-r from-[#00F0FF] to-[#B026FF] text-black hover:opacity-90 transition-opacity rounded-lg"
              href={`https://ainspiretech.com/UserDashboard`}
            >
              Check Subscription
            </Link>
          </div>
        )}
      </Collapse>
    </div>
  );
}

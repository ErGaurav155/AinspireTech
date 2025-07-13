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
import {
  generateGptResponse,
  generateMcqResponse,
} from "@/lib/action/ai.action";
import Link from "next/link";
import { getUserByDbId } from "@/lib/action/user.actions";
import McqFormPage from "./McqForm";
import { handleError } from "@/lib/utils";
import { Button } from "../ui/button";

interface AibotCollapseProps {
  authorised: boolean;
  userId: string | null;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  questions: Question[];
}

export default function McqbotCollapse({
  authorised,
  userId,
}: AibotCollapseProps) {
  // Chat states
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "AI Bot", text: "Hello! How can I help you?" },
    { sender: "You", text: "Eg.Generate mcq test for my neet exam" },
  ]);
  const [send, setSend] = useState(false);

  const [submit, setSubmit] = useState(false);
  const [userfileName, setUserFileName] = useState("");

  // Quiz states
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const form = useForm<z.infer<typeof formSchema1>>({
    resolver: zodResolver(formSchema1),
    defaultValues: {
      message: "",
    },
  });

  const toggleOpen = () => setOpen((cur) => !cur);

  // Merged onSubmit handler for chat and quiz
  const onSubmit = async (values: z.infer<typeof formSchema1>) => {
    const { message } = values;
    setSubmit(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "You", text: message },
    ]);
    form.reset({ message: "" });

    try {
      const response = await generateMcqResponse({
        userInput: message,
        isMCQRequest: false,
      });

      // Regular chat response handling
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

  // Quiz handling functions
  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    quizData!.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setIsQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setQuizData(null);
    setIsQuizSubmitted(false);
    setSelectedAnswers([]);
    setMessages([
      { sender: "AI Bot", text: "Hello! How can I help you?" },
      { sender: "You", text: "Generate mcq test for my neet exam" },
    ]);
  };
  async function handleFeedbackSubmit(data: {
    Topic: string;
    Level: string;
    Exam?: string;
    Info?: string;
  }) {
    try {
      setSend(true);
      const newMessage = `generate mcq test for ${data.Topic} based on ${data.Exam} syllabus.Toughness must be ${data.Level} Also consider ${data.Info}`;
      form.reset();

      const response = await generateMcqResponse({
        userInput: newMessage,
        isMCQRequest: true,
      });
      // Attempt to parse the response as quiz data (MCQ JSON)
      if (!response) {
        handleError;
      }
      toast({
        title: "Form Submmitted Successfully,We will contact you soon",
        duration: 2000,
        className: "success-toast",
      });
      try {
        const parsed = JSON.parse(response);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          setQuizData(parsed);
          setSelectedAnswers(new Array(parsed.questions.length).fill(-1));
          return; // Exit early if quiz data is found
        }
      } catch (e) {
        // If parsing fails, treat it as a regular chat message
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    } finally {
      setSend(false);
    }
  }
  const renderQuiz = () => (
    <div className="overflow-y-scroll h-[70vh] no-scrollbar">
      <div className="flex flex-col p-4 flex-1 h-auto max-h-[50vh] z-10 overflow-y-auto no-scrollbar">
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
      </div>
      <div className="px-4 ">
        {quizData!.questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-6">
            <h3 className="font-semibold mb-2">{q.question}</h3>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, optIndex) => (
                <button
                  key={optIndex}
                  onClick={() => handleOptionSelect(qIndex, optIndex)}
                  className={`p-2 rounded text-left ${
                    isQuizSubmitted
                      ? optIndex === q.correctAnswer
                        ? "bg-green-200"
                        : selectedAnswers[qIndex] === optIndex
                        ? "bg-red-200"
                        : "bg-gray-100"
                      : selectedAnswers[qIndex] === optIndex
                      ? "bg-blue-100"
                      : "bg-gray-50"
                  }`}
                  disabled={isQuizSubmitted}
                >
                  {opt}
                </button>
              ))}
            </div>
            {isQuizSubmitted && (
              <div className="mt-2 text-sm">
                <p className="text-green-600">Solution:{q.explanation}</p>
              </div>
            )}
          </div>
        ))}

        <div className="mt-4">
          {!isQuizSubmitted ? (
            <button
              onClick={handleQuizSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
            >
              Submit Answers
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded">
                <h3 className="text-xl font-bold">
                  Score: {score}/{quizData!.questions.length}
                </h3>
                <button
                  onClick={resetQuiz}
                  className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const getFileName = async () => {
      try {
        if (!userId) return;
        const user = await getUserByDbId(userId);
        if (user) {
          setUserFileName(user.fileName);
        }
      } catch (error) {
        console.error("Error fetching file name:", error);
      }
    };
    getFileName();
  }, [userId]);

  return (
    <div className="h-auto w-auto flex flex-col">
      {/* Toggle Button */}
      <div
        className={`fixed bottom-4 right-4 z-40 text-center ${
          open ? "hidden" : "inline-block"
        }`}
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
          Tutor
        </h1>
      </div>

      {/* Collapse Component */}
      <Collapse
        open={open}
        className={`fixed bottom-4 right-5 w-[90vw] ${
          open ? "border" : "border-none"
        } sm:w-[26rem] h-[100vh] max-h-[100vh] bg-gray-50 flex flex-col gap-4 rounded-xl shadow-xl shadow-gray-700 z-20`}
      >
        {/* Header */}
        <div className="flex p-4 items-center justify-between gap-2 w-full border-b">
          <div className="pl-3 w-full flex items-center text-nowrap justify-start gap-4">
            <div className="border w-14 h-14 p-3 rounded-full bg-gray-200">
              <SparklesIcon className="text-gray-700" />
            </div>
            <span className="font-normal flex gap-1 md:gap-2 text-xl md:text-2xl">
              {["Tutor", "Ai"].map((word, index) => (
                <span
                  key={index}
                  style={{
                    display: "block",
                    animation: `colorChangeHorizontal 2s infinite ${
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
              onClick={resetQuiz}
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

        {authorised ? (
          <div>
            {quizData ? (
              // Render Quiz if quizData is available

              renderQuiz()
            ) : (
              // Chat UI
              <div>
                <div className="flex flex-col p-4 flex-1 min-h-[60vh] max-h-[60vh] z-10 overflow-y-auto no-scrollbar">
                  <McqFormPage send={send} onSubmit={handleFeedbackSubmit} />
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
                      </div>{" "}
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
                          <FormItem className="w-full">
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
                          className="pl-1 py-2 text-base md:text-xl hover:bg-[#88e2bb] bg-[#6ee5b2] text-white"
                        >
                          Sending..
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="px-4 py-2 text-base md:text-xl hover:bg-[#88e2bb] bg-[#6ee5b2] text-white"
                        >
                          Send
                        </Button>
                      )}
                    </form>
                  </Form>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Unauthorized view
          <div className="flex flex-col p-4 flex-1 min-h-[50vh] z-10 overflow-y-auto no-scrollbar">
            Unauthorized access. Please check your monthly subscription. If you
            are a user, please contact the owner.
            <Link
              className="px-4 rounded text-center mt-4 py-2 text-base md:text-xl hover:bg-[#88e2bb] bg-[#6ee5b2] text-white"
              href="https://ainspiretech.com/UserDashboard"
            >
              Check Subscription
            </Link>
          </div>
        )}
      </Collapse>
    </div>
  );
}

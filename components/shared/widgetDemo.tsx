"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  CheckCircle,
  Bot,
  MessageCircle,
  Calendar,
  Settings,
} from "lucide-react";

const chatbotTypes = [
  { id: "customer-support", name: "Customer Support", color: "#00F0FF" },
  { id: "e-commerce", name: "E-Commerce", color: "#FF2E9F" },
  { id: "lead-generation", name: "Lead Generation", color: "#B026FF" },
  {
    id: "instagram-automation",
    name: "Instagram Automation",
    color: "#E4405F",
  },
];

export default function WidgetDemoPage() {
  const [selectedType, setSelectedType] = useState("customer-support");
  const [primaryColor, setPrimaryColor] = useState("#00F0FF");
  const [position, setPosition] = useState("bottom-right");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hi! How can I help you today?"
  );
  const [copied, setCopied] = useState(false);

  const generateEmbedCode = () => {
    return `<script>
  (function() {
    const chatbotConfig = {
      userId: 'user_2zSxTB9PwSs67PGtuSzFw37CpNv',
      isAuthorized:true,
      filename: 'morningside.ai.json',
      chatbotType: 'chatbot-customer-support',
      apiUrl: 'https://ainspiretech.com',
      primaryColor: '${primaryColor}',
      position: '${position}',
      welcomeMessage: '${welcomeMessage}'
    };
    
    const script = document.createElement('script');
    script.src = 'https://ainspiretech.com/chatbotembed.js';
    script.setAttribute('data-chatbot-config', JSON.stringify(chatbotConfig));
    document.head.appendChild(script);
  })();
</script>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadWidget = () => {
    // Remove existing widget if any
    const existingWidget = document.querySelector(".chatbot-widget");
    if (existingWidget) {
      existingWidget.remove();
    }

    // Remove existing script
    const existingScript = document.querySelector(
      "script[data-chatbot-config]"
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script with current config
    const script = document.createElement("script");
    script.src = "https://ainspiretech.com/chatbotembed.js";
    script.setAttribute(
      "data-chatbot-config",
      JSON.stringify({
        userId: "user_2zSxTB9PwSs67PGtuSzFw37CpNv",
        isAuthorized: true,
        filename: "morningside.ai.json",
        chatbotType: "chatbot-customer-support",
        apiUrl: "https://ainspiretech.com",
        primaryColor: "bg-gray-800/50",
        position: "bottom-right",
        welcomeMessage: "HI,welcome my name is Bot",
      })
    );
    document.head.appendChild(script);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-[#00F0FF]" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] bg-clip-text text-transparent">
                ChatBot AI - Widget Demo
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard")}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Chatbot Widget Demo
          </h1>
          <p className="text-xl text-gray-300">
            Customize and test your chatbot widget before embedding it on your
            website
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Widget Configuration
              </CardTitle>
              <CardDescription className="text-gray-400">
                Customize your chatbot widget appearance and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chatbot Type */}
              <div>
                <Label htmlFor="chatbot-type" className="text-gray-300">
                  Chatbot Type
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="mt-2 bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {chatbotTypes.map((type) => (
                      <SelectItem
                        key={type.id}
                        value={type.id}
                        className="text-white"
                      >
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Primary Color */}
              <div>
                <Label htmlFor="primary-color" className="text-gray-300">
                  Primary Color
                </Label>
                <div className="flex items-center space-x-3 mt-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10 bg-gray-800/50 border-gray-700"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <Label htmlFor="position" className="text-gray-300">
                  Position
                </Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className="mt-2 bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="bottom-right" className="text-white">
                      Bottom Right
                    </SelectItem>
                    <SelectItem value="bottom-left" className="text-white">
                      Bottom Left
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Welcome Message */}
              <div>
                <Label htmlFor="welcome-message" className="text-gray-300">
                  Welcome Message
                </Label>
                <Textarea
                  id="welcome-message"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="mt-2 bg-gray-800/50 border-gray-700 text-white"
                  rows={3}
                />
              </div>

              {/* Load Widget Button */}
              <Button
                onClick={loadWidget}
                className="w-full bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] hover:opacity-90 text-black font-semibold"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Load Widget Preview
              </Button>
            </CardContent>
          </Card>

          {/* Embed Code Panel */}
          <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                Embed Code
              </CardTitle>
              <CardDescription className="text-gray-400">
                Copy this code and paste it into your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <pre className="bg-gray-800/50 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto max-h-64">
                    <code>{generateEmbedCode()}</code>
                  </pre>
                  <Button
                    size="sm"
                    className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>

                <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">
                    Integration Features
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Automatic conversation tracking</li>
                    <li>• Appointment form after 2+ messages</li>
                    <li>• Data saved to your dashboard</li>
                    <li>• Mobile responsive design</li>
                    <li>• Customizable appearance</li>
                  </ul>
                </div>

                <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-400 mb-2">
                    How it Works
                  </h4>
                  <ol className="text-sm text-gray-300 space-y-1">
                    <li>1. Customer chats with your AI assistant</li>
                    <li>2. After 2+ messages, appointment form appears</li>
                    <li>3. Form data is saved to your database</li>
                    <li>4. View all conversations in your dashboard</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Website Section */}
        <Card className="mt-8 bg-gray-900/30 backdrop-blur-sm border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Demo Website
            </CardTitle>
            <CardDescription className="text-gray-400">
              This simulates how the widget would appear on your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-8 text-black min-h-96 relative">
              <h2 className="text-2xl font-bold mb-4">
                Welcome to Our Business
              </h2>
              <p className="text-gray-600 mb-6">
                This is a sample website where your chatbot widget would appear.
                Click the Load Widget Preview button above to see the chatbot in
                action.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">Our Services</h3>
                  <p className="text-sm text-gray-600">
                    We provide excellent services to help your business grow.
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">Contact Us</h3>
                  <p className="text-sm text-gray-600">
                    Get in touch with our team for personalized assistance.
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">Book Appointment</h3>
                  <p className="text-sm text-gray-600">
                    Schedule a consultation with our experts today.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                  The chatbot widget will appear in the{" "}
                  {position.replace("-", " ")} corner
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

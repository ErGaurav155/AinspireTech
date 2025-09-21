"use client";

import {
  CheckCircle,
  FileText,
  Globe,
  Clock,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Calendar,
} from "lucide-react";

export function AIAgentHero() {
  return (
    <section className="w-full py-20 bg-transparent text-white ">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-6">
              <div className="inline-flex items-center text-[#00F0FF] border border-[#00F0FF]/30 rounded-full px-4 py-1 mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium uppercase tracking-widest">
                  AI-POWERED SUPPORT
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                AI Agent with your
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
                  website and files
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-2xl font-montserrat">
                Build smart AI support that knows your business. Verified
                sources, instant answers, 24/7 availability.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {[
                {
                  icon: <FileText className="h-5 w-5" />,
                  text: "Train on docs, PDFs, websites",
                },
                {
                  icon: <CheckCircle className="h-5 w-5" />,
                  text: "Verified answers with citations",
                },
                {
                  icon: <Clock className="h-5 w-5" />,
                  text: "24/7 instant support",
                },
                {
                  icon: <Globe className="h-5 w-5" />,
                  text: "Omnichannel Integration",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-center font-montserrat">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full flex items-center justify-center mr-4">
                    {feature.icon}
                  </div>
                  <span className="text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] text-black font-semibold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 flex items-center">
                Start for Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
              <button className="border border-[#00F0FF] text-[#00F0FF] font-semibold py-3 px-8 rounded-full hover:bg-[#00F0FF]/10 transition-all duration-300 flex items-center">
                Book a Meeting
                <Calendar className="h-5 w-5 ml-2" />
              </button>
            </div>

            <p className="text-sm text-gray-400 font-montserrat">
              No credit card required • Setup in 3 minutes
            </p>
          </div>

          {/* Right Column - AI Chat Demo */}
          <div className="relative font-montserrat">
            {/* Chat Container */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-2xl">
              {/* Chat Header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white">Denser Agent</div>
                  <div className="text-sm text-gray-400">
                    AI-powered business assistant
                  </div>
                </div>
              </div>

              {/* User Message */}
              <div className="bg-blue-800 rounded-lg p-4 mb-4 max-w-max w-full ml-auto">
                <p className="text-white  ">
                  Can you analyze our Q3 financial report?
                </p>
              </div>

              {/* AI Response */}
              <div className="bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] border border-[#00F0FF]/30 rounded-lg p-4 mb-4">
                <p className="text-white mb-3">
                  Revenue increased by 23% YoY with strong enterprise
                  performance.
                </p>

                {/* File Attachment */}
                <div className="border border-gray-700 p-2 rounded-md">
                  <div className="flex items-center bg-[#1a1a1a] rounded-lg p-3 mb-4 ">
                    <FileText className="h-5 w-5 text-[#00F0FF] mr-2" />
                    <span className="text-sm text-gray-300">
                      Q3_Financial_Report.pdf
                    </span>
                  </div>

                  {/* Financial Summary */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-white text-lg mb-2">
                        QUARTERLY FINANCIAL SUMMARY
                      </h4>
                      <p className="text-gray-300 text-sm">
                        This report presents the financial performance for Q3
                        2024...
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">
                        Key Performance Metrics:
                      </h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Total Revenue: $12.5M (+23% YoY)</li>
                        <li>• Enterprise Growth: +45%</li>
                        <li>• Operating Margin: 18% (up from 14%)</li>
                        <li>• Customer Retention: 92%</li>
                      </ul>
                    </div>

                    {/* AI Insight */}
                    <div className="bg-gradient-to-r from-[#00F0FF]/10 to-[#B026FF]/10 rounded-lg p-3 border-l-4 border-[#00F0FF]">
                      <div className="flex items-center mb-2">
                        <Sparkles className="h-4 w-4 text-[#00F0FF] mr-2" />
                        <span className="text-sm font-bold text-[#00F0FF]">
                          AI Insight
                        </span>
                      </div>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Market share increased to 8.2%</li>
                        <li>• R&D investment: $1.8M (14% of revenue)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Outlook:</h4>
                      <p className="text-gray-300 text-sm">
                        Q4 projections show continued growth momentum...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F] rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#FF2E9F] to-[#B026FF] rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

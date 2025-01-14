"use client";
import ChatBot from "@/components/shared/ChatBot";

import React from "react";

const ChatBots = () => {
  const userId = new URLSearchParams(window.location.search).get("userId");
  const agentId = new URLSearchParams(window.location.search).get("agentId");
  if (!userId || !agentId) {
    return;
  }
  return <ChatBot userId={userId} agentId={agentId} />;
};

export default ChatBots;

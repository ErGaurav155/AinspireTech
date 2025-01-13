"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Using Next.js Router

export default function ChatBot({
  userId,
  agentId,
}: {
  userId: string;
  agentId: string;
}) {
  const [messages, setMessages] = useState([
    { sender: "AI Bot", text: "Hello! How can I help you?" },
  ]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch API key and agent details based on userId and agentId when the component mounts
    const fetchAgentData = async () => {
      const response = await fetch(
        `/api/agent?data-user-id=${userId}&data-agent-id=${agentId}`
      );
      const data = await response.json();
      if (data.apiKey) {
        // Set the API key or any necessary data
        console.log("API Key:", data.apiKey);
      }
    };

    fetchAgentData();
  }, [userId, agentId]);

  const sendMessage = async () => {
    if (!message) return;

    setMessages([...messages, { sender: "You", text: message }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, agentId, message }), // Pass the userId and agentId
      });

      const data = await response.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { sender: "AI Bot", text: data.response },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "AI Bot", text: "Error processing your request." },
      ]);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  return (
    <div className="p-4 border rounded">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender.toLowerCase()}`}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

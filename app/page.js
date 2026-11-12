"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! Welcome to GWM Jamaica. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(e) {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = input.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          citations: data.citations || [],
        },
      ]);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
      background: "#f5f5f5",
    }}>

      {/* Demo website background */}
      <div style={{
        padding: "50px",
        textAlign: "center",
      }}>
        <h1>GWM Jamaica</h1>
        <p>Explore our range of vehicles.</p>
        <p>Click the chat icon below to speak with our virtual assistant.</p>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: "100px",
          right: "25px",
          width: "460px",
          height: "500px",
          maxHeight: "calc(100vh - 130px)",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 25px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 9999,
        }}>

          {/* Header */}
          <div style={{
            background: "#c8102e",
            color: "#fff",
            padding: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <strong>GWM Jamaica Assistant</strong>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                We're here to help
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: "15px",
            overflowY: "auto",
            background: "#f8f8f8",
          }}>

            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "15px",
                  textAlign: message.role === "user" ? "right" : "left",
                }}
              >
                <div style={{
                  display: "inline-block",
                  padding: "12px",
                  borderRadius: "12px",
                  background: message.role === "user" ? "#dceeff" : "#fff",
                  border: "1px solid #ddd",
                  maxWidth: "85%",
                  whiteSpace: "pre-wrap",
                  textAlign: "left",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}>
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ fontSize: "13px", color: "#777" }}>
                GWM Assistant is typing...
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            style={{
              display: "flex",
              padding: "12px",
              borderTop: "1px solid #ddd",
              gap: "8px",
            }}
          >

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask us anything..."
              style={{
                flex: 1,
                minWidth: 0,
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#c8102e",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 15px",
                cursor: "pointer",
              }}
            >
              Send
            </button>

          </form>

        </div>
      )}

      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "#c8102e",
          color: "#fff",
          border: "none",
          fontSize: "28px",
          cursor: "pointer",
          boxShadow: "0 3px 12px rgba(0,0,0,0.25)",
          zIndex: 10000,
        }}
      >
        {isOpen ? "×" : "💬"}
      </button>

    </main>
  );
}

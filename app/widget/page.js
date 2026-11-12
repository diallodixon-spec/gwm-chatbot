"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);
  useEffect(() => {
    window.parent.postMessage(
      {
        type: "gwm-chatbot-resize",
        open: isOpen,
      },
      "*"
    );
  }, [isOpen]);

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
      background: "transparent",
    }}>


      {/* Chat window */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: "100px",
          right: "25px",
          width: "360px",
          height: "500px",
          maxWidth: "calc(100vw - 20px)",
          maxHeight: "calc(100vh - 120px)",
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
            background: "#000000",
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
                  color: "#000",
                  maxWidth: "85%",
                  whiteSpace: message.role === "user" ? "pre-wrap" : "normal",
                  textAlign: "left",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}>
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        strong: ({ children }) => (
                          <strong style={{ fontWeight: "normal" }}>{children}</strong>
                        ),

                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#000000", textDecoration: "underline" }}
                          >
                            {children}
                          </a>
                        ),

                        p: ({ children }) => (
                          <p style={{ margin: "0 0 4px 0" }}>{children}</p>
                        ),

                        ol: ({ children }) => (
                          <ol style={{ margin: "6px 0 8px 0", paddingLeft: "22px" }}>
                            {children}
                          </ol>
                        ),

                        ul: ({ children }) => (
                          <ul style={{ margin: "4px 0 8px 0", paddingLeft: "22px" }}>
                            {children}
                          </ul>
                        ),

                        li: ({ children }) => (
                          <li style={{ margin: "2px 0" }}>
                            {children}
                          </li>
                        ),
                      }}
                    >
                      {message.content.replace(/\\([*_`~])/g, "$1").replace(/\\\n/g, "\n")}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )} 
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
                color: "#000",
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#000000",
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
          background: "#000000",
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

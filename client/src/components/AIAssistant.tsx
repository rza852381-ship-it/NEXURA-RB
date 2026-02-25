import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Bot, X, Send, Loader2, MessageSquare, Minimize2, Maximize2, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";
import { nanoid } from "nanoid";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: `مرحباً بك في **NEXURA&RB** 🚀

أنا **نيكسورا**، مساعدك الذكي الشخصي! يسعدني مساعدتك في:

- 📊 **لوحة التحكم**: عرض إحصائياتك وأداء متاجرك
- 🎯 **الحملات الإعلانية**: إنشاء وإدارة حملات Meta Ads
- 🔍 **تحسين SEO**: تحليل وتحسين ظهور متجرك
- 💰 **المحاسبة الذكية**: تحليل إيراداتك ومصروفاتك
- 📱 **وسائل التواصل**: ربط متجرك بجميع المنصات

كيف يمكنني مساعدتك اليوم؟`,
  timestamp: new Date(),
};

const SUGGESTED_QUESTIONS = [
  "كيف أنشئ حملة إعلانية؟",
  "اشرح لي وحدة SEO",
  "كيف أربط متجري بإنستغرام؟",
  "ما هي مميزات المنصة؟",
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => nanoid());
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Show welcome notification after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowWelcome(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const sendMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data: { message: string }) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, timestamp: new Date() },
      ]);
      setSending(false);
    },
    onError: () => {
      setSending(false);
      toast.error("حدث خطأ في الاتصال بالمساعد");
    },
  });

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || sending) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    const history = messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    sendMutation.mutate({
      message: messageText,
      sessionId,
      history,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
          {showWelcome && (
            <div
              className="hud-box px-4 py-2 rounded-lg text-sm font-rajdhani text-foreground max-w-48 cursor-pointer animate-pulse"
              onClick={() => { setIsOpen(true); setShowWelcome(false); }}
            >
              <p className="text-[oklch(0.65_0.35_340)] font-tech text-xs">نيكسورا</p>
              <p className="text-xs mt-0.5">مرحباً! كيف يمكنني مساعدتك؟</p>
            </div>
          )}
          <button
            onClick={() => { setIsOpen(true); setShowWelcome(false); }}
            className="w-14 h-14 rounded-full flex items-center justify-center relative group"
            style={{
              background: "linear-gradient(135deg, oklch(0.65 0.35 340), oklch(0.55 0.30 290))",
              boxShadow: "0 0 20px oklch(0.65 0.35 340 / 0.5), 0 0 40px oklch(0.65 0.35 340 / 0.2)",
            }}
          >
            <Bot className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[oklch(0.70_0.28_160)] rounded-full border-2 border-background flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? "bottom-6 left-6 w-72 h-14"
              : "bottom-6 left-6 w-96 h-[600px] max-h-[90vh]"
          }`}
        >
          <div className="hud-box rounded-xl overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, oklch(0.65 0.35 340 / 0.2), oklch(0.55 0.30 290 / 0.2))",
                borderBottom: "1px solid oklch(0.65 0.35 340 / 0.2)",
              }}
              onClick={() => isMinimized && setIsMinimized(false)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.65 0.35 340), oklch(0.55 0.30 290))",
                    boxShadow: "0 0 10px oklch(0.65 0.35 340 / 0.4)",
                  }}
                >
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-cyber text-sm font-bold text-foreground">نيكسورا</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[oklch(0.70_0.28_160)] rounded-full animate-pulse" />
                    <p className="font-tech text-xs text-[oklch(0.70_0.28_160)]">متصل</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {msg.role === "assistant" && (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: "linear-gradient(135deg, oklch(0.65 0.35 340), oklch(0.55 0.30 290))",
                          }}
                        >
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm font-rajdhani leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[oklch(0.65_0.35_340/0.2)] border border-[oklch(0.65_0.35_340/0.3)] text-foreground"
                            : "bg-[oklch(0.10_0.02_240)] border border-[oklch(0.65_0.35_340/0.1)] text-foreground/90"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <Streamdown>{msg.content}</Streamdown>
                        ) : (
                          msg.content
                        )}
                        <p className="font-tech text-xs text-muted-foreground mt-1 opacity-60">
                          {msg.timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, oklch(0.65 0.35 340), oklch(0.55 0.30 290))" }}
                      >
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-[oklch(0.10_0.02_240)] border border-[oklch(0.65_0.35_340/0.1)] rounded-xl px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[oklch(0.65_0.35_340)]" />
                        <span className="font-tech text-xs text-muted-foreground">نيكسورا تكتب...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2">
                    <p className="font-tech text-xs text-muted-foreground mb-2">أسئلة مقترحة:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_QUESTIONS.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(q)}
                          className="px-3 py-1 rounded-full border border-[oklch(0.65_0.35_340/0.3)] text-xs font-rajdhani text-[oklch(0.65_0.35_340)] hover:bg-[oklch(0.65_0.35_340/0.1)] transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div
                  className="p-3 flex-shrink-0"
                  style={{ borderTop: "1px solid oklch(0.65 0.35 340 / 0.15)" }}
                >
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="اكتب رسالتك..."
                      disabled={sending}
                      className="flex-1 bg-[oklch(0.08_0.02_240)] border border-[oklch(0.65_0.35_340/0.2)] rounded-lg px-4 py-2 font-rajdhani text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.65_0.35_340/0.6)] transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || sending}
                      className="w-10 h-10 flex items-center justify-center rounded-lg disabled:opacity-50 transition-all"
                      style={{
                        background: input.trim() && !sending
                          ? "linear-gradient(135deg, oklch(0.65 0.35 340), oklch(0.55 0.30 290))"
                          : "oklch(0.15 0.03 240)",
                        boxShadow: input.trim() && !sending ? "0 0 10px oklch(0.65 0.35 340 / 0.4)" : "none",
                      }}
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

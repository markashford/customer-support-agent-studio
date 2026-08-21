"use client";

import { useEffect, useRef, useState } from "react";
import config from "@/config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import {
  HandHelping,
  WandSparkles,
  LifeBuoyIcon,
  BookOpenText,
  ChevronDown,
  Send,
  Copy,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "highlight.js/styles/atom-one-dark.css";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TypedText = ({ text = "", delay = 5 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) return;
    const timer = setTimeout(() => {
      setDisplayedText(text.substring(0, displayedText.length + 1));
    }, delay);
    return () => clearTimeout(timer);
  }, [text, displayedText, delay]);

  return <>{displayedText}</>;
};

type ThinkingContent = {
  id: string;
  content: string;
  user_mood: string;
  debug: any;
  matched_categories?: string[];
};

interface ConversationHeaderProps {
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  models: Model[];
  showAvatar: boolean;
}

const UISelector = ({
  redirectToAgent,
}: {
  redirectToAgent: { should_redirect: boolean; reason: string };
}) => {
  if (redirectToAgent.should_redirect) {
    return (
      <Button
        size="sm"
        className="mt-2 flex items-center space-x-2"
        onClick={() => {
          console.log("🔥 Human Agent Connection Requested!", redirectToAgent);
          const event = new CustomEvent("humanAgentRequested", {
            detail: {
              reason: redirectToAgent.reason || "Unknown",
              mood: "frustrated",
              timestamp: new Date().toISOString(),
            },
          });
          window.dispatchEvent(event);
        }}
      >
        <LifeBuoyIcon className="w-4 h-4" />
        <small className="text-sm leading-none">Talk to a human</small>
      </Button>
    );
  }

  return null;
};

const SuggestedQuestions = ({
  questions,
  onQuestionClick,
  isLoading,
}: {
  questions: string[];
  onQuestionClick: (question: string) => void;
  isLoading: boolean;
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2 pl-10">
      {questions.map((question, index) => (
        <Button
          key={index}
          className="text-xs h-auto py-2 px-3 rounded-full hover:scale-105 transition-transform"
          variant="outline"
          size="sm"
          onClick={() => onQuestionClick(question)}
          disabled={isLoading}
          title={question}
        >
          {question.slice(0, 40)}{question.length > 40 ? "..." : ""}
        </Button>
      ))}
    </div>
  );
};

const MessageContent = ({
  content,
  role,
}: {
  content: string;
  role: string;
}) => {
  const [thinking, setThinking] = useState(true);
  const [copied, setCopied] = useState(false);
  const [parsed, setParsed] = useState<{
    response?: string;
    thinking?: string;
    user_mood?: string;
    suggested_questions?: string[];
    redirect_to_agent?: { should_redirect: boolean; reason: string };
    debug?: {
      context_used: boolean;
    };
  }>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!content || role !== "assistant") return;

    const timer = setTimeout(() => {
      setError(true);
      setThinking(false);
    }, 30000);

    try {
      const result = JSON.parse(content);
      console.log("🔍 Parsed Result:", result);

      if (
        result.response &&
        result.response.length > 0 &&
        result.response !== "..."
      ) {
        setParsed(result);
        setThinking(false);
        clearTimeout(timer);
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      setError(true);
      setThinking(false);
    }

    return () => clearTimeout(timer);
  }, [content, role]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(parsed.response || content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (thinking && role === "assistant") {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        <span className="text-sm font-medium">AI is processing...</span>
      </div>
    );
  }

  if (error && !parsed.response) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Unable to process response</p>
          <p className="text-xs mt-1 opacity-90">Please try again or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative group">
        <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]} className="prose prose-sm dark:prose-invert max-w-none">
          {parsed.response || content}
        </ReactMarkdown>
        {role === "assistant" && (
          <button
            onClick={handleCopyToClipboard}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
      {parsed.redirect_to_agent && (
        <UISelector redirectToAgent={parsed.redirect_to_agent} />
      )}
    </div>
  );
};

// Define a type for the model
type Model = {
  id: string;
  name: string;
};

interface Message {
  id: string;
  role: string;
  content: string;
}

// Define the props interface for ConversationHeader
interface ConversationHeaderProps {
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  models: Model[];
  showAvatar: boolean;
  selectedKnowledgeBase: string;
  setSelectedKnowledgeBase: (knowledgeBaseId: string) => void;
  knowledgeBases: KnowledgeBase[];
}

type KnowledgeBase = {
  id: string;
  name: string;
};

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  selectedModel,
  setSelectedModel,
  models,
  showAvatar,
  selectedKnowledgeBase,
  setSelectedKnowledgeBase,
  knowledgeBases,
}) => (
  <div className="p-0 flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 animate-fade-in">
    <div className="flex items-center space-x-4 mb-2 sm:mb-0">
      {showAvatar && (
        <>
          <Avatar className="w-10 h-10 border">
            <AvatarImage
              src="/ant-logo.svg"
              alt="AI Assistant Avatar"
              width={40}
              height={40}
            />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium leading-none">AI Agent</h3>
            <p className="text-sm text-muted-foreground">Customer support</p>
          </div>
        </>
      )}
    </div>
    <div className="flex space-x-2 w-full sm:w-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex-grow text-muted-foreground sm:flex-grow-0"
          >
            {models.find((m) => m.id === selectedModel)?.name}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {models.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onSelect={() => setSelectedModel(model.id)}
            >
              {model.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex-grow text-muted-foreground  sm:flex-grow-0"
          >
            {knowledgeBases.find((kb) => kb.id === selectedKnowledgeBase)
              ?.name || "Select KB"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {knowledgeBases.map((kb) => (
            <DropdownMenuItem
              key={kb.id}
              onSelect={() => setSelectedKnowledgeBase(kb.id)}
            >
              {kb.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [selectedModel, setSelectedModel] = useState("claude-haiku-4-5-20251001");
  const [showAvatar, setShowAvatar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState(
    "your-knowledge-base-id",
  );

  const knowledgeBases: KnowledgeBase[] = [
    { id: "your-knowledge-base-id", name: "Your KB Name" },
    // Add more knowledge bases as needed
  ];

  const models: Model[] = [
    { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
    { id: "claude-haiku-4-5-20251001", name: "Claude 4.5 Haiku" },
    { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("🔍 Messages changed! Count:", messages.length);

    const scrollToNewestMessage = () => {
      if (messagesEndRef.current) {
        console.log("📜 Scrolling to newest message...");
        const behavior = messages.length <= 2 ? "auto" : "smooth";
        messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
      } else {
        console.log("❌ No scroll anchor found!");
      }
    };

    if (messages.length > 0) {
      setTimeout(scrollToNewestMessage, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (!config.includeLeftSidebar) {
      // If LeftSidebar is not included, we need to handle the 'updateSidebar' event differently
      const handleUpdateSidebar = (event: CustomEvent<ThinkingContent>) => {
        console.log("LeftSidebar not included. Event data:", event.detail);
        // You might want to handle this data differently when LeftSidebar is not present
      };

      window.addEventListener(
        "updateSidebar" as any,
        handleUpdateSidebar as EventListener,
      );
      return () =>
        window.removeEventListener(
          "updateSidebar" as any,
          handleUpdateSidebar as EventListener,
        );
    }
  }, []);

  useEffect(() => {
    if (!config.includeRightSidebar) {
      // If RightSidebar is not included, we need to handle the 'updateRagSources' event differently
      const handleUpdateRagSources = (event: CustomEvent) => {
        console.log("RightSidebar not included. RAG sources:", event.detail);
        // You might want to handle this data differently when RightSidebar is not present
      };

      window.addEventListener(
        "updateRagSources" as any,
        handleUpdateRagSources as EventListener,
      );
      return () =>
        window.removeEventListener(
          "updateRagSources" as any,
          handleUpdateRagSources as EventListener,
        );
    }
  }, []);

  const decodeDebugData = (response: Response) => {
    const debugData = response.headers.get("X-Debug-Data");
    if (debugData) {
      try {
        const parsed = JSON.parse(debugData);
        console.log("🔍 Server Debug:", parsed.msg, parsed.data);
      } catch (e) {
        console.error("Debug decode failed:", e);
      }
    }
  };

  const logDuration = (label: string, duration: number) => {
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement> | string,
  ) => {
    if (typeof event !== "string") {
      event.preventDefault();
    }
    if (!showHeader) setShowHeader(true);
    if (!showAvatar) setShowAvatar(true);
    setIsLoading(true);

    const clientStart = performance.now();
    console.log("🔄 Starting request: " + new Date().toISOString());

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: typeof event === "string" ? event : input,
    };

    const placeholderMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: JSON.stringify({
        response: "",
        thinking: "AI is processing...",
        user_mood: "neutral",
        debug: {
          context_used: false,
        },
      }),
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      placeholderMessage,
    ]);
    setInput("");

    const placeholderDisplayed = performance.now();
    logDuration("Perceived Latency", placeholderDisplayed - clientStart);

    try {
      console.log("➡️ Sending message to API:", userMessage.content);
      const startTime = performance.now();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel,
          knowledgeBaseId: selectedKnowledgeBase,
        }),
      });

      const responseReceived = performance.now();
      logDuration("Full Round Trip", responseReceived - startTime);
      logDuration("Network Duration", responseReceived - startTime);

      decodeDebugData(response);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const endTime = performance.now();
      logDuration("JSON Parse Duration", endTime - responseReceived);
      logDuration("Total API Duration", endTime - startTime);
      console.log("⬅️ Received response from API:", data);

      const suggestedQuestionsHeader = response.headers.get(
        "x-suggested-questions",
      );
      if (suggestedQuestionsHeader) {
        data.suggested_questions = JSON.parse(suggestedQuestionsHeader);
      }

      const ragHeader = response.headers.get("x-rag-sources");
      if (ragHeader) {
        const ragProcessed = performance.now();
        logDuration(
          "🔍 RAG Processing Duration",
          ragProcessed - responseReceived,
        );
        const sources = JSON.parse(ragHeader);
        window.dispatchEvent(
          new CustomEvent("updateRagSources", {
            detail: {
              sources,
              query: userMessage.content,
              debug: data.debug,
            },
          }),
        );
      }

      const readyToRender = performance.now();
      logDuration("Response Processing", readyToRender - responseReceived);

      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: JSON.stringify(data),
        };
        return newMessages;
      });

      const sidebarEvent = new CustomEvent("updateSidebar", {
        detail: {
          id: data.id,
          content: data.thinking?.trim(),
          user_mood: data.user_mood,
          debug: data.debug,
          matched_categories: data.matched_categories,
        },
      });
      window.dispatchEvent(sidebarEvent);

      if (data.redirect_to_agent && data.redirect_to_agent.should_redirect) {
        window.dispatchEvent(
          new CustomEvent("agentRedirectRequested", {
            detail: data.redirect_to_agent,
          }),
        );
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
      console.error("Failed to process message:", userMessage.content);
    } finally {
      setIsLoading(false);
      const clientEnd = performance.now();
      logDuration("Total Client Operation", clientEnd - clientStart);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() !== "") {
        handleSubmit(e as any);
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    setInput(textarea.value);

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
  };

  const handleSuggestedQuestionClick = (question: string) => {
    handleSubmit(question);
  };

  useEffect(() => {
    const handleToolExecution = (event: Event) => {
      const customEvent = event as CustomEvent<{
        ui: { type: string; props: any };
      }>;
      console.log("Tool execution event received:", customEvent.detail);
    };

    window.addEventListener("toolExecution", handleToolExecution);
    return () =>
      window.removeEventListener("toolExecution", handleToolExecution);
  }, []);

  return (
    <Card className="glass-card relative z-10 mb-4 ml-4 mr-4 flex flex-1 flex-col rounded-2xl">
      <CardContent className="flex-1 flex flex-col overflow-hidden pt-4 px-4 pb-0">
        <ConversationHeader
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          models={models}
          showAvatar={showAvatar}
          selectedKnowledgeBase={selectedKnowledgeBase}
          setSelectedKnowledgeBase={setSelectedKnowledgeBase}
          knowledgeBases={knowledgeBases}
        />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center animate-fade-in-up px-2 text-center">
              <Avatar className="w-10 h-10 mb-4 border">
                <AvatarImage
                  src="/ant-logo.svg"
                  alt="AI Assistant Avatar"
                  width={40}
                  height={40}
                />
              </Avatar>
              <h2 className="mb-2 text-2xl font-semibold font-display">
                Ask the agent anything
              </h2>
              <p className="mb-8 max-w-xl text-sm text-muted-foreground">
                This workspace combines a support assistant, category insights,
                and retrieval history to speed up customer-facing operations.
              </p>
              <div className="space-y-4 text-sm text-left">
                <div className="flex items-center gap-3">
                  <HandHelping className="text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Need guidance? I can walk you through process and policy
                    questions from internal context.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <WandSparkles className="text-muted-foreground" />
                  <p className="text-muted-foreground">
                    I can retrieve, summarize, and cite relevant knowledge-base
                    snippets for faster resolution.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpenText className="text-muted-foreground" />
                  <p className="text-muted-foreground">
                    As conversations evolve, I keep context so responses stay
                    consistent and actionable.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={message.id}>
                  <div
                    className={`flex items-start ${
                      message.role === "user" ? "justify-end" : ""
                    } ${
                      index === messages.length - 1 ? "animate-fade-in-up" : ""
                    }`}
                    style={{
                      animationDuration: "300ms",
                      animationFillMode: "backwards",
                    }}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="w-8 h-8 mr-2 border">
                        <AvatarImage
                          src="/ant-logo.svg"
                          alt="AI Assistant Avatar"
                        />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`p-3 rounded-md text-sm max-w-[65%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/80 border"
                      }`}
                    >
                      <MessageContent
                        content={message.content}
                        role={message.role}
                      />
                    </div>
                  </div>
                  {message.role === "assistant" && (
                    <SuggestedQuestions
                      questions={
                        JSON.parse(message.content).suggested_questions || []
                      }
                      onQuestionClick={handleSuggestedQuestionClick}
                      isLoading={isLoading}
                    />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} style={{ height: "1px" }} />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <form
          onSubmit={handleSubmit}
          className="relative flex w-full flex-col rounded-xl border bg-background/85 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        >
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or describe your issue..."
            disabled={isLoading}
            className="resize-none min-h-[44px] max-h-[200px] bg-background border-0 p-3 rounded-xl shadow-none focus-visible:ring-0 text-sm"
            rows={1}
          />
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-2">
              <Image
                src="/claude-icon.svg"
                alt="Claude Icon"
                width={0}
                height={14}
                className="w-auto h-[14px]"
              />
              <span className="text-xs text-muted-foreground select-none">
                {input.length} characters
              </span>
            </div>
            <Button
              type="submit"
              disabled={isLoading || input.trim() === ""}
              className="gap-2 transition-all"
              size="sm"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  <span className="hidden sm:inline">Processing...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}

export default ChatArea;

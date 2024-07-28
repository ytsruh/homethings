import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/PageTitle";
import PageHeader from "@/components/PageHeader";
import { getToken } from "@/lib/utils";

type Message = {
  role: string;
  content: string;
};

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.FormEvent<EventTarget>) => {
    const target = e.target as HTMLInputElement;
    setInput(target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    setLoading(true);
    setInput("");
    // Add the user input and an empty system message in one state update
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", content: input },
      { role: "system", content: "" }, // Placeholder for stream content
    ]);
    const systemMessageIndex = messages.length + 1; // +1 to account for the new user message

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: getToken() },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: input }] }),
      });

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const readStream = async () => {
          let reading = true;
          while (reading) {
            const { done, value } = await reader.read();
            if (done) {
              reading = false;
              break;
            }
            const newText = decoder.decode(value, { stream: true });

            // Update the existing system message with new content
            setMessages((currentMessages) => {
              const updatedMessages = [...currentMessages];
              const existingMessage = updatedMessages[systemMessageIndex];
              updatedMessages[systemMessageIndex] = {
                ...existingMessage,
                content: existingMessage.content + newText,
              };
              return updatedMessages;
            });
          }
        };

        await readStream();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
  };

  useEffect(() => {
    // Autoscroll to the bottom of the chat as new messages are added
    const chat = document.getElementById("chat");
    if (chat) {
      chat.scrollTop = chat.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="max-h-full">
      <PageTitle title="Chat | Homethings" />
      <PageHeader title="Chat" subtitle="AI powered chatbot" />
      <div className="flex flex-col h-[calc(100vh-210px)]">
        <div id="chat" className="overflow-auto flex-grow p-4">
          {messages.map((m, index) => {
            const codeRegex = /```([\s\S]*?)```/;
            const match = m.content.match(codeRegex);

            if (match) {
              // Split message content from code
              const beforeCode = m.content.substring(0, match.index);
              const codeContent = match[1]; // The actual code without backticks
              const afterCode = m.content.substring((match?.index ?? 0) + (match?.[0]?.length ?? 0));

              return (
                <div key={index} className="whitespace-pre-wrap py-1">
                  <span className="text-accent">{m.role === "user" ? "User: " : "AI: "}</span>
                  {beforeCode}
                  <div className="p-1 bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white">
                    <pre>
                      <code>{codeContent}</code>
                    </pre>
                  </div>
                  {afterCode}
                </div>
              );
            } else {
              // Render as normal if no code is detected
              return (
                <div key={index} className="whitespace-pre-wrap py-1">
                  <span className="text-accent">{m.role === "user" ? "User: " : "AI: "}</span>
                  {m.content}
                </div>
              );
            }
          })}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex space-y-2 md:space-x-5 md:space-y-0 flex-col md:flex-row">
          <Input
            type="text"
            value={input}
            placeholder="Chat to your assistant"
            onChange={handleInputChange}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Submit"}
          </Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Clear
          </Button>
        </form>
      </div>
    </div>
  );
}

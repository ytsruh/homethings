import { useState } from "react";
import type { Route } from "./+types/chat";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { SiGooglegemini, SiOpenai } from "react-icons/si";
import { Bot } from "lucide-react";
import { toast } from "~/components/Toaster";
import useWindowSize from "~/hooks/use-windowsize";
import { pb } from "~/lib/utils";
import { Remark } from "react-remark";
import PageHeader from "~/components/PageHeader";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function meta({}: Route.MetaArgs) {
  return [{ title: "Chat" }, { name: "description", content: "Welcome to Homethings" }];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    const user = pb.authStore.record;
    if (!user) {
      pb.authStore.clear();
      return redirect("/login");
    }
    const keys = await pb.send("/api/keys", {});
    return { keys };
  } catch (error) {
    console.error(error);
    return { keys: null };
  }
}

export default function Chat({ loaderData }: Route.ComponentProps) {
  const { keys } = loaderData as { keys: any };
  const { width } = useWindowSize();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [chatModel, setChatModel] = useState("openai/gpt-4o-mini");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatModel) {
      toast({
        title: "Error",
        description: "Please enter a message",
        type: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_WEBILITI_BASE_URL}/system/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Webiliti-System-Key": keys.webiliti },
        body: JSON.stringify({ model: chatModel, messages: [...messages, userMessage] }),
      });
      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");
      let fullMessage = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        fullMessage += text;
        setStreamingMessage(fullMessage);
      }
      // Add assistant's message to the chat
      setMessages((prev) => [...prev, { role: "assistant", content: fullMessage }]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!keys) {
    toast({
      title: "Error",
      description: "Failed to start chat service",
      type: "destructive",
    });
    return null;
  }

  return (
    <>
      <PageHeader title="Chat" subtitle="Your personal AI assistant" />
      <div className="max-w-full mx-auto p-4 flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-13rem)]">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {[
            ...messages,
            ...(isLoading && streamingMessage
              ? [{ role: "assistant" as const, content: streamingMessage }]
              : []),
          ].map((message, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-theme/90 dark:bg-theme/50 text-zinc-50 ml-auto max-w-[80%]"
                  : "bg-zinc-100 dark:bg-zinc-800 mr-auto max-w-[80%]"
              }`}>
              <Remark
                rehypeReactOptions={{
                  components: {
                    code: (props: object) => (
                      <code
                        className="bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100 p-1 m-1 rounded"
                        {...props}
                      />
                    ),
                    pre: (props: object) => (
                      <pre
                        className="bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100 p-2 m-1 rounded-lg"
                        {...props}
                      />
                    ),
                  },
                }}>
                {message.content}
              </Remark>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="w-full">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-initial">
                  <Bot className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full my-2" align={width < 640 ? "start" : "end"}>
                <div className="w-full pb-2">
                  <h4 className="font-medium leading-none">Model</h4>
                  <p className="text-sm text-muted-foreground">Set the model for the chat.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {modelList.map((model) => (
                    <ModelCard
                      key={model.value}
                      model={model}
                      onClick={() => setChatModel(model.value)}
                      selected={model.value === chatModel}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-initial">
              {isLoading ? "Sending..." : "Send"}
            </Button>
            <Button variant="outline" asChild>
              <div onClick={() => setMessages([])} className="flex-1 sm:flex-initial cursor-pointer">
                Clear
              </div>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

const modelList = [
  { name: "GPT", variant: "4o-mini", value: "openai/gpt-4o-mini", icon: SiOpenai },
  { name: "GPT", variant: "4o", value: "openai/gpt-4o", icon: SiOpenai },
  {
    name: "Gemini",
    variant: "2.0-flash-lite",
    value: "google/gemini-2.0-flash-lite-001",
    icon: SiGooglegemini,
  },
  { name: "Gemini", variant: "2.0-flash", value: "google/gemini-2.0-flash-001", icon: SiGooglegemini },
];

type Model = {
  name: string;
  variant: string;
  value: string;
  icon: React.ComponentType;
};

function ModelCard({ model, onClick, selected }: { model: Model; onClick: () => void; selected: boolean }) {
  const Icon = model.icon;
  return (
    <Card
      className={`w-full flex flex-col items-center justify-between cursor-pointer ${
        selected ? "border-zinc-900 dark:border-zinc-50" : ""
      }`}
      onClick={onClick}>
      <CardHeader className="flex items-center justify-center">
        <div className="text-4xl">
          <Icon />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <p className="py-1">{model.name}</p>
        <p className="py-1 text-sm text-muted-foreground">{model.variant}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-center"></CardFooter>
    </Card>
  );
}
function redirect(arg0: string) {
  throw new Error("Function not implemented.");
}

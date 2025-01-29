<script lang="ts">
  import { Button } from "@/lib/components/ui/button";
  import { Input } from "@/lib/components/ui/input";
  import PageHeader from "@/lib/components/PageHeader.svelte";
  import { toast } from "svelte-sonner";
  let loading = $state(false);
  let input = $state("");
  let messages: Message[] = $state([]);
  type Message = {
    role: "user" | "assistant";
    content: string;
    type?: "code" | "text";
  };

  import * as Select from "$lib/components/ui/select/index.js";

  const models = [
    { value: "default", label: "ChatGPT 4" },
    { value: "svelte", label: "Svelte" },
  ];

  let selectedModel = $state(models[0].value || "");

  // Function to detect code in the streamed content
  function detectCodeBlock(text: string) {
    // Check for code block markers
    const hasCodeBlock = text.includes("```");
    const hasInlineCode = text.includes("`");

    if (hasCodeBlock) {
      // Extract content between ``` markers
      const codeBlockRegex = /```[\s\S]*?```/g;
      const matches = text.match(codeBlockRegex);
      if (matches) {
        return true;
      }
    }
    // Check for common code patterns if no explicit code blocks
    const codePatterns = [
      /{[\s\S]*?}/, // Curly braces blocks
      /function\s+\w+\s*\(/, // Function declarations
      /const|let|var\s+\w+\s*=/, // Variable declarations
      /<[\s\S]*?>/, // HTML tags
      /\b(if|for|while|switch|return)\b/, // Common programming keywords
    ];

    return codePatterns.some((pattern) => pattern.test(text));
  }

  // Function to extract and format code blocks
  function formatMessageWithCode(text: string) {
    // If no code blocks, return the text as is
    if (!text.includes("```")) {
      return text;
    }
    // Split the text into code and non-code parts
    const parts = text.split(/(```[\s\S]*?```)/);
    return parts
      .map((part) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // This is a code block - wrap in pre/code tags
          return `<pre class="bg-zinc-800 p-2 rounded-lg my-2"><code>${part.slice(3, -3)}</code></pre>`;
        }
        // This is regular text - return as is
        return part;
      })
      .join("");
  }

  async function handleCancel() {
    input = "";
    messages = [];
    loading = false;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (input.trim() === "") {
      toast.error("Please enter a message to start using chat");
      return;
    }
    loading = true;
    messages = [...messages, { role: "user", content: input }];
    const userInput = input;
    input = "";
    let endpoint = "/api/chat";
    if (selectedModel === "svelte") {
      endpoint = "/api/chat/svelte";
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages
            .slice(0, -1)
            .concat({ role: "user", content: userInput }),
        }),
      });

      if (!response.ok) throw new Error("Stream response was not ok");

      // Add assistant message that we'll stream into
      messages = [...messages, { role: "assistant", content: "" }];

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let currentMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Decode the stream chunk and append to current message
        const chunk = decoder.decode(value);
        currentMessage += chunk;
        // Detect if the current accumulated message contains code
        const containsCode = detectCodeBlock(currentMessage);
        // Update the last message (assistant's message) with accumulated content
        messages = messages.map((msg, index) => {
          if (index === messages.length - 1) {
            return {
              ...msg,
              content: currentMessage,
              type: containsCode ? "code" : "text",
            };
          }
          return msg;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Chat | Homethings</title>
  <meta name="description" content="Your AI powered chatbot" />
</svelte:head>

<div class="max-h-full">
  <PageHeader title="Chat" subtitle="Your AI powered chatbot" />
  <div class="flex flex-col h-[calc(100vh-135px)] sm:h-[calc(100vh-230px)]">
    {#if messages.length > 0}
      <div
        class="overflow-auto flex-grow p-4 my-2 border border-zinc-700 rounded-lg"
      >
        {#each messages as message}
          <div class="whitespace-pre-wrap py-1">
            <span class="text-theme"
              >{message.role === "user" ? "User: " : "AI: "}</span
            >
            {@html formatMessageWithCode(message.content)}
          </div>
        {/each}
      </div>
    {:else}
      <div
        class="flex w-full h-full items-center justify-center p-4 my-2 border border-zinc-700 rounded-lg"
      >
        <h2>Your chat will appear here</h2>
      </div>
    {/if}
    <form
      onsubmit={handleSubmit}
      class="flex space-y-2 sm:space-x-2 sm:space-y-0 flex-col sm:flex-row gap-y-1"
    >
      <Select.Root type="single" name="chatModel" bind:value={selectedModel}>
        <Select.Trigger class="w-full sm:w-48 order-last sm:order-first">
          {models.find((model) => model.value === selectedModel)?.label}
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            {#each models as model}
              <Select.Item value={model.value} label={model.value}>
                {model.label}
              </Select.Item>
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <Input
        type="text"
        bind:value={input}
        placeholder="Chat to your assistant"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Submit"}
      </Button>
      <Button onclick={handleCancel} type="button" variant="secondary"
        >Clear</Button
      >
    </form>
  </div>
</div>

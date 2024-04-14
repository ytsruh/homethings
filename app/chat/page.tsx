"use client";

import { useChat } from "ai/react";
import { useState } from "react";
import PageFrame from "@/components/PageFrame";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const [chatId, setChatId] = useState<number | undefined>(undefined);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    id: chatId?.toString(),
  });

  const handleReset = () => {
    setChatId((chatId) => (chatId ?? 0) + 1);
  };
  return (
    <PageFrame title="Chat">
      <div className="flex flex-col h-full max-h-[calc(100vh-150px)]">
        <div id="chat" className="overflow-auto flex-grow p-4">
          {messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap py-1">
              <span className="text-accent">{m.role === "user" ? "User: " : "AI: "}</span>
              {m.content}
            </div>
          ))}
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
          <Button type="submit">Submit</Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Clear
          </Button>
        </form>
      </div>
    </PageFrame>
  );
}

var content = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi finibus felis nunc, id lacinia sapien consectetur at. Quisque sed lacus vel lacus blandit suscipit vitae in arcu. Pellentesque sed enim lacinia, vestibulum est sed, euismod dui. Quisque interdum pulvinar tortor, vitae posuere mauris aliquet volutpat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Praesent sit amet sagittis ipsum. Etiam volutpat ornare augue, eu porta mi iaculis quis. Donec id urna leo. Etiam volutpat, sapien eget elementum scelerisque, leo lectus elementum metus, vulputate tempus sem mauris vitae erat. Quisque in euismod nulla. Vestibulum justo leo, rutrum quis purus vel, aliquet lacinia sem. Vivamus metus ligula, aliquet laoreet finibus sed, imperdiet sit amet ligula.

Nullam at eros purus. Vestibulum pretium mi et placerat tempor. Maecenas nec nisi vitae neque facilisis facilisis. Integer nec feugiat quam, vitae posuere ex. Proin sed maximus arcu, ut rhoncus orci. Quisque sed quam libero. Integer tortor mauris, consectetur eget bibendum in, iaculis ut purus. Phasellus ac maximus ante. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Duis et tristique felis, ut elementum mi. Suspendisse potenti. Cras porttitor sem neque, vitae tempor diam aliquet tempus.

Etiam ac maximus sem. Mauris nunc tellus, aliquet vitae elit cursus, vulputate faucibus ante. Duis ultrices, ante nec faucibus fermentum, dui ipsum mattis enim, eu molestie purus massa eu risus. In et vehicula nibh. Proin et leo laoreet, vehicula enim et, mattis est. Sed metus sapien, venenatis et efficitur quis, dictum non dolor. Nunc rhoncus tincidunt ex id consectetur. Nunc porttitor arcu sed porta accumsan. Nunc quis dapibus mi. Vestibulum at ante sit amet libero sagittis rutrum. Nulla non lorem in erat varius porta feugiat in eros. Etiam porta a dui vel maximus. Aliquam dapibus augue non mi dignissim porttitor. Pellentesque vitae aliquet magna. Etiam convallis quis lectus ut tempor.

Nam dui odio, faucibus convallis lacinia vel, vulputate a lorem. Donec in tortor facilisis mauris lobortis placerat efficitur a massa. Suspendisse potenti. Cras a turpis quis justo eleifend venenatis eu quis felis. Aenean urna ipsum, pharetra ut felis nec, suscipit porta felis. Donec et elit scelerisque nunc mattis ultrices interdum porta est. Integer diam lorem, porta vel ultricies a, tincidunt at eros. Integer porttitor, mi eu euismod iaculis, elit felis eleifend felis, nec luctus augue turpis id sem. Integer congue elit ut nulla ultrices eleifend. Phasellus fringilla leo at eros cursus, id mollis augue laoreet.`;

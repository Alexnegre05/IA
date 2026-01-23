import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  speaker: "openai" | "llama";
  content: string;
};

export function ChatBubble({ speaker, content }: Props) {
  const isOpenAI = speaker === "openai";

  return (
    <div className={cn("flex gap-3 mb-4", isOpenAI ? "justify-end" : "justify-start")}>
      <Avatar className="h-10 w-10 border">
        <AvatarFallback className={cn("text-lg", isOpenAI ? "bg-blue-200" : "bg-purple-200")}>
          {isOpenAI ? "🤖" : "🦙"}
        </AvatarFallback>
      </Avatar>

      <Card className={cn("max-w-[80%] p-4 shadow-sm", isOpenAI ? "bg-blue-600 text-white" : "bg-gray-200 text-black")}>
        <div className="mb-1 text-xs font-bold text-gray-700">
          {isOpenAI ? "OpenAI" : "LLaMA"}
        </div>
        <p className="text-sm">{content}</p>
      </Card>
    </div>
  );
}
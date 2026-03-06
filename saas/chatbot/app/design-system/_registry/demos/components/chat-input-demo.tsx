import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Paperclip, Send } from "lucide-react";

export default function ChatInputDemo() {
  return (
    <div className="max-w-lg">
      <div className="rounded-xl border bg-card p-2">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 px-2">
              <Select>
                <SelectTrigger className="h-6 w-auto gap-1 border-0 bg-muted px-2 text-[10px] font-mono">
                  <SelectValue placeholder="claude-4-sonnet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sonnet">claude-4-sonnet</SelectItem>
                  <SelectItem value="opus">claude-4-opus</SelectItem>
                  <SelectItem value="haiku">claude-4-haiku</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="px-2 pb-1">
              <p className="text-sm text-muted-foreground">Ask about markets, positions, or strategies...</p>
            </div>
          </div>
          <div className="flex items-center gap-1 pb-1 pr-1">
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
              <Paperclip className="size-4" />
            </Button>
            <Button size="icon-sm" className="bg-brand text-brand-foreground hover:bg-brand-hover">
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

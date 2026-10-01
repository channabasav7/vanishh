import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getClient } from "@/services/tempchat-client";
import { useApp } from "@/store/app-store";

export function NewChatDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { addConversation } = useApp();
  const navigate = useNavigate();

  const start = async () => {
    const handle = name.trim().replace(/^@/, "");
    if (!handle) return;
    setBusy(true);
    const c = await getClient().openConversationWith(handle);
    addConversation(c);
    setBusy(false);
    setOpen(false);
    void navigate({ to: "/chat/$id", params: { id: c.id } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">Start a temporary chat</DialogTitle>
          <DialogDescription>Enter their TempChat username.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); void start(); }} className="flex gap-2">
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="@username" className="h-11 rounded-xl" aria-label="Username" />
          <Button type="submit" className="h-11 rounded-xl" disabled={busy || !name.trim()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : "Start"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

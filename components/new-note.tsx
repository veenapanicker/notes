"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Icons } from "./icons";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/utils/supabase/client";
import SessionId from "./session-id";

export default function NewNote() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const noteId = uuidv4();
  const note = {
    id: noteId,
    title: "new note",
    slug: `new-note-${noteId}`,
    content: "",
    public: false,
    created_at: new Date().toISOString(),
    session_id: sessionId,
    category: "today",
    emoji: "👋🏼",
  };

  async function createNote() {
    await supabase.from("notes").insert(note);
    router.push(`/${note.slug}`);
    router.refresh();
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && event.metaKey) {
        createNote();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  return (
    <>
      <SessionId setSessionId={setSessionId} />
      <TooltipProvider>
        <Tooltip>
        <TooltipTrigger onClick={createNote}>
          <Icons.new />
        </TooltipTrigger>
        <TooltipContent className="bg-[#1e1e1e] text-muted-foreground border-none">
          Click or press ⌘+/ to create a new note
        </TooltipContent>
      </Tooltip>
      </TooltipProvider>
    </>
  );
}

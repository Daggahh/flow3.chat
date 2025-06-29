import { cookies } from "next/headers";

import { Chat } from "@/components/chat";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { auth } from "../(auth)/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  let initialChatModel = undefined;
  if (modelIdFromCookie) {
    initialChatModel = modelIdFromCookie.value;
  } else if (typeof window !== "undefined") {
    // SSR-safe: fallback to localStorage if available
    try {
      const stored = window.localStorage.getItem("selectedModelId");
      if (stored) initialChatModel = stored;
    } catch {}
  }
  if (!initialChatModel) initialChatModel = DEFAULT_CHAT_MODEL;

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={initialChatModel}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}

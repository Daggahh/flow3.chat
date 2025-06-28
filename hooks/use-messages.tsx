import { useState, useEffect, useCallback } from "react";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import type { UseChatHelpers } from "@ai-sdk/react";

export function useMessages({
  chatId,
  status,
}: {
  chatId: string;
  status: UseChatHelpers["status"];
}) {
  const {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  } = useScrollToBottom();

  const [hasSentMessage, setHasSentMessage] = useState(false);

  // Stable scroll function
  const scrollToLastMessage = useCallback(() => {
    setTimeout(() => {
      const messages = document.querySelectorAll('[data-role="user"]');
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, []);

  // Reset when chat changes
  useEffect(() => {
    if (chatId) {
      setHasSentMessage(false);
    }
  }, [chatId]);

  // Handle message submission
  useEffect(() => {
    if (status === "submitted") {
      setHasSentMessage(true);
      scrollToLastMessage();
    }
  }, [status, scrollToLastMessage]);

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  };
}

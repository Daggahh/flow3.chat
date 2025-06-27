import type { UIMessage } from "ai";
import { PreviewMessage, ThinkingMessage } from "./message";
import { Greeting } from "./greeting";
import { memo } from "react";
import type { Vote } from "@/lib/db/schema";
import equal from "fast-deep-equal";
import type { UseChatHelpers } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { useMessages } from "@/hooks/use-messages";
import { SuggestedActions } from "./suggested-actions";
import { AnimatePresence } from "framer-motion";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers["status"];
  votes: Array<Vote> | undefined;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  append: any;
  selectedVisibilityType: any;
  initialChatModel: string;
}

function ChatWelcomeOrSuggested({
  chatId,
  append,
  selectedVisibilityType,
}: {
  chatId: string;
  append: any;
  selectedVisibilityType: any;
}) {
  return (
    <div className="w-full flex items-center justify-center min-h-[60vh] px-2 sm:px-4 md:px-6">
      <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col gap-4">
        <Greeting />
        <SuggestedActions
          append={append}
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
        />
      </div>
    </div>
  );
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  isArtifactVisible,
  append,
  selectedVisibilityType,
  initialChatModel,
}: MessagesProps) {
  const { hasSentMessage, onViewportEnter, onViewportLeave } = useMessages({
    chatId,
    status,
  });

  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    isScrollable,
    scrollToBottom,
  } = useScrollToBottom();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 relative custom-scrollbar"
    >
      {messages.length === 0 ? (
        <ChatWelcomeOrSuggested
          chatId={chatId}
          append={append}
          selectedVisibilityType={selectedVisibilityType}
        />
      ) : null}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === "streaming" && messages.length - 1 === index}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
          initialChatModel={initialChatModel}
        />
      ))}

      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <ThinkingMessage initialChatModel={initialChatModel} />
        )}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});

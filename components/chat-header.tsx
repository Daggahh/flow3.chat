"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWindowSize } from "usehooks-ts";
import { useEffect } from "react";

import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { PlusIcon, VercelIcon } from "./icons";
import { useSidebar } from "./ui/sidebar";
import { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { type VisibilityType, VisibilitySelector } from "./visibility-selector";
import type { Session } from "next-auth";
import { Star, Key } from "lucide-react";
import { GitHubStars } from "./github-stars";
import { SearchThreadsModal } from "./search-threads-modal";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { useProviderIcon } from "@/hooks/use-provider-icon";
import { SearchIcon } from "./icons";
import { useState } from "react";
import { BYOKModal } from "./BYOKModal";

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const [showBYOKModal, setShowBYOKModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  useHotkeys([
    [
      "mod+shift+k",
      (e) => {
        e.preventDefault();
        setShowBYOKModal(true);
      },
    ],
  ]);
  useEffect(() => {
    if (open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowSearchModal(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);
  const providerIcon = useProviderIcon("openai"); // Default, can be dynamic later

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />
      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0 transition-transform hover:scale-105 focus:scale-105"
              onClick={() => {
                router.push("/");
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}
      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-3 px-2 md:h-fit transition-transform hover:scale-105 focus:scale-105"
              onClick={() => setShowSearchModal(true)}
            >
              <SearchIcon className="w-4 h-4" />
              <span className="md:sr-only">Search Threads</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search Threads (Ctrl+K)</TooltipContent>
        </Tooltip>
      )}
      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-4"
        />
      )}
      <Button
        variant="ghost"
        onClick={() =>
          window.open("https://github.com/Daggahh/flow3.chat", "_blank")
        }
        className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 hidden md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto"
      >
        <Star className="w-4 h-4 dark:text-zinc-900" />
        <GitHubStars />
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="order-5 px-2 md:h-fit ml-2 flex items-center gap-1 transition-transform hover:scale-105 focus:scale-105"
            onClick={() => setShowBYOKModal(true)}
          >
            <Key className="w-4 h-4" />
            <span className="hidden md:inline">Add API Key</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add or update your API keys (BYOK)</TooltipContent>
      </Tooltip>
      {showBYOKModal && (
        <BYOKModal
          isOpen={showBYOKModal}
          onClose={() => setShowBYOKModal(false)}
        />
      )}
      {showSearchModal && (
        <SearchThreadsModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          chats={[]}
        />
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});

"use client";

import type { User } from "next-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { PlusIcon, SearchIcon } from "@/components/icons";
import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { useHotkeys } from "@/hooks/use-hotkeys";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { SearchThreadsModal } from "./search-threads-modal";
import { ApiKeySettings } from "./ApiKeySettings";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, open } = useSidebar();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);
  // Keyboard shortcuts
  useHotkeys([
    [
      "mod+p",
      (e) => {
        e.preventDefault();
        setOpenMobile(false);
        router.push("/");
        router.refresh();
      },
    ],
  ]);
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowSearchModal(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Close search modal with Escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowSearchModal(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {" "}
      <Sidebar className="group-data-[side=left]:border-r-0">
        <SidebarHeader className="border-b border-border/50">
          <SidebarMenu>
            <div className="flex flex-col items-center gap-4 pb-0">
              <Link
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                }}
                className="text-center"
              >
                <motion.span
                  className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Flow3.chat
                </motion.span>
              </Link>

              <div className="flex flex-col w-full gap-2 px-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-between group relative overflow-hidden rounded-3xl"
                        onClick={() => {
                          setOpenMobile(false);
                          router.push("/");
                          router.refresh();
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -z-10 opacity-0 group-hover:opacity-100"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                        />
                        <span className="flex items-center gap-2">
                          <PlusIcon className="animate-in fade-in spin-in-180" />
                          New Chat
                        </span>
                        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 group-hover:flex">
                          Ctrl<span className="text-xs">⌘</span>+P
                        </kbd>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  {/* <TooltipContent>New Chat (Ctrl+P)</TooltipContent> */}
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-between group relative overflow-hidden rounded-3xl"
                        onClick={() => setShowSearchModal(true)}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -z-10 opacity-0 group-hover:opacity-100"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                        />
                        <span className="flex items-center gap-2">
                          <SearchIcon className="w-4 h-4 animate-in fade-in zoom-in" />
                          Search Chats
                        </span>
                        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 group-hover:flex">
                          Ctrl<span className="text-xs">⌘</span>+K
                        </kbd>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  {/* <TooltipContent>Search Threads (Ctrl+K)</TooltipContent> */}
                </Tooltip>
              </div>
            </div>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarHistory user={user} />
        </SidebarContent>
        <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
      </Sidebar>
      {showApiKeySettings && (
        <ApiKeySettings
          isOpen={showApiKeySettings}
          onClose={() => setShowApiKeySettings(false)}
        />
      )}
      <SearchThreadsModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        chats={[]} // We'll need to pass the chats from SidebarHistory
      />
    </>
  );
}

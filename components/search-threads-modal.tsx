"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/icons";
import type { Chat } from "@/lib/db/schema";
import { groupChatsByDate } from "./sidebar-history";
import { ChatItem } from "./sidebar-history-item";

interface SearchThreadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
}

export function SearchThreadsModal({
  isOpen,
  onClose,
  chats,
}: SearchThreadsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter chats based on search query
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered chats by date
  const groupedChats = groupChatsByDate(filteredChats);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <DialogTitle>Search Chat History</DialogTitle>
            <button
              className="ml-4 px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              onClick={onClose}
              aria-label="Close (Esc)"
              type="button"
            >
              Esc
            </button>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your chat threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted/20 rounded-md animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {Object.entries(groupedChats).map(([period, chats]) =>
                  chats.length > 0 ? (
                    <div key={period}>
                      <div className="text-xs text-muted-foreground mb-2">
                        {period}
                      </div>
                      <div className="space-y-1">
                        {chats.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={false}
                            onDelete={() => {}}
                            setOpenMobile={() => {}}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null
                )}

                {filteredChats.length === 0 && searchQuery && (
                  <div className="text-center text-muted-foreground py-8">
                    No chat threads found matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

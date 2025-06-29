"use client";

import type { Attachment, UIMessage } from "ai";
import cx from "classnames";
import type React from "react";
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
  useMemo,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import equal from "fast-deep-equal";
import type { UseChatHelpers } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import type { VisibilityType } from "./visibility-selector";
import { Search as SearchIcon, GlobeIcon } from "lucide-react";
import { useProviderIcon } from "@/hooks/use-provider-icon";
import {
  ModelSelectorQuickPick,
  ModelSelectorFullCatalog,
} from "./model-selector";
import type { Session } from "next-auth";
import { chatModels, ChatModel } from "@/lib/ai/models";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { db } from "@/lib/db/local";
import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { FiChevronDown } from "react-icons/fi";
import { useSelectedModel } from "@/hooks/use-selected-model";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  selectedVisibilityType,
  session,
}: {
  chatId: string;
  input: UseChatHelpers["input"];
  setInput: UseChatHelpers["setInput"];
  status: UseChatHelpers["status"];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];
  append: UseChatHelpers["append"];
  handleSubmit: UseChatHelpers["handleSubmit"];
  className?: string;
  selectedVisibilityType: VisibilityType;
  session: Session;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const { isAtBottom, scrollToBottom } = useScrollToBottom();
  const inputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${
        textareaRef.current.scrollHeight + 2
      }px`;
    }
  }, []);

  const resetHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = "98px";
    }
  }, []);

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    ""
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || "";
      if (finalValue !== input) {
        setInput(finalValue);
      }
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (event.target.value !== input) {
        setInput(event.target.value);
      }
      adjustHeight();
    },
    [input, setInput, adjustHeight]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
  const [useWebSearch, setUseWebSearch] = useLocalStorage(
    "useWebSearch",
    false
  );
  const { selectedModelId, setSelectedModelId } = useSelectedModel();
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [search, setSearch] = useState("");
  const [filterList, setFilterList] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<ChatModel[]>([]);

  // Get available models for the user
  const userType = session && session.user ? session.user.type : "regular";
  const availableChatModelIds = useMemo(
    () => entitlementsByUserType[userType].availableModels,
    [userType]
  );
  const availableChatModels = useMemo(
    () =>
      chatModels.filter((chatModel) =>
        availableChatModelIds.includes(chatModel.id)
      ),
    [availableChatModelIds]
  );

  // Load favourites from IndexedDB - only when availableChatModels changes
  useEffect(() => {
    const loadFavourites = async () => {
      const favs = await db.model_favourites.toArray();
      setFavourites(
        favs
          .map((f) => availableChatModels.find((m) => m.id === f.modelId))
          .filter((m): m is ChatModel => Boolean(m))
      );
    };
    loadFavourites();
  }, [availableChatModels]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, "", `/chat/${chatId}`);

    handleSubmit(undefined, {
      experimental_attachments: attachments,
      data: { useWebSearch, selectedChatModel: selectedModelId } as any,
    });

    setAttachments([]);
    setLocalStorageInput("");
    resetHeight();
    // Don't reset web search state - let user keep it enabled if they want
    // setUseWebSearch(false);

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    useWebSearch,
    selectedModelId,
    resetHeight,
  ]);

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error("Failed to upload file, please try again!");
    }
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error("Error uploading files!", error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments, uploadFile]
  );

  const handleWebSearch = useCallback(() => {
    if (!input.trim()) return;
    const newWebSearchState = !useWebSearch;
    setUseWebSearch(newWebSearchState);
  }, [input, useWebSearch]);

  const handlePin = useCallback(
    async (id: string) => {
      if (favourites.length >= 10) {
        toast.error("You can only pin up to 10 models.");
        return;
      }
      const model = availableChatModels.find((m) => m.id === id);
      if (!model) return;
      await db.model_favourites.add({
        id: `${id}-fav`,
        modelId: id,
        createdAt: new Date(),
        synced: false,
      });
      setFavourites((favs) => [...favs, model]);
    },
    [favourites.length, availableChatModels]
  );

  const handleUnpin = useCallback(async (id: string) => {
    await db.model_favourites.where("modelId").equals(id).delete();
    setFavourites((favs) => favs.filter((f) => f.id !== id));
  }, []);

  useEffect(() => {
    if (status === "submitted") {
      // Don't auto-scroll when message is submitted - let user see their message
      // scrollToBottom();
    }
  }, [status, scrollToBottom]);

  // Memoize the selected model info
  const selectedModelInfo = useMemo(() => {
    return availableChatModels.find((m) => m.id === selectedModelId);
  }, [availableChatModels, selectedModelId]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "absolute",
              transform: "translateX(-50%)",
              bottom: inputContainerRef.current
                ? `${inputContainerRef.current.offsetHeight + 16}px`
                : "112px",
              zIndex: 50,
            }}
            className="left-[47%] md:left-[47%]"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row gap-2 overflow-x-scroll items-end"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: "",
                name: filename,
                contentType: "",
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <div
        ref={inputContainerRef}
        className="flex flex-col w-full bg-muted rounded-2xl p-2 pb-2"
        style={{ minHeight: "96px", maxHeight: "22rem" }}
      >
        <Textarea
          data-testid="multimodal-input"
          ref={textareaRef}
          placeholder="Send a message..."
          value={input}
          onChange={handleInput}
          className={cx(
            "min-h-[48px] max-h-72 overflow-auto resize-none rounded-xl !text-base bg-muted dark:border-zinc-700 custom-scrollbar",
            className
          )}
          rows={3}
          autoFocus
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();

              if (status !== "ready") {
                toast.error(
                  "Please wait for the model to finish its response!"
                );
              } else {
                submitForm();
              }
            }
          }}
        />
        <div className="flex flex-row justify-between items-end mt-2">
          <div className="flex flex-row gap-2">
            <DropdownMenu
              open={showModelSelector}
              onOpenChange={setShowModelSelector}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  data-testid="model-selector-inline"
                  className="rounded-md p-[7px] h-fit flex items-center gap-2"
                  variant="outline"
                >
                  {useProviderIcon(selectedModelInfo?.provider || "")}
                  <span className="ml-1">
                    {selectedModelInfo?.name || selectedModelId}
                  </span>
                  <FiChevronDown
                    className={
                      "ml-1 transition-transform duration-200" +
                      (showModelSelector ? " rotate-180" : "")
                    }
                    size={18}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className={
                  showFullCatalog
                    ? "p-0 w-[40rem] max-w-[90vw] overflow-visible"
                    : "p-0 w-96 overflow-hidden"
                }
              >
                {!showFullCatalog ? (
                  <ModelSelectorQuickPick
                    availableModels={availableChatModels}
                    favourites={favourites}
                    onSelect={(id) => {
                      setSelectedModelId(id);
                      setShowModelSelector(false);
                    }}
                    onShowAll={() => setShowFullCatalog(true)}
                    search={search}
                    setSearch={setSearch}
                    filterList={filterList}
                    setFilterList={setFilterList}
                    onPin={handlePin}
                    onUnpin={handleUnpin}
                    selectedModelId={selectedModelId}
                  />
                ) : (
                  <ModelSelectorFullCatalog
                    availableModels={availableChatModels}
                    favourites={favourites}
                    onSelect={(id) => {
                      setSelectedModelId(id);
                      setShowFullCatalog(false);
                      setShowModelSelector(false);
                    }}
                    onBack={() => setShowFullCatalog(false)}
                    search={search}
                    setSearch={setSearch}
                    filterList={filterList}
                    setFilterList={setFilterList}
                    onPin={handlePin}
                    onUnpin={handleUnpin}
                    selectedModelId={selectedModelId}
                  />
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              data-testid="web-search-button"
              className={cx(
                "rounded-md p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200 flex items-center gap-1",
                useWebSearch
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                  : ""
              )}
              onClick={(e) => {
                e.preventDefault();
                handleWebSearch();
              }}
              disabled={!input.trim()}
              variant="ghost"
            >
              <GlobeIcon size={14} />
              <span className="ml-1 hidden md:inline">Web Search</span>
            </Button>
            <AttachmentsButton fileInputRef={fileInputRef} status={status} />
          </div>
          <div>
            {status === "submitted" ? (
              <StopButton stop={stop} setMessages={setMessages} />
            ) : (
              <SendButton
                input={input}
                submitForm={submitForm}
                uploadQueue={uploadQueue}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;
    if (prevProps.session !== nextProps.session) return false;
    return true;
  }
);

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers["status"];
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="rounded-md rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== "ready"}
      variant="ghost"
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers["setMessages"];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});

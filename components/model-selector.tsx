"use client";

import { useEffect, useMemo, useState } from "react";
import { chatModels, ChatModel } from "@/lib/ai/models";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { Button } from "@/components/ui/button";
import { useProviderIcon } from "@/hooks/use-provider-icon";
import { InfoIcon, CheckCircleFillIcon, PinIcon } from "./icons";
import {
  FiChevronRight,
  FiChevronLeft,
  FiImage,
  FiEye,
  FiCode,
} from "react-icons/fi";
import { db } from "@/lib/db/local";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import type { Session } from "next-auth";

const MAX_FAVOURITES = 10;

type ModelSelectorProps = {
  session: Session;
  selectedModelId: string;
  onSelect: (id: string) => void;
  className?: string;
};

type ModelSelectorQuickPickProps = {
  availableModels: ChatModel[];
  favourites: ChatModel[];
  onSelect: (id: string) => void;
  onShowAll: () => void;
  search: string;
  setSearch: (s: string) => void;
  filter: string | null;
  setFilter: (f: string | null) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  selectedModelId: string;
};

type ModelSelectorFullCatalogProps = {
  availableModels: ChatModel[];
  favourites: ChatModel[];
  onSelect: (id: string) => void;
  onBack: () => void;
  search: string;
  setSearch: (s: string) => void;
  filter: string | null;
  setFilter: (f: string | null) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  selectedModelId: string;
};

function getModelPerks(model: ChatModel): JSX.Element[] {
  const perks: JSX.Element[] = [];
  if (model.capabilities?.imageGeneration)
    perks.push(
      <FiImage
        key="image"
        className="w-4 h-4 text-blue-400"
        title="Image Generation"
      />
    );
  if (model.capabilities?.imageUnderstanding)
    perks.push(
      <FiEye
        key="vision"
        className="w-4 h-4 text-green-400"
        title="Image Understanding"
      />
    );
  if (model.capabilities?.codeCompletion)
    perks.push(
      <FiCode
        key="code"
        className="w-4 h-4 text-purple-400"
        title="Code Completion"
      />
    );
  return perks;
}

function groupByProvider(models: ChatModel[]): Record<string, ChatModel[]> {
  return models.reduce<Record<string, ChatModel[]>>((acc, model) => {
    acc[model.provider] = acc[model.provider] || [];
    acc[model.provider].push(model);
    return acc;
  }, {});
}

export function ModelSelectorQuickPick({
  availableModels,
  favourites,
  onSelect,
  onShowAll,
  search,
  setSearch,
  filter,
  setFilter,
  onPin,
  onUnpin,
  selectedModelId,
}: ModelSelectorQuickPickProps) {
  const filtered = useMemo(() => {
    let models = favourites.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase())
    );
    if (filter) {
      models = models.filter(
        (m) => m.capabilities?.[filter as keyof typeof m.capabilities]
      );
    }
    return models.slice(0, MAX_FAVOURITES);
  }, [favourites, search, filter]);

  return (
    <div className="absolute bottom-full mb-2 left-0 w-96 bg-popover dark:bg-zinc-900 rounded-xl shadow-xl border border-border z-50 animate-in fade-in zoom-in flex flex-col max-h-96 custom-scrollbar">
      <div className="p-2 border-b flex items-center gap-2">
        <input
          className="flex-1 px-2 py-1 rounded bg-muted outline-none"
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setFilter(filter ? null : "codeCompletion")}
            >
              <InfoIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Filter by code completion</TooltipContent>
        </Tooltip>
      </div>
      <div className="overflow-y-auto flex-1 px-2 py-1 custom-scrollbar">
        {filtered.length === 0 && (
          <div className="text-xs text-muted-foreground p-4 text-center">
            No favourites found.
          </div>
        )}
        {filtered.map((model) => (
          <div
            key={model.id}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-2 mb-1 transition-colors group cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800",
              model.id === selectedModelId && "border border-primary"
            )}
            onClick={() => onSelect(model.id)}
          >
            <span>{useProviderIcon(model.provider)}</span>
            <span className="font-medium flex-1 flex items-center gap-1">
              {model.name}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-1">
                    <InfoIcon size={14} />
                  </span>
                </TooltipTrigger>
                <TooltipContent>{model.description}</TooltipContent>
              </Tooltip>
            </span>
            <span className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {getModelPerks(model).map((perk, i) => (
                <span key={i} className="text-xs">
                  {perk}
                </span>
              ))}
            </span>
            <span className="ml-2 relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpin(model.id);
                    }}
                  >
                    <PinIcon className="w-4 h-4 text-blue-500" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Unpin</TooltipContent>
              </Tooltip>
              {model.id === selectedModelId && (
                <span className="absolute -top-1 -right-1 text-foreground dark:text-foreground group-hover:opacity-0 transition-opacity group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon size={16} />
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t p-2 flex items-center">
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center gap-1"
          onClick={onShowAll}
        >
          <FiChevronRight className="w-4 h-4" /> Show all
        </Button>
      </div>
    </div>
  );
}

export function ModelSelectorFullCatalog({
  availableModels,
  favourites,
  onSelect,
  onBack,
  search,
  setSearch,
  filter,
  setFilter,
  onPin,
  onUnpin,
  selectedModelId,
}: ModelSelectorFullCatalogProps) {
  const grouped = useMemo(
    () => groupByProvider(availableModels),
    [availableModels]
  );
  const favIds = new Set(favourites.map((f) => f.id));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-2xl relative animate-in fade-in zoom-in flex flex-col max-h-[80vh] custom-scrollbar">
        <div className="p-2 border-b flex items-center gap-2">
          <input
            className="flex-1 px-2 py-1 rounded bg-muted outline-none"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setFilter(filter ? null : "codeCompletion")}
              >
                <InfoIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Filter by code completion</TooltipContent>
          </Tooltip>
        </div>
        <div className="overflow-y-auto flex-1 px-2 py-1 custom-scrollbar">
          <div className="mb-4">
            <div className="font-semibold text-sm mb-2">Favourites</div>
            {favourites.length === 0 && (
              <div className="text-xs text-muted-foreground p-2">
                No favourites yet.
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {favourites.map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-2 transition-colors group cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-primary",
                    model.id === selectedModelId && "ring-2 ring-blue-500"
                  )}
                  onClick={() => onSelect(model.id)}
                >
                  <span>{useProviderIcon(model.provider)}</span>
                  <span className="font-medium flex-1 flex items-center gap-1">
                    {model.name}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-1">
                          <InfoIcon size={14} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{model.description}</TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {getModelPerks(model).map((perk, i) => (
                      <span key={i} className="text-xs">
                        {perk}
                      </span>
                    ))}
                  </span>
                  <span className="ml-2 relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnpin(model.id);
                          }}
                        >
                          <PinIcon className="w-4 h-4 text-blue-500" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Unpin</TooltipContent>
                    </Tooltip>
                    {model.id === selectedModelId && (
                      <span className="absolute -top-1 -right-1 text-foreground dark:text-foreground group-hover:opacity-0 transition-opacity group-data-[active=true]/item:opacity-100">
                        <CheckCircleFillIcon size={16} />
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold text-sm mb-2">Other Models</div>
            {Object.entries(grouped).map(([provider, models]) => (
              <div key={provider} className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  {useProviderIcon(provider)}
                  <span className="font-semibold text-xs uppercase">
                    {provider}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(models as ChatModel[])
                    .filter(
                      (m) =>
                        !favIds.has(m.id) &&
                        (m.name.toLowerCase().includes(search.toLowerCase()) ||
                          m.id.toLowerCase().includes(search.toLowerCase())) &&
                        (!filter ||
                          m.capabilities?.[
                            filter as keyof typeof m.capabilities
                          ])
                    )
                    .map((model) => (
                      <div
                        key={model.id}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-2 transition-colors group cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800",
                          model.id === selectedModelId && "ring-2 ring-blue-500"
                        )}
                        onClick={() => onSelect(model.id)}
                      >
                        <span>{useProviderIcon(model.provider)}</span>
                        <span className="font-medium flex-1 flex items-center gap-1">
                          {model.name}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="ml-1">
                                <InfoIcon size={14} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{model.description}</TooltipContent>
                          </Tooltip>
                        </span>
                        <span className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {getModelPerks(model).map((perk, i) => (
                            <span key={i} className="text-xs">
                              {perk}
                            </span>
                          ))}
                        </span>
                        <span className="ml-2 relative">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPin(model.id);
                                }}
                              >
                                <PinIcon className="w-4 h-4 text-blue-500" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Pin to favourites</TooltipContent>
                          </Tooltip>
                          {model.id === selectedModelId && (
                            <span className="absolute -top-1 -right-1 text-foreground dark:text-foreground group-hover:opacity-0 transition-opacity group-data-[active=true]/item:opacity-100">
                              <CheckCircleFillIcon size={16} />
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t p-2 flex items-center">
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center gap-1"
            onClick={onBack}
          >
            <FiChevronLeft className="w-4 h-4" /> Favourites
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ModelSelector({
  session,
  selectedModelId,
  onSelect,
  className,
}: ModelSelectorProps) {
  const userType = session.user.type;
  const availableChatModelIds =
    entitlementsByUserType[userType].availableModels;
  const availableChatModels = chatModels.filter((chatModel) =>
    availableChatModelIds.includes(chatModel.id)
  );
  const [favourites, setFavourites] = useState<ChatModel[]>([]);
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    db.model_favourites.toArray().then((favs) => {
      setFavourites(
        favs
          .map((f) => availableChatModels.find((m) => m.id === f.modelId))
          .filter((m): m is ChatModel => Boolean(m))
      );
    });
  }, [availableChatModels]);

  const handlePin = async (id: string) => {
    if (favourites.length >= MAX_FAVOURITES) {
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
  };
  const handleUnpin = async (id: string) => {
    await db.model_favourites.where("modelId").equals(id).delete();
    setFavourites((favs) => favs.filter((f) => f.id !== id));
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    saveChatModelAsCookie(id);
  };

  if (showFullCatalog) {
    return (
      <ModelSelectorFullCatalog
        availableModels={availableChatModels}
        favourites={favourites}
        onSelect={handleSelect}
        onBack={() => setShowFullCatalog(false)}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        onPin={handlePin}
        onUnpin={handleUnpin}
        selectedModelId={selectedModelId}
      />
    );
  }
  return (
    <ModelSelectorQuickPick
      availableModels={availableChatModels}
      favourites={favourites}
      onSelect={handleSelect}
      onShowAll={() => setShowFullCatalog(true)}
      search={search}
      setSearch={setSearch}
      filter={filter}
      setFilter={setFilter}
      onPin={handlePin}
      onUnpin={handleUnpin}
      selectedModelId={selectedModelId}
    />
  );
}

// Custom scrollbar CSS (add to globals.css):
// .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #888 #f1f1f1; }
// .custom-scrollbar::-webkit-scrollbar { width: 8px; }
// .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
// .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }

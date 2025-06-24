"use client";

import { useMemo } from "react";
import { ChatModel } from "@/lib/ai/models";
import { Button } from "@/components/ui/button";
import { useProviderIcon } from "@/hooks/use-provider-icon";
import { InfoIcon, CheckCircleFillIcon, PinIcon } from "./icons";
import {
  FiChevronRight,
  FiChevronLeft,
  FiImage,
  FiEye,
  FiCode,
  FiFilter,
  FiX,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const MAX_FAVOURITES = 10;

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
    <div className="p-0 w-96">
      <div className="p-2 border-b flex items-center gap-2">
        <div className="relative w-full flex items-center">
          <input
            className="flex-1 bg-transparent border-0 border-b-2 border-muted focus:border-primary outline-none transition-colors px-2 py-1"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
              tabIndex={-1}
            >
              <FiX size={16} />
            </button>
          )}
          <button
            className="ml-2 p-1 rounded hover:bg-muted/40"
            onClick={() => setFilter(filter ? null : "codeCompletion")}
            tabIndex={0}
          >
            <FiFilter size={18} />
          </button>
        </div>
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
  return (
    <div className="p-0 w-[40rem] max-w-[90vw]">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 w-full relative animate-in fade-in zoom-in flex flex-col max-h-[80vh] custom-scrollbar">
        <div className="p-2 border-b flex items-center gap-2">
          <div className="relative w-full flex items-center">
            <input
              className="flex-1 bg-transparent border-0 border-b-2 border-muted focus:border-primary outline-none transition-colors px-2 py-1"
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearch("")}
                tabIndex={-1}
              >
                <FiX size={16} />
              </button>
            )}
            <button
              className="ml-2 p-1 rounded hover:bg-muted/40"
              onClick={() => setFilter(filter ? null : "codeCompletion")}
              tabIndex={0}
            >
              <FiFilter size={18} />
            </button>
          </div>
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
            {availableModels.map((model) => (
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

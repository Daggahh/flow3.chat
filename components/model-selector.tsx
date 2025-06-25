"use client";

import { useMemo } from "react";
import { ChatModel } from "@/lib/ai/models";
import { Button } from "@/components/ui/button";
import { useProviderIcon } from "@/hooks/use-provider-icon";
import { CheckCircleFillIcon } from "./icons";
import {
  FiChevronRight,
  FiChevronLeft,
  FiImage,
  FiEye,
  FiCode,
  FiFilter,
  FiX,
  FiSearch,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useModelCapabilities } from "@/hooks/use-model-capabilities";
import { FaThumbtack, FaThumbtackSlash } from "react-icons/fa6";

const MAX_FAVOURITES = 10;

type ModelSelectorQuickPickProps = {
  availableModels: ChatModel[];
  favourites: ChatModel[];
  onSelect: (id: string) => void;
  onShowAll: () => void;
  search: string;
  setSearch: (s: string) => void;
  filterList: string[];
  setFilterList: (f: string[]) => void;
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
  filterList: string[];
  setFilterList: (f: string[]) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  selectedModelId: string;
};

function formatCapabilityLabel(cap: string) {
  return cap.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function ModelSelectorQuickPick({
  availableModels,
  favourites,
  onSelect,
  onShowAll,
  search,
  setSearch,
  filterList,
  setFilterList,
  onPin,
  onUnpin,
  selectedModelId,
}: ModelSelectorQuickPickProps) {
  const { allCapabilities } = useModelCapabilities(favourites);
  const filtered = useMemo(() => {
    let models = favourites.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase())
    );
    if (filterList.length > 0) {
      models = models.filter((m) =>
        filterList.every(
          (cap) => m.capabilities?.[cap as keyof typeof m.capabilities]
        )
      );
    }
    return models.slice(0, MAX_FAVOURITES);
  }, [favourites, search, filterList]);

  return (
    <div className="p-0 w-96">
      <div className="p-2 border-b flex items-center gap-2">
        <div className="relative w-full flex items-center">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <FiSearch size={16} />
          </span>
          <input
            className="flex-1 bg-transparent border-0 border-b-2 border-muted focus:border-primary outline-none transition-colors px-2 py-1 pl-8"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
              tabIndex={-1}
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="overflow-y-auto flex-1 px-1.5 py-1 custom-scrollbar">
        {filtered.length === 0 && (
          <div className="text-xs text-muted-foreground p-4 text-center">
            No favourites found.
          </div>
        )}
        {filtered.map((model) => (
          <Tooltip key={model.id} delayDuration={0}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-1.5 py-2.5 mb-1 transition-colors group cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 border",
                  model.id === selectedModelId && "border-primary"
                )}
                onClick={() => onSelect(model.id)}
              >
                <span className="flex items-center gap-2">
                  {useProviderIcon(model.provider)}
                  <span className="font-medium flex-1 flex items-center gap-1">
                    {model.name}
                  </span>
                </span>
                {model.id === selectedModelId && (
                  <span className="absolute -top-1 -right-1 text-foreground dark:text-foreground group-hover:opacity-0 transition-opacity group-data-[active=true]/item:opacity-100">
                    <CheckCircleFillIcon size={16} />
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="max-w-xs">
              {model.description}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="border-t p-2 flex items-center justify-between">
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center gap-1"
          onClick={onShowAll}
        >
          <FiChevronRight className="w-4 h-4" /> Show all
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative p-1 rounded hover:bg-muted/40 flex items-center ml-2"
              tabIndex={0}
            >
              <FiFilter size={18} />
              {filterList.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-2 h-2" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="ml-2 mb-2">
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setFilterList([]);
              }}
              className={
                filterList.length === 0 ? "font-bold text-primary" : ""
              }
            >
              All Capabilities
              {filterList.length === 0 && (
                <CheckCircleFillIcon className="ml-2" size={14} />
              )}
            </DropdownMenuItem>
            {allCapabilities.map((cap) => (
              <DropdownMenuItem
                key={cap}
                onSelect={(event) => {
                  event.preventDefault();
                  if (filterList.includes(cap))
                    setFilterList(filterList.filter((c) => c !== cap));
                  else setFilterList([...filterList, cap]);
                }}
                className={
                  filterList.includes(cap) ? "font-bold text-primary" : ""
                }
              >
                {formatCapabilityLabel(cap)}
                {filterList.includes(cap) && (
                  <CheckCircleFillIcon className="ml-2" size={14} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
  filterList,
  setFilterList,
  onPin,
  onUnpin,
  selectedModelId,
}: ModelSelectorFullCatalogProps) {
  const { allCapabilities } = useModelCapabilities(availableModels);
  return (
    <div className="p-0 w-[40rem] max-w-[90vw]">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-2 w-full relative animate-in fade-in zoom-in flex flex-col max-h-[80vh] custom-scrollbar">
        <div className="relative w-full flex items-center mb-2">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <FiSearch size={16} />
          </span>
          <input
            className="flex-1 bg-transparent border-0 border-b-2 border-muted focus:border-primary outline-none transition-colors px-2 py-1 pl-8 pr-8"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
              tabIndex={-1}
            >
              <FiX size={16} />
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 px-2 py-1 custom-scrollbar">
          <div className="mb-4">
            <div className="font-semibold text-sm mb-2">Favourites</div>
            {favourites.length === 0 && (
              <div className="text-xs text-muted-foreground p-2">
                No favourites yet.
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              {favourites.map((model) => (
                <Tooltip key={model.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "relative flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-lg border bg-background shadow-sm cursor-pointer group transition-all",
                        model.id === selectedModelId &&
                          "ring-2 ring-blue-500 border-primary"
                      )}
                      onClick={() => onSelect(model.id)}
                      style={{ overflow: "visible" }}
                    >
                      {/* Pin icon (slashed) at top right */}
                      <span className="absolute top-2 right-2 z-10">
                        <button
                          className="absolute -top-3 right-1/2 translate-x-1/2 bg-white/90 rounded shadow border border-blue-200 p-1 opacity-0 group-hover:opacity-100 transition z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnpin(model.id);
                          }}
                          title="Unpin from favourites"
                        >
                          <FaThumbtackSlash
                            className="w-4 h-4 text-black"
                            style={{ textDecoration: "line-through" }}
                          />
                        </button>
                      </span>
                      {/* Model icon at top center */}
                      <span className="flex justify-center items-center w-full mt-2 mb-1">
                        {useProviderIcon(model.provider)}
                      </span>
                      {/* Model name centered */}
                      <span className="text-center font-medium text-xs break-words px-1">
                        {model.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs"
                  >
                    {model.description}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold text-sm mb-2">Other Models</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              {availableModels
                .filter(
                  (model) => !favourites.some((fav) => fav.id === model.id)
                )
                .map((model) => (
                  <Tooltip key={model.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "relative flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-lg border bg-background shadow-sm cursor-pointer group transition-all",
                          model.id === selectedModelId &&
                            "ring-2 ring-blue-500 border-primary"
                        )}
                        onClick={() => onSelect(model.id)}
                        style={{ overflow: "visible" }}
                      >
                        {/* Pin icon at top right */}
                        <span className="absolute top-2 right-2 z-10">
                          <button
                            className="absolute -top-3 right-1/2 translate-x-1/2 bg-white/90 rounded shadow border border-blue-200 p-1 opacity-0 group-hover:opacity-100 transition z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPin(model.id);
                            }}
                            title="Pin to favourites"
                          >
                            <FaThumbtack className="w-4 h-4 text-black" />
                          </button>
                        </span>
                        {/* Model icon at top center */}
                        <span className="flex justify-center items-center w-full mt-2 mb-1">
                          {useProviderIcon(model.provider)}
                        </span>
                        {/* Model name centered */}
                        <span className="text-center font-medium text-xs break-words px-1">
                          {model.name}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="center"
                      className="max-w-xs"
                    >
                      {model.description}
                    </TooltipContent>
                  </Tooltip>
                ))}
            </div>
          </div>
        </div>
        <div className="border-t pt-2 flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center gap-1"
            onClick={onBack}
          >
            <FiChevronLeft className="w-4 h-4" /> Favourites
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative p-1 rounded hover:bg-muted/40 flex items-center ml-2"
                tabIndex={0}
              >
                <FiFilter size={18} />
                {filterList.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-2 h-2" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="right"
              className="ml-2 mb-2"
            >
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setFilterList([]);
                }}
                className={
                  filterList.length === 0 ? "font-bold text-primary" : ""
                }
              >
                All Capabilities
                {filterList.length === 0 && (
                  <CheckCircleFillIcon className="ml-2" size={14} />
                )}
              </DropdownMenuItem>
              {allCapabilities.map((cap) => (
                <DropdownMenuItem
                  key={cap}
                  onSelect={(event) => {
                    event.preventDefault();
                    if (filterList.includes(cap))
                      setFilterList(filterList.filter((c) => c !== cap));
                    else setFilterList([...filterList, cap]);
                  }}
                  className={
                    filterList.includes(cap) ? "font-bold text-primary" : ""
                  }
                >
                  {formatCapabilityLabel(cap)}
                  {filterList.includes(cap) && (
                    <CheckCircleFillIcon className="ml-2" size={14} />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

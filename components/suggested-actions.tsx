"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { memo, useState } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { VisibilityType } from "./visibility-selector";
import { Code, Pen, BarChart, Globe, Sparkles } from "./icons";

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers["append"];
  selectedVisibilityType: VisibilityType;
}

interface SuggestedAction {
  title: string;
  label: string;
  action: string;
}

interface Category {
  id: string;
  name: string;
  icon: JSX.Element;
  suggestions: SuggestedAction[];
}

function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const categories: Category[] = [
    {
      id: "development",
      name: "Development",
      icon: <Code className="w-4 h-4" />,
      suggestions: [
        {
          title: "What are the advantages",
          label: "of using Next.js?",
          action: "What are the advantages of using Next.js?",
        },
        {
          title: "Write code to",
          label: `demonstrate dijkstra's algorithm`,
          action: `Write code to demonstrate dijkstra's algorithm`,
        },
        {
          title: "Explain the concept",
          label: "of microservices architecture",
          action: "Explain the concept of microservices architecture",
        },
        {
          title: "Create a React component",
          label: "for user authentication",
          action: "Create a React component for user authentication",
        },
      ],
    },
    {
      id: "writing",
      name: "Writing",
      icon: <Pen className="w-4 h-4" />,
      suggestions: [
        {
          title: "Help me write an essay",
          label: "about silicon valley",
          action: "Help me write an essay about silicon valley",
        },
        {
          title: "Create a blog post",
          label: "about AI in healthcare",
          action: "Create a blog post about AI in healthcare",
        },
        {
          title: "Draft a professional email",
          label: "for client communication",
          action: "Draft a professional email for client communication",
        },
        {
          title: "Write a product description",
          label: "for an e-commerce website",
          action: "Write a product description for an e-commerce website",
        },
      ],
    },
    {
      id: "analysis",
      name: "Analysis",
      icon: <BarChart className="w-4 h-4" />,
      suggestions: [
        {
          title: "Analyze market trends",
          label: "in renewable energy",
          action: "Analyze market trends in renewable energy",
        },
        {
          title: "Compare different",
          label: "machine learning algorithms",
          action: "Compare different machine learning algorithms",
        },
        {
          title: "Evaluate the pros and cons",
          label: "of remote work",
          action: "Evaluate the pros and cons of remote work",
        },
        {
          title: "Break down the components",
          label: "of effective leadership",
          action: "Break down the components of effective leadership",
        },
      ],
    },
    {
      id: "general",
      name: "General",
      icon: <Globe className="w-4 h-4" />,
      suggestions: [
        {
          title: "What is the weather",
          label: "in San Francisco?",
          action: "What is the weather in San Francisco?",
        },
        {
          title: "Explain quantum computing",
          label: "in simple terms",
          action: "Explain quantum computing in simple terms",
        },
        {
          title: "What are some healthy",
          label: "meal prep ideas?",
          action: "What are some healthy meal prep ideas?",
        },
        {
          title: "Plan a weekend trip",
          label: "to a nearby city",
          action: "Plan a weekend trip to a nearby city",
        },
      ],
    },
    {
      id: "creative",
      name: "Creative",
      icon: <Sparkles className="w-4 h-4" />,
      suggestions: [
        {
          title: "Generate ideas for",
          label: "a mobile app concept",
          action: "Generate ideas for a mobile app concept",
        },
        {
          title: "Create a story outline",
          label: "for a sci-fi novel",
          action: "Create a story outline for a sci-fi novel",
        },
        {
          title: "Design a logo concept",
          label: "for a tech startup",
          action: "Design a logo concept for a tech startup",
        },
        {
          title: "Brainstorm marketing strategies",
          label: "for social media",
          action: "Brainstorm marketing strategies for social media",
        },
      ],
    },
  ];

  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === activeCategory) return;

    setIsTransitioning(true);
    // Small delay to allow exit animation
    setTimeout(() => {
      setActiveCategory(categoryId);
      setIsTransitioning(false);
    }, 100);
  };

  const activeCategoryData = categories.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <div className="w-full space-y-4">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.05,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              handleCategoryChange(category.id);
            }}
            className={`
              relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <motion.div
              className="flex items-center gap-2"
              animate={{
                y: activeCategory === category.id ? -1 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <span
                className={`${
                  activeCategory === category.id
                    ? "text-primary-foreground"
                    : "text-primary/60"
                }`}
              >
                {category.icon}
              </span>
              <span>{category.name}</span>
            </motion.div>

            {/* Active category indicator */}
            {activeCategory === category.id && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-primary rounded-full -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Suggestion Cards */}
      <div
        data-testid="suggested-actions"
        className="grid sm:grid-cols-2 gap-2 w-full min-h-[140px]"
      >
        <AnimatePresence mode="popLayout">
          {!isTransitioning &&
            activeCategoryData?.suggestions.map((suggestedAction, index) => (
              <motion.div
                key={`suggestion-${activeCategory}-${index}`}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    delay: index * 0.06,
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                  },
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                  scale: 0.95,
                  transition: { duration: 0.1 },
                }}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
                className={index > 1 ? "hidden sm:block" : "block"}
              >
                <Button
                  variant="ghost"
                  onClick={async () => {
                    window.history.replaceState({}, "", `/chat/${chatId}`);

                    append({
                      role: "user",
                      content: suggestedAction.action,
                    });
                  }}
                  className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start hover:shadow-md transition-all duration-200 group"
                >
                  <motion.span
                    className="font-medium group-hover:text-primary transition-colors duration-200"
                    animate={{ x: 0 }}
                    whileHover={{ x: 2 }}
                  >
                    {suggestedAction.title}
                  </motion.span>
                  <motion.span
                    className="text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200"
                    animate={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ delay: 0.02 }}
                  >
                    {suggestedAction.label}
                  </motion.span>
                </Button>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Loading state during transition */}
      {isTransitioning && (
        <div className="absolute inset-0 grid sm:grid-cols-2 gap-2 w-full">
          {[...Array(4)].map((_, index) => (
            <motion.div
              key={`loading-${index}`}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 0.2, 0.4] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.05,
              }}
              className={`border rounded-xl px-4 py-3.5 h-16 bg-muted/30 ${
                index > 1 ? "hidden sm:block" : "block"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  }
);

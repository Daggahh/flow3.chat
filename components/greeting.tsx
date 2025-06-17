"use client";

import { motion, useAnimate } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export const Greeting = () => {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const animation = async () => {
      // Shimmer effect
      await animate(
        ".shimmer",
        { x: ["0%", "100%"] },
        { duration: 1.5, ease: "linear" }
      );
      // Bounce effect for emojis
      await animate(
        ".emoji",
        { scale: [1, 1.2, 1] },
        { duration: 0.5, delay: 1.5 }
      );
    };
    animation();
  }, [animate]);

  return (
    <div
      ref={scope}
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold relative overflow-hidden"
      >
        <span className="relative inline-flex items-center gap-2">
          {firstName ? `Hello, ${firstName}! ` : "Hello there! "}
          <span className="emoji">✨</span>
        </span>
        <div className="shimmer absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{
          delay: 0.6,
          type: "spring",
          stiffness: 100,
          damping: 10,
        }}
        className="text-2xl text-zinc-500 relative overflow-hidden"
      >
        <span className="relative inline-flex items-center gap-2">
          How can I help you today?
          <span className="emoji">💭</span>
        </span>
        <div className="shimmer absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>
    </div>
  );
};

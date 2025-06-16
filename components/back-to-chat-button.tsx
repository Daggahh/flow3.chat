'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export function BackToChatButton() {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="absolute top-4 left-4"
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Back to Chat</span>
      </Link>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SecretCopyProps = {
  secret: string;
};

export function SecretCopy({ secret }: SecretCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!secret) return null;

  return (
    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-sm border border-blue-500/40">
      <span className="truncate">{secret}</span>

      <button
        onClick={() => handleCopyToClipboard(secret)}
        className="ml-3 relative flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        aria-label="Copy to clipboard"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1"
            >
              <Check size={16} />
              <span className="text-xs">Copied</span>
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1"
            >
              <Copy size={16} />
              <span className="text-xs">Copy</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

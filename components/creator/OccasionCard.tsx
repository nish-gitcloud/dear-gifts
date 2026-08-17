"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { OccasionDefinition } from "@/types/gift";
import { getTheme } from "@/config/themes";
import { trackEvent } from "@/lib/analyticsClient";

export function OccasionCard({ occasion, index = 0 }: { occasion: OccasionDefinition; index?: number }) {
  const theme = getTheme(occasion.accentTheme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -6 }}
    >
      <Link
        href={`/create/${occasion.id}`}
        onClick={() => trackEvent("occasion_selected", { occasion: occasion.id })}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl dark:border-white/10 dark:bg-[#1A131A] dark:hover:shadow-black/40"
      >
        <div
          aria-hidden
          className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
          style={{ background: theme.previewGradient }}
        />
        <motion.span
          className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
          style={{ background: theme.previewGradient }}
          whileHover={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.5 }}
        >
          {occasion.icon}
        </motion.span>
        <h3 className="font-display relative text-xl font-semibold text-[#241A17] dark:text-[#F3ECE8]">{occasion.title}</h3>
        <p className="relative mt-2 text-sm leading-relaxed text-black/60 dark:text-white/55">{occasion.tagline}</p>
        <span className="relative mt-4 inline-flex items-center text-sm font-medium text-[#E85C7B] opacity-0 transition-opacity group-hover:opacity-100">
          Start creating →
        </span>
      </Link>
    </motion.div>
  );
}

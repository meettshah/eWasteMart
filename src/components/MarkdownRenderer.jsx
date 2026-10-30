"use client";

import React from "react";
import Link from "next/link";

/**
 * Parses inline markdown tokens:
 * - Links: [label](url)
 * - Bold + Italic: ***text***
 * - Bold: **text**
 * - Italic: *text* or _text_
 * - Inline Code: `code`
 */
function parseInline(text) {
  if (!text) return "";

  // Token regex for links, bold+italic, bold, italic, code
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|`([^`]+)`)/g;
  const elements = [];
  let lastIdx = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      elements.push(text.substring(lastIdx, match.index));
    }

    const fullMatch = match[0];
    const key = `${match.index}-${lastIdx}`;

    if (match[2] && match[3]) {
      // [label](url)
      const label = match[2];
      const href = match[3];
      const isInternal = href.startsWith("/");

      if (isInternal) {
        elements.push(
          <Link
            key={key}
            href={href}
            className="font-bold text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/50 underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            {label}
          </Link>
        );
      } else {
        elements.push(
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/50 underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            {label}
          </a>
        );
      }
    } else if (match[4]) {
      // ***bold italic***
      elements.push(
        <strong key={key} className="font-extrabold italic text-slate-900 dark:text-white">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      // **bold**
      elements.push(
        <strong key={key} className="font-bold text-slate-900 dark:text-white">
          {match[5]}
        </strong>
      );
    } else if (match[6] || match[7]) {
      // *italic* or _italic_
      const italicText = match[6] || match[7];
      elements.push(
        <em key={key} className="italic text-slate-700 dark:text-slate-300">
          {italicText}
        </em>
      );
    } else if (match[8]) {
      // `code`
      elements.push(
        <code
          key={key}
          className="rounded-md bg-slate-200/80 px-1.5 py-0.5 font-mono text-[11px] text-emerald-700 dark:bg-slate-800 dark:text-emerald-400 border border-slate-300/60 dark:border-slate-700/60"
        >
          {match[8]}
        </code>
      );
    } else {
      elements.push(fullMatch);
    }

    lastIdx = tokenRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    elements.push(text.substring(lastIdx));
  }

  return elements.length > 0 ? elements : text;
}

/**
 * Full Markdown Renderer for Gemini & Chatbot responses.
 * Converts headings, bullet lists, numbered lists, and paragraphs with inline tokens.
 */
export default function MarkdownRenderer({ content, className = "" }) {
  if (!content) return null;

  // Split into raw lines while preserving structure
  const rawLines = content.split("\n");
  const blocks = [];
  let currentList = null; // { type: 'bullet' | 'ordered', items: [] }

  const flushList = () => {
    if (currentList) {
      if (currentList.type === "bullet") {
        blocks.push({
          type: "bullet-list",
          items: currentList.items,
        });
      } else if (currentList.type === "ordered") {
        blocks.push({
          type: "ordered-list",
          items: currentList.items,
        });
      }
      currentList = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Empty line -> flush active list and add paragraph break
    if (!trimmed) {
      flushList();
      continue;
    }

    // Bullet list item: "- ", "* ", "• ", or "_ "
    const bulletMatch = trimmed.match(/^[-*•_]\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "bullet") {
        flushList();
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Numbered list item: "1. ", "2. ", etc.
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (orderedMatch) {
      if (!currentList || currentList.type !== "ordered") {
        flushList();
        currentList = { type: "ordered", items: [] };
      }
      currentList.items.push({ num: orderedMatch[1], text: orderedMatch[2] });
      continue;
    }

    // If it was another line, flush any pending list
    flushList();

    // Headings
    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: trimmed.slice(4) });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: trimmed.slice(3) });
    } else if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", text: trimmed.slice(2) });
    } else {
      // Normal paragraph line
      blocks.push({ type: "p", text: trimmed });
    }
  }

  flushList();

  return (
    <div className={`space-y-2.5 text-xs leading-relaxed text-slate-800 dark:text-slate-200 ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return (
              <h2 key={idx} className="font-extrabold text-sm text-slate-950 dark:text-white mt-2 mb-1">
                {parseInline(block.text)}
              </h2>
            );
          case "h2":
            return (
              <h3 key={idx} className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mt-2 mb-1">
                {parseInline(block.text)}
              </h3>
            );
          case "h3":
            return (
              <h4 key={idx} className="font-bold text-xs text-slate-900 dark:text-white mt-1 mb-0.5">
                {parseInline(block.text)}
              </h4>
            );
          case "bullet-list":
            return (
              <ul key={idx} className="space-y-1.5 my-1.5 pl-1">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="flex-1">{parseInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ordered-list":
            return (
              <ol key={idx} className="space-y-1.5 my-1.5 pl-1">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      {item.num}
                    </span>
                    <span className="flex-1">{parseInline(item.text)}</span>
                  </li>
                ))}
              </ol>
            );
          case "p":
          default:
            return (
              <p key={idx} className="leading-relaxed">
                {parseInline(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
}


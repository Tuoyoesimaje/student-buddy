import { /* type ClassValue, */ clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts note titles from the formatted topicOrNote string
 * Format: "--- NOTE 1 START: title ---\ncontent\n--- NOTE 1 END ---"
 * @param {string} topicOrNote - The formatted string containing note content
 * @returns {string} - Comma-separated list of note titles, or truncated content if no titles found
 */
export function extractNoteTitles(topicOrNote) {
  if (!topicOrNote) return '';

  // Match titles using regex: --- NOTE \d+ START: (.+?) ---
  const titleMatches = topicOrNote.match(/--- NOTE \d+ START: (.+?) ---/g);

  if (titleMatches && titleMatches.length > 0) {
    // Extract the title part from each match
    const titles = titleMatches.map(match => {
      const titleMatch = match.match(/--- NOTE \d+ START: (.+?) ---/);
      return titleMatch ? titleMatch[1] : '';
    }).filter(title => title.length > 0);

    if (titles.length > 0) {
      return titles.join(', ');
    }
  }

  // Fallback: if no titles found, return truncated content
  return topicOrNote.substring(0, 100) + (topicOrNote.length > 100 ? '...' : '');
}
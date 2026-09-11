/**
 * Formats AI output into clean plain text for assessment explanation sections.
 * Strips raw markdown symbols like **, *, #, and replaces bullet asterisks with clean plain text bullets.
 */
export function formatPlainText(text: string | null | undefined): string {
  if (!text) return "";

  return text
    // Replace **bold** with plain text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    // Replace *italic* with plain text
    .replace(/\*(.*?)\*/g, "$1")
    // Replace lines starting with * or - with clean bullet symbol
    .replace(/^\s*\*+\s+/gm, "• ")
    .replace(/^\s*\-+\s+/gm, "• ")
    // Remove any leftover asterisks anywhere in the text
    .replace(/\*/g, "")
    // Remove markdown headers (#, ##, ###)
    .replace(/^#{1,6}\s*/gm, "")
    // Clean up excessive blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

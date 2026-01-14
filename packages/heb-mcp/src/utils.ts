import { readFileSync } from 'fs';

/**
 * Renders a page by reading a file and replacing placeholders.
 * @param filePath Path to the HTML template file.
 * @param replacements Map of placeholders (without {{}}) to their values.
 * @returns The rendered HTML content.
 */
export function renderPage(filePath: string, replacements: Record<string, string> = {}): string {
  let content = readFileSync(filePath, 'utf8');
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return content;
}

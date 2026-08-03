/**
 * Extract all variable names from a prompt.
 *
 * Example:
 *
 * Hello {{name}}
 *
 * {{company}}
 *
 * =>
 *
 * ["name", "company"]
 */

export function extractVariables(
  text: string,
): string[] {
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

  const variables = new Set<string>();

  for (const match of text.matchAll(regex)) {
    variables.add(match[1]);
  }

  return [...variables];
}
// ============================================================
// DevNest — Tag Parser (JSON string ↔ string[])
// ============================================================

export function parseTags(jsonString: string): string[] {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) return parsed.map(String);
    return [];
  } catch {
    return [];
  }
}

export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags.filter(Boolean).map(t => t.trim().toLowerCase()));
}

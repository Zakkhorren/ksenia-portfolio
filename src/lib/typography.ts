const shortWords =
  /(^|[\s\u00a0(«„])((?:в|и|с|к|у|о|а|но|на|по|за|из|от|об|под|над|для|при|во|со|до|не|ни|без)) +(?=\S)/giu;
/** Format copy before rendering, without a document-wide MutationObserver. */
export function ru(text: string): string {
  for (let i = 0; i < 3; i++) text = text.replace(shortWords, "$1$2\u00a0");
  return text;
}
export const pad = (n: number) => String(n).padStart(2, "0");

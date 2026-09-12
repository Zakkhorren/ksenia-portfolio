import { createSignal } from "solid-js";
import data from "../data/galleries.json";

export interface Slide {
  src: string;
  alt?: string;
  caption?: string;
  thumb?: string;
  crop?: boolean;
  position?: string;
  ratio?: string;
}
export interface Gallery {
  title: string;
  images: Slide[];
  description?: string;
  facts?: Record<string, string>;
  mode?: string;
  preheading?: string;
  title_lines?: string[];
  brand?: string;
}
export type ViewerRequest =
  | { kind: "gallery"; id: string; index: number; trigger: HTMLElement }
  | { kind: "logo"; index: number; trigger: HTMLElement }
  | { kind: "reader"; trigger: HTMLElement };

export const galleries: Record<string, Gallery> = data;
export const [viewer, setViewer] = createSignal<ViewerRequest | null>(null);
export const closeViewer = () => setViewer(null);
export function openGallery(id: string, index: number, trigger: HTMLElement) {
  if (galleries[id]) setViewer({ kind: "gallery", id, index, trigger });
}
export const openLogo = (index: number, trigger: HTMLElement) =>
  setViewer({ kind: "logo", index, trigger });
export const openReader = (trigger: HTMLElement) =>
  setViewer({ kind: "reader", trigger });

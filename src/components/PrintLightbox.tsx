import { createEffect, For } from "solid-js";
import { asset } from "../lib/paths";
import type { PrintPage } from "../lib/print-assets";
import Publication, { type PublicationStructure } from "./Publication";
export type PrintPreview = {
  title: string;
  groups: { label: string; pages: PrintPage[] }[];
  book?: boolean;
  structure?: PublicationStructure;
  editorial?: boolean;
  hideGroupCaptions?: boolean;
  trigger: HTMLElement;
};
export default function PrintLightbox(props: {
  preview: PrintPreview;
  onClose: () => void;
}) {
  let dialog!: HTMLDialogElement;
  const trigger = props.preview.trigger;
  createEffect(
    () => true,
    () => {
      const before = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.showModal();
      return () => {
        dialog.close();
        document.body.style.overflow = before;
        if (trigger.isConnected) trigger.focus({ preventScroll: true });
      };
    },
  );
  return (
    <dialog
      ref={dialog}
      class={`print-lightbox${props.preview.book ? " publication-modal" : props.preview.editorial ? " editorial-modal" : ""}`}
      style={
        props.preview.book
          ? {
              "--page-ratio": String(
                props.preview.groups[0].pages[0].width /
                  props.preview.groups[0].pages[0].height,
              ),
            }
          : undefined
      }
      aria-labelledby="print-lightbox-title"
      onClose={props.onClose}
      onClick={(e) => {
        if (e.target === dialog) props.onClose();
      }}
    >
      <div class="print-lightbox-content">
        <header class="print-lightbox-head">
          <h2 id="print-lightbox-title">{props.preview.title}</h2>
          <button
            type="button"
            aria-label="Закрыть просмотр"
            onClick={props.onClose}
          >
            ×
          </button>
        </header>
        {props.preview.book ? (
          <Publication
            pages={props.preview.groups[0].pages}
            title={props.preview.title}
            structure={props.preview.structure}
          />
        ) : (
          <div class="print-static-groups">
            <For each={props.preview.groups}>
              {(group) => (
                <figure class="print-preview-group">
                  <div class="print-preview-pages">
                    <For each={group.pages}>
                      {(p, i) => (
                        <img
                          src={asset(p.file)}
                          width={p.width}
                          height={p.height}
                          alt={`${group.label} — ${i() + 1}`}
                          loading={i() === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      )}
                    </For>
                  </div>
                  {!props.preview.hideGroupCaptions &&
                    props.preview.groups.length > 1 && (
                      <figcaption>{group.label}</figcaption>
                    )}
                </figure>
              )}
            </For>
          </div>
        )}
      </div>
    </dialog>
  );
}

import { onCleanup } from "solid-js";
import { routePath } from "../lib/paths";

const unavailable = new Set([
  "/work/packaging/",
  "/work/layout/",
  "/work/experiments/",
]);

/** One capture handler covers cards, tabs and next-collection links. */
export default function UnavailableNotice() {
  let dialog!: HTMLDialogElement;
  let trigger: HTMLAnchorElement | undefined;
  const intercept = (event: MouseEvent) => {
    const link =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href]")
        : null;
    if (!link) return;
    const destination = new URL(link.href);
    if (
      destination.origin !== window.location.origin ||
      !unavailable.has(routePath(destination.pathname))
    )
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
    trigger = link;
    if (!dialog.open) dialog.showModal();
  };
  for (const name of ["click", "auxclick", "contextmenu"] as const)
    document.addEventListener(name, intercept, true);
  onCleanup(() => {
    for (const name of ["click", "auxclick", "contextmenu"] as const)
      document.removeEventListener(name, intercept, true);
  });
  return (
    <dialog
      ref={dialog}
      class="unavailable-notice"
      aria-labelledby="unavailable-message"
      onClose={() => trigger?.focus({ preventScroll: true })}
      onClick={(event) => {
        if (event.target === dialog) dialog.close();
      }}
    >
      <div>
        <p id="unavailable-message">Временно не работает :(</p>
        <button
          type="button"
          aria-label="Закрыть"
          onClick={() => dialog.close()}
        >
          ×
        </button>
      </div>
    </dialog>
  );
}

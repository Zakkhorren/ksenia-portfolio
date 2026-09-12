import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  closeViewer,
  galleries,
  viewer,
  type ViewerRequest,
} from "../lib/viewer-state";
import { asset, url } from "../lib/paths";
import { pad, ru } from "../lib/typography";
import logos from "../data/logofolio.json";
import publication from "../data/publication.json";

interface DialogProps {
  class: string;
  label: string;
  request: ViewerRequest;
  children: JSX.Element;
  mode?: string;
  onNavigate: (direction: number) => void;
}
function Dialog(props: DialogProps) {
  let dialog!: HTMLDialogElement;
  createEffect(
    () => true,
    () => {
      document.body.classList.add("modal-open");
      dialog.showModal();
      dialog
        .querySelector<HTMLButtonElement>("button")
        ?.focus({ preventScroll: true });
      return () => {
        if (dialog.open) dialog.close();
        document.body.classList.remove("modal-open");
        if (props.request.trigger.isConnected)
          props.request.trigger.focus({ preventScroll: true });
      };
    },
  );
  return (
    <dialog
      ref={dialog}
      class={props.class}
      aria-labelledby={props.label}
      data-mode={props.mode}
      onClose={closeViewer}
      onClick={(event) => {
        if (event.target === dialog) closeViewer();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          props.onNavigate(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      {props.children}
    </dialog>
  );
}

function swipe(onNavigate: (direction: number) => void) {
  let start: [number, number] | undefined;
  return {
    onTouchStart(event: TouchEvent) {
      start = [
        event.changedTouches[0].clientX,
        event.changedTouches[0].clientY,
      ];
    },
    onTouchEnd(event: TouchEvent) {
      if (!start) return;
      const dx = event.changedTouches[0].clientX - start[0],
        dy = event.changedTouches[0].clientY - start[1];
      start = undefined;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
        onNavigate(dx < 0 ? 1 : -1);
    },
  };
}

// Cache decoded image nodes, loading only the opened gallery. Bound memory usage.
const decoded = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string) {
  let cached = decoded.get(src);
  if (!cached) {
    cached = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = async () => {
        try {
          await image.decode();
        } catch {
          /* Loaded pixels are still usable. */
        }
        resolve(image);
      };
      image.onerror = () => {
        decoded.delete(src);
        reject(new Error("Image unavailable"));
      };
      image.src = url(src);
    });
    decoded.set(src, cached);
    if (decoded.size > 16) decoded.delete(decoded.keys().next().value!);
  }
  return cached;
}

function GalleryViewer(props: {
  request: Extract<ViewerRequest, { kind: "gallery" }>;
}) {
  const gallery = galleries[props.request.id];
  const [requested, setRequested] = createSignal(props.request.index);
  const [shown, setShown] = createSignal(props.request.index);
  const [image, setImage] = createSignal<HTMLImageElement | null>(null);
  const [error, setError] = createSignal(false);
  const [busy, setBusy] = createSignal(true);
  const [retry, setRetry] = createSignal(0);
  let generation = 0;
  onCleanup(() => {
    generation++;
  });
  const select = (index: number) =>
    setRequested(Math.max(0, Math.min(index, gallery.images.length - 1)));
  const navigate = (direction: number) => select(requested() + direction);
  const count = () => `${pad(shown() + 1)} / ${pad(gallery.images.length)}`;
  createEffect(
    () => ({ index: requested(), retry: retry() }),
    ({ index }) => {
      const token = ++generation;
      const slide = gallery.images[index];
      setBusy(true);
      setError(false);
      loadImage(slide.src)
        .then((node) => {
          if (token !== generation) return;
          node.className = "viewer-main-image";
          node.alt = slide.alt || gallery.title;
          node.dataset.crop = String(Boolean(slide.crop));
          node.style.setProperty("--position", slide.position || "50% 50%");
          node.style.setProperty("--ratio", slide.ratio || "1");
          setImage(node);
          setShown(index);
          setBusy(false);
          // Decode neighbouring frames after the visible image, keeping interaction responsive.
          for (const neighbour of [index - 1, index + 1]) {
            if (gallery.images[neighbour])
              void loadImage(gallery.images[neighbour].src).catch(() => {});
          }
        })
        .catch(() => {
          if (token === generation) {
            setError(true);
            setBusy(false);
          }
        });
    },
  );
  return (
    <Dialog
      class={`viewer${gallery.description ? " has-details" : ""}`}
      label="viewer-title"
      mode={gallery.mode || "gallery"}
      request={props.request}
      onNavigate={navigate}
    >
      <div class="viewer-shell">
        <div class="viewer-top">
          <div>
            <h2 id="viewer-title">{ru(gallery.title)}</h2>
            <p class="viewer-count" aria-live="polite">
              {count()}
            </p>
          </div>
          <button
            type="button"
            class="icon-button viewer-close"
            aria-label="Закрыть просмотр"
            onClick={closeViewer}
          >
            ×
          </button>
        </div>
        <div class="viewer-body">
          <div
            class="viewer-stage"
            aria-busy={busy() ? "true" : "false"}
            {...swipe(navigate)}
          >
            <button
              type="button"
              class="icon-button viewer-previous"
              aria-label="Предыдущее изображение"
              hidden={gallery.images.length < 2}
              disabled={requested() === 0}
              onClick={() => navigate(-1)}
            >
              ←
            </button>
            {image()}
            <Show when={error()}>
              <p role="alert">
                Не удалось загрузить изображение.{" "}
                <button type="button" onClick={() => setRetry(retry() + 1)}>
                  Повторить
                </button>
              </p>
            </Show>
            <button
              type="button"
              class="icon-button viewer-next"
              aria-label="Следующее изображение"
              hidden={gallery.images.length < 2}
              disabled={requested() === gallery.images.length - 1}
              onClick={() => navigate(1)}
            >
              →
            </button>
            <span
              class="market-counter"
              hidden={gallery.mode !== "marketplace"}
            >
              {count()}
            </span>
          </div>
          <aside class="viewer-description" hidden={!gallery.description}>
            {gallery.preheading && (
              <p class="viewer-preheading">{gallery.preheading}</p>
            )}
            <h3>
              {gallery.title_lines ? (
                <For each={gallery.title_lines}>
                  {(line) => <span>{line}</span>}
                </For>
              ) : (
                ru(gallery.title)
              )}
            </h3>
            {gallery.brand && <p class="viewer-brand">{gallery.brand}</p>}
            <p>{ru(gallery.description || "")}</p>
            <dl>
              <For each={Object.entries(gallery.facts || {})}>
                {([label, value]) => (
                  <>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </>
                )}
              </For>
            </dl>
          </aside>
        </div>
        <p class="viewer-caption" aria-live="polite">
          {ru(gallery.images[shown()].caption || "")}
        </p>
        <div
          class="viewer-thumbs"
          aria-label="Миниатюры изображений"
          hidden={gallery.images.length < 2}
        >
          <For each={gallery.images}>
            {(slide, index) => (
              <button
                type="button"
                aria-label={`Изображение ${index() + 1}: ${slide.caption || gallery.title}`}
                aria-current={index() === shown() ? "true" : "false"}
                onClick={() => select(index())}
              >
                <img
                  src={url(slide.thumb || slide.src)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </button>
            )}
          </For>
        </div>
      </div>
    </Dialog>
  );
}

function LogoViewer(props: {
  request: Extract<ViewerRequest, { kind: "logo" }>;
}) {
  const [index, setIndex] = createSignal(props.request.index);
  const project = () => logos[index()];
  const hero = () =>
    project().assets.find((a) => a.file === project().hero) ||
    project().assets[0];
  const secondary = () =>
    project().secondary
      ? project().secondary!.map((file) =>
          project().assets.find((a) => a.file === file)!,
        )
      : project().assets.slice(1);
  const navigate = (direction: number) =>
    setIndex((index() + direction + logos.length) % logos.length);
  const count = () => `${pad(index() + 1)} / ${pad(logos.length)}`;
  return (
    <Dialog
      class="logo-detail"
      label="logo-detail-title"
      request={props.request}
      onNavigate={navigate}
    >
      <div class="logo-detail-head">
        <span class="logo-counter" aria-live="polite">
          {count()}
        </span>
        <button
          type="button"
          class="logo-detail-close"
          aria-label="Закрыть логотип"
          onClick={closeViewer}
        >
          ×
        </button>
      </div>
      <div class="logo-detail-content" {...swipe(navigate)}>
        <div class="logo-primary">
          <img
            class="logo-art"
            src={asset(`logofolio/${hero().file}`)}
            width={hero().width}
            height={hero().height}
            alt={project().name}
            decoding="async"
          />
        </div>
        <div class="logo-detail-info">
          <h2 id="logo-detail-title">
            {project().name} / {project().year}
          </h2>
          <p>{ru(project().context)}</p>
        </div>
        <Show when={secondary().length > 0}>
          <section class="logo-detail-secondary">
            <h3>ДОПОЛНИТЕЛЬНЫЕ ЗНАКИ</h3>
            <div class="logo-specimens">
              <For each={secondary()}>
                {(item) => (
                  <img
                    class="logo-art"
                    src={asset(`logofolio/${item.file}`)}
                    width={item.width}
                    height={item.height}
                    alt={`${project().name}: дополнительный знак`}
                    decoding="async"
                  />
                )}
              </For>
            </div>
          </section>
        </Show>
      </div>
      <nav class="logo-detail-nav" aria-label="Просмотр логотипов">
        <button
          type="button"
          class="logo-prev"
          aria-label="Предыдущий логотип"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <span class="logo-counter" aria-hidden="true">
          {count()}
        </span>
        <button
          type="button"
          class="logo-next"
          aria-label="Следующий логотип"
          onClick={() => navigate(1)}
        >
          →
        </button>
      </nav>
    </Dialog>
  );
}

const groups = [[0], [1, 2], [3, 4], [5, 6], [7]];
function Paper(props: { index: number }) {
  const page = () => publication[props.index];
  return (
    <article class={`paper-page ${page().kind}`}>
      <p class="paper-kicker">{ru(page().kicker)}</p>
      <h2>{ru(page().title)}</h2>
      {page().image && (
        <img src={url(page().image)} alt={page().title} decoding="async" />
      )}
      <p class="paper-copy">{ru(page().copy)}</p>
      <span class="paper-number">{pad(props.index + 1)}</span>
    </article>
  );
}
function ReaderViewer(props: {
  request: Extract<ViewerRequest, { kind: "reader" }>;
}) {
  const [index, setIndex] = createSignal(0);
  let sheet!: HTMLDivElement;
  let previous = 0;
  const select = (next: number) =>
    setIndex(Math.max(0, Math.min(next, groups.length - 1)));
  const navigate = (direction: number) => select(index() + direction);
  createEffect(
    () => index(),
    (next) => {
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const direction = next >= previous ? 1 : -1;
        const animation = sheet.animate(
          [
            {
              opacity: 0.45,
              transform: `perspective(1400px) translateX(${direction * 18}px) rotateY(${direction * 4}deg)`,
            },
            { opacity: 1, transform: "none" },
          ],
          { duration: 380, easing: "ease-out" },
        );
        previous = next;
        return () => animation.cancel();
      }
    },
  );
  return (
    <Dialog
      class="publication-reader"
      label="publication-title"
      request={props.request}
      onNavigate={navigate}
    >
      <header class="reader-header">
        <div>
          <h2 id="publication-title">КОНТЕКСТ / 2025</h2>
          <p>Временный пример издания</p>
        </div>
        <p class="reader-count" aria-live="polite">
          {groups[index()].map((n) => pad(n + 1)).join("–")} /{" "}
          {pad(publication.length)}
        </p>
        <button
          type="button"
          class="reader-close"
          aria-label="Закрыть издание"
          onClick={closeViewer}
        >
          ×
        </button>
      </header>
      <div class="reader-display">
        <div class="reader-controls">
          <button
            type="button"
            class="reader-prev"
            aria-label="Предыдущая страница или разворот"
            disabled={index() === 0}
            onClick={() => navigate(-1)}
          >
            ←
          </button>
          <button
            type="button"
            class="reader-next"
            aria-label="Следующая страница или разворот"
            disabled={index() === groups.length - 1}
            onClick={() => navigate(1)}
          >
            →
          </button>
        </div>
        <div class="reader-stage" {...swipe(navigate)}>
          <div
            ref={sheet}
            class={`reader-sheet${groups[index()].length === 1 ? " single" : ""}`}
          >
            <For each={groups[index()]}>{(page) => <Paper index={page} />}</For>
          </div>
        </div>
      </div>
      <nav class="reader-thumbs" aria-label="Страницы издания">
        <For each={groups}>
          {(group, i) => {
            const label =
              i() === 0
                ? "Обложка"
                : i() === groups.length - 1
                  ? "Оборот обложки"
                  : publication[group[0]].title;
            return (
              <button
                type="button"
                aria-label={label}
                aria-current={i() === index() ? "true" : "false"}
                onClick={() => select(i())}
              >
                <span
                  class={`reader-mini${group.length === 1 ? " single" : ""}`}
                  aria-hidden="true"
                >
                  <For each={group}>{(page) => <Paper index={page} />}</For>
                </span>
                <span>{label}</span>
              </button>
            );
          }}
        </For>
      </nav>
    </Dialog>
  );
}

export default function Viewers() {
  return (
    <Show when={viewer()} keyed>
      {(request) =>
        request.kind === "gallery" ? (
          <GalleryViewer request={request} />
        ) : request.kind === "logo" ? (
          <LogoViewer request={request} />
        ) : (
          <ReaderViewer request={request} />
        )
      }
    </Show>
  );
}

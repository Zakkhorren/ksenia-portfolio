import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import { asset } from "../lib/paths";
import type { PrintPage } from "../lib/print-assets";

type Frame = { slots: (number | null)[]; spread?: number };
export type PublicationStructure =
  "pages" | "single-spread-single" | "reversed-pairs";
export function publicationFrames(
  count: number,
  structure: PublicationStructure,
  mobile: boolean,
): Frame[] {
  if (mobile)
    return Array.from({ length: count }, (_, i) => ({ slots: [i + 1] }));
  if (structure === "reversed-pairs")
    return Array.from({ length: Math.ceil(count / 2) }, (_, i) => ({
      slots: [i * 2 + 2 <= count ? i * 2 + 2 : null, i * 2 + 1],
    }));
  if (structure === "single-spread-single")
    return [
      { slots: [null, 1] },
      { slots: [null, null], spread: 2 },
      { slots: [3, null] },
    ];
  const result: Frame[] = [{ slots: [null, 1] }];
  for (let p = 2; p <= count; p += 2)
    result.push({ slots: [p, p + 1 <= count ? p + 1 : null] });
  return result;
}
const sources = (frame: Frame) =>
  frame.spread
    ? [frame.spread]
    : frame.slots.filter((p): p is number => p !== null);

export default function Publication(props: {
  pages: PrintPage[];
  title: string;
  structure?: PublicationStructure;
}) {
  const media = matchMedia("(max-width: 650px)");
  const [mobile, setMobile] = createSignal(media.matches);
  const [index, setIndex] = createSignal(0);
  const [zoom, setZoom] = createSignal(false);
  const [size, setSize] = createSignal({ width: 0, height: 0 });
  const [turn, setTurn] = createSignal<{
    from: Frame;
    to: Frame;
    direction: number;
  } | null>(null);
  const [loading, setLoading] = createSignal(false);
  let space!: HTMLDivElement, windowElement!: HTMLDivElement;
  let timer: ReturnType<typeof setTimeout> | undefined,
    request = 0;
  const structure = props.structure || "pages";
  const frames = () =>
    publicationFrames(props.pages.length, structure, mobile());
  const ratio = () =>
    ((mobile() ? 1 : 2) * props.pages[0].width) / props.pages[0].height;
  const measure = () => {
    const width = Math.min(space.clientWidth, space.clientHeight * ratio());
    setSize({ width, height: width / ratio() });
  };
  const resetZoom = () => {
    setZoom(false);
    windowElement?.scrollTo(0, 0);
  };
  const change = () => {
    const first = sources(frames()[index()])[0];
    clearTimeout(timer);
    request++;
    setTurn(null);
    setLoading(false);
    resetZoom();
    setMobile(media.matches);
    setIndex(frames().findIndex((frame) => sources(frame).includes(first)));
    measure();
  };
  media.addEventListener("change", change);
  createEffect(
    () => true,
    () => {
      const observer = new ResizeObserver(measure);
      observer.observe(space);
      measure();
      return () => observer.disconnect();
    },
  );
  onCleanup(() => {
    request++;
    clearTimeout(timer);
    media.removeEventListener("change", change);
  });
  const go = async (direction: number) => {
    const next = index() + direction;
    if (turn() || loading() || next < 0 || next >= frames().length) return;
    const id = ++request,
      from = frames()[index()],
      to = frames()[next];
    setLoading(true);
    await Promise.all(
      sources(to).map(async (p) => {
        const img = new Image();
        img.src = asset(props.pages[p - 1].file);
        await img.decode().catch(() => {});
      }),
    );
    if (id !== request) return;
    setLoading(false);
    resetZoom();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTurn({ from, to, direction });
      timer = setTimeout(() => setTurn(null), mobile() ? 180 : 340);
    }
    setIndex(next);
  };
  createEffect(
    () => [index(), mobile()] as const,
    ([i]) => {
      const next = frames()[i + 1];
      if (next)
        for (const p of sources(next)) {
          const img = new Image();
          img.src = asset(props.pages[p - 1].file);
        }
    },
  );
  const page = (number: number | null | undefined, animated = false) =>
    number ? (
      <img
        src={asset(props.pages[number - 1].file)}
        width={props.pages[number - 1].width}
        height={props.pages[number - 1].height}
        alt={
          animated
            ? ""
            : `${props.title} — ${structure === "single-spread-single" && number === 2 ? "разворот" : `страница ${number}`}`
        }
        data-page={animated ? undefined : number}
        draggable={false}
      />
    ) : (
      <span class="book-blank" aria-hidden="true" />
    );
  // A spread remains one original image. Only the moving leaf clips an exact half at the spine.
  const half = (frame: Frame, side: number) =>
    frame.spread ? (
      <div class={`book-half ${side ? "half-right" : "half-left"}`}>
        {page(frame.spread, true)}
      </div>
    ) : (
      page(frame.slots[side], true)
    );
  let start: [number, number] | undefined;
  const keyboard = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      void go(e.key === "ArrowRight" ? 1 : -1);
    }
  };
  window.addEventListener("keydown", keyboard);
  onCleanup(() => window.removeEventListener("keydown", keyboard));
  const toggleZoom = () => {
    setZoom(!zoom());
    requestAnimationFrame(() =>
      windowElement.scrollTo(
        (windowElement.scrollWidth - windowElement.clientWidth) / 2,
        (windowElement.scrollHeight - windowElement.clientHeight) / 2,
      ),
    );
  };
  return (
    <div class={`print-publication${mobile() ? " single-page" : ""}`}>
      <div class="book-space" ref={space}>
        <div
          class={`book-window${zoom() ? " is-zoomed" : ""}`}
          ref={windowElement}
          onTouchStart={(e) => {
            start =
              e.touches.length === 1
                ? [e.touches[0].clientX, e.touches[0].clientY]
                : undefined;
          }}
          onTouchEnd={(e) => {
            if (!start || zoom()) return;
            const dx = e.changedTouches[0].clientX - start[0],
              dy = e.changedTouches[0].clientY - start[1];
            start = undefined;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
              void go(dx < 0 ? 1 : -1);
          }}
        >
          <div class="book-canvas">
            <div
              class="book-stage"
              style={{
                width: `${size().width * (zoom() ? 2 : 1)}px`,
                height: `${size().height * (zoom() ? 2 : 1)}px`,
              }}
            >
              <div
                class={`book-spread${mobile() && turn() ? (turn()!.direction > 0 ? " mobile-next" : " mobile-previous") : ""}`}
              >
                <For each={frames()[index()].slots}>
                  {(p) => <div class="book-page">{page(p)}</div>}
                </For>
                <Show when={frames()[index()].spread}>
                  {(p) => <div class="book-whole-spread">{page(p())}</div>}
                </Show>
              </div>
              <Show when={!mobile() && turn()}>
                {(t) => (
                  <>
                    <div
                      class={`book-rest ${t().direction > 0 ? "rest-left" : "rest-right"}`}
                      aria-hidden="true"
                    >
                      {half(t().from, t().direction > 0 ? 0 : 1)}
                    </div>
                    <div
                      class={`book-leaf ${t().direction > 0 ? "forward" : "backward"}`}
                      aria-hidden="true"
                    >
                      <div class="leaf-face leaf-front">
                        {half(t().from, t().direction > 0 ? 1 : 0)}
                      </div>
                      <div class="leaf-face leaf-back">
                        {half(t().to, t().direction > 0 ? 0 : 1)}
                      </div>
                    </div>
                  </>
                )}
              </Show>
            </div>
          </div>
        </div>
      </div>
      <div class="book-controls">
        <button
          type="button"
          aria-label="Предыдущая страница"
          disabled={index() === 0 || !!turn() || loading()}
          onClick={() => void go(-1)}
        >
          ←
        </button>
        <span class="book-position" aria-live="polite">
          {sources(frames()[index()]).join(
            structure === "reversed-pairs" && !mobile() ? " | " : "–",
          )}{" "}
          / {props.pages.length}
        </span>
        <button
          type="button"
          aria-label="Следующая страница"
          disabled={index() === frames().length - 1 || !!turn() || loading()}
          onClick={() => void go(1)}
        >
          →
        </button>
      </div>
      <Show when={mobile()}>
        <button
          class="book-zoom"
          type="button"
          aria-pressed={zoom() ? "true" : "false"}
          onClick={toggleZoom}
        >
          {zoom() ? "Уменьшить" : "Увеличить"}
        </button>
      </Show>
    </div>
  );
}

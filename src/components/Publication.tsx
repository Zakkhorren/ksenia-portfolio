import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import { asset } from "../lib/paths";
import type { PrintPage } from "../lib/print-assets";
export function publicationSpreads(count: number): (number | null)[][] {
  const result: (number | null)[][] = [[null, 1]];
  for (let p = 2; p <= count; p += 2)
    result.push([p, p + 1 <= count ? p + 1 : null]);
  return result;
}
export default function Publication(props: {
  pages: PrintPage[];
  title: string;
}) {
  const media = matchMedia("(max-width: 650px)");
  const [mobile, setMobile] = createSignal(media.matches),
    [index, setIndex] = createSignal(0);
  const [turn, setTurn] = createSignal<{
    from: (number | null)[];
    to: (number | null)[];
    direction: number;
  } | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined,
    request = 0;
  const frames = () =>
    mobile()
      ? props.pages.map((_, i) => [i + 1])
      : publicationSpreads(props.pages.length);
  const change = () => {
    const first = frames()[index()].find((p) => p !== null) || 1;
    setTurn(null);
    clearTimeout(timer);
    request++;
    setMobile(media.matches);
    setIndex(media.matches ? first - 1 : Math.floor(first / 2));
  };
  media.addEventListener("change", change);
  onCleanup(() => {
    request++;
    clearTimeout(timer);
    media.removeEventListener("change", change);
  });
  const go = async (direction: number) => {
    const next = index() + direction;
    if (turn() || next < 0 || next >= frames().length) return;
    const id = ++request,
      from = frames()[index()],
      to = frames()[next];
    await Promise.all(
      to
        .filter((p) => p !== null)
        .map(async (p) => {
          const image = new Image();
          image.src = asset(props.pages[p! - 1].file);
          await image.decode().catch(() => {});
        }),
    );
    if (id !== request) return;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTurn({ from, to, direction });
      timer = setTimeout(() => setTurn(null), 650);
    }
    setIndex(next);
  };
  // Prepare only the next spread, keeping the publication light on initial open.
  createEffect(
    () => index(),
    (i) => {
      for (const p of frames()[i + 1] || [])
        if (p) {
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
        alt={animated ? "" : `${props.title} — страница ${number}`}
        data-page={animated ? undefined : number}
        draggable={false}
      />
    ) : (
      <span class="book-blank" aria-hidden="true" />
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
  return (
    <div class={`print-publication${mobile() ? " single-page" : ""}`}>
      <div
        class="book-stage"
        style={{
          "--book-ratio": String(
            ((mobile() ? 1 : 2) * props.pages[0].width) / props.pages[0].height,
          ),
        }}
        onTouchStart={(e) => {
          start = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
        }}
        onTouchEnd={(e) => {
          if (!start) return;
          const dx = e.changedTouches[0].clientX - start[0],
            dy = e.changedTouches[0].clientY - start[1];
          start = undefined;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
            void go(dx < 0 ? 1 : -1);
        }}
      >
        <div class="book-spread">
          <For each={frames()[index()]}>
            {(p) => <div class="book-page">{page(p)}</div>}
          </For>
        </div>
        <Show when={turn()}>
          {(t) => (
            <>
              <Show when={!mobile()}>
                <div
                  class={`book-rest ${t().direction > 0 ? "rest-left" : "rest-right"}`}
                  aria-hidden="true"
                >
                  {page(t().from[t().direction > 0 ? 0 : 1], true)}
                </div>
              </Show>
              <div
                class={`book-leaf ${t().direction > 0 ? "forward" : "backward"}`}
                aria-hidden="true"
              >
                <div class="leaf-face leaf-front">
                  {page(
                    mobile()
                      ? t().from[0]
                      : t().from[t().direction > 0 ? 1 : 0],
                    true,
                  )}
                </div>
                <div class="leaf-face leaf-back">
                  {page(
                    mobile() ? t().to[0] : t().to[t().direction > 0 ? 0 : 1],
                    true,
                  )}
                </div>
              </div>
            </>
          )}
        </Show>
      </div>
      <div class="book-controls">
        <button
          type="button"
          aria-label="Предыдущая страница"
          disabled={index() === 0 || !!turn()}
          onClick={() => void go(-1)}
        >
          ←
        </button>
        <span class="book-position" aria-live="polite">
          {frames()[index()].filter(Boolean).join("–")} / {props.pages.length}
        </span>
        <button
          type="button"
          aria-label="Следующая страница"
          disabled={index() === frames().length - 1 || !!turn()}
          onClick={() => void go(1)}
        >
          →
        </button>
      </div>
    </div>
  );
}

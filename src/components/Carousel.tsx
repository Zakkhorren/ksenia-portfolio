import { createSignal, For } from "solid-js";
import data from "../data/content.json";
import { Image } from "./Shared";
import { url } from "../lib/paths";
import { pad, ru } from "../lib/typography";
import assets from "../data/case-assets.json";
const projects = ["fashion-lab", "riviera", "expresso"].map((slug) => ({
  ...data.projects.find((p) => p.slug === slug)!,
  kind: "project" as const,
}));
const slides = [
  ...projects,
  ...[
    ["ТУТ", "Кое-чего не хватает"],
    ["БУДЕТ", "Работа кипит"],
    ["ЕЩЁ", "Дайте дизайнеру минутку"],
    ["КОЕ-ЧТО", ":)"],
  ].map(([title, type]) => ({
    title,
    type,
    slug: "",
    kind: "placeholder" as const,
  })),
];
export default function Carousel() {
  const [active, setActive] = createSignal(0);
  const select = (index: number) =>
    setActive((index + slides.length) % slides.length);
  let gesture: { x: number; y: number; id: number } | undefined;
  let suppressClickUntil = 0;
  const position = (index: number) => {
    const offset = (index - active() + slides.length) % slides.length;
    return offset > Math.floor(slides.length / 2)
      ? offset - slides.length
      : offset;
  };
  return (
    <section class="selected-projects" id="work" aria-label="Избранные проекты">
      <div class="section-meta">
        <div class="carousel-meta">
          <span class="carousel-count" aria-live="polite" aria-atomic="true">
            {pad(active() + 1)} / {pad(slides.length)}
          </span>
          <span class="meta-rule" aria-hidden="true" />
          <p class="eyebrow">ИЗБРАННЫЕ ПРОЕКТЫ</p>
        </div>
        <div class="carousel-controls">
          <button
            type="button"
            class="carousel-prev"
            aria-label="Предыдущий проект"
            onClick={() => select(active() - 1)}
          >
            ←
          </button>
          <span class="meta-rule" aria-hidden="true" />
          <button
            type="button"
            class="carousel-next"
            aria-label="Следующий проект"
            onClick={() => select(active() + 1)}
          >
            →
          </button>
        </div>
      </div>
      <div
        class="featured-viewport"
        role="region"
        aria-roledescription="карусель"
        aria-label="Семь избранных проектов"
        tabindex="0"
        onKeyDown={(event) => {
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            select(active() + (event.key === "ArrowRight" ? 1 : -1));
          }
        }}
        onPointerDown={(event) => {
          if (event.button === 0)
            gesture = {
              x: event.clientX,
              y: event.clientY,
              id: event.pointerId,
            };
        }}
        onPointerUp={(event) => {
          if (!gesture || gesture.id !== event.pointerId) return;
          const dx = event.clientX - gesture.x,
            dy = event.clientY - gesture.y;
          gesture = undefined;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            suppressClickUntil = Date.now() + 400;
            select(active() + (dx < 0 ? 1 : -1));
          }
        }}
        onPointerCancel={() => {
          gesture = undefined;
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        <For each={slides}>
          {(slide, index) => (
            <article
              class="project-slide"
              role="group"
              aria-roledescription="слайд"
              aria-label={`${pad(index() + 1)} из ${pad(slides.length)}: ${slide.title}`}
              aria-hidden={index() !== active() ? "true" : "false"}
              data-position={position(index())}
              data-index={index()}
              data-project={slide.slug || `placeholder-${index() + 1}`}
              onClick={(event) => {
                if (Date.now() < suppressClickUntil) {
                  event.preventDefault();
                  return;
                }
                if (index() !== active()) {
                  event.preventDefault();
                  select(index());
                }
              }}
            >
              {slide.kind === "project" ? (
                <a
                  class={`featured-card ${slide.class} supplied-cover`}
                  href={url(`/projects/${slide.slug}/`)}
                  tabindex={index() === active() ? 0 : -1}
                >
                  <Image
                    name={assets.covers[index()].file}
                    alt={slide.alt}
                    priority={index() === 0}
                  />
                  <div class="featured-content">
                    <p class="project-number">
                      {pad(index() + 1)}
                      <span aria-hidden="true" />
                    </p>
                    <h2>{slide.title}</h2>
                    <p class="project-description">{ru(slide.type)}</p>
                  </div>
                </a>
              ) : (
                <div class="featured-card project-placeholder supplied-cover">
                  <Image
                    name={assets.covers[index()].file}
                    alt={`Обложка будущего проекта ${index() + 1}`}
                  />
                  <div class="featured-content">
                    <p class="project-number">
                      {pad(index() + 1)}
                      <span aria-hidden="true" />
                    </p>
                    <h2>{slide.title}</h2>
                    <p class="project-description">{ru(slide.type)}</p>
                  </div>
                </div>
              )}
            </article>
          )}
        </For>
      </div>
    </section>
  );
}

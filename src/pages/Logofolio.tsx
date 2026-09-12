import { For } from "solid-js";
import logos from "../data/logofolio.json";
import { CollectionHeader, EndNavigation } from "../components/Shared";
import { asset } from "../lib/paths";
import { openLogo } from "../lib/viewer-state";
import { ru } from "../lib/typography";
export default function Logofolio() {
  return (
    <>
      <CollectionHeader slug="logofolio" />
      <svg width="0" height="0" aria-hidden="true" class="logo-color-defs">
        <defs>
          <filter id="logo-cream" color-interpolation-filters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.925490196 0 0 0 0 0.909803922 0 0 0 0 0.874509804 0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
      <div class="logo-field">
        <For each={[2026, 2025, 2024, 2023]}>
          {(year) => (
            <section
              class={`logo-chapter year-${year}`}
              aria-label={`Логотипы ${year}`}
            >
              <For each={logos.filter((p) => p.year === year)}>
                {(project) => {
                  const cover = project.assets[0];
                  const [x, y, width, height] = cover.artwork_bounds || [
                    0,
                    0,
                    cover.width,
                    cover.height,
                  ];
                  const pad = height * 0.01,
                    ratio = (width + pad * 2) / (height + pad * 2);
                  const shape =
                    ratio >= 3 ? "wide" : ratio < 1.6 ? "tall" : "standard";
                  return (
                    <button
                      type="button"
                      class={`logo-project logo-${project.id}`}
                      data-logo={project.id}
                      aria-label={`Смотреть ${project.name}, ${year}`}
                      onClick={(event) =>
                        openLogo(logos.indexOf(project), event.currentTarget)
                      }
                    >
                      <span class={`logo-artwork logo-shape-${shape}`}>
                        <svg
                          class="logo-art logo-monochrome"
                          viewBox={`${x - pad} ${y - pad} ${width + pad * 2} ${height + pad * 2}`}
                          width={width + pad * 2}
                          height={height + pad * 2}
                          style={{ "--logo-ratio": ratio }}
                          aria-hidden="true"
                        >
                          <image
                            href={asset(`logofolio/${cover.file}`)}
                            x="0"
                            y="0"
                            width={cover.width}
                            height={cover.height}
                          />
                        </svg>
                      </span>
                      <span class="logo-caption">
                        <span class="logo-caption-title">
                          {project.name} / {year}
                        </span>
                        <span class="logo-caption-context">
                          {ru(project.context)}
                        </span>
                      </span>
                      <span class="logo-cue" aria-hidden="true">
                        СМОТРЕТЬ →
                      </span>
                    </button>
                  );
                }}
              </For>
            </section>
          )}
        </For>
      </div>
      <EndNavigation slug="logofolio" />
    </>
  );
}

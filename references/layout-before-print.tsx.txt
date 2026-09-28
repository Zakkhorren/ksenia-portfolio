import { url } from "../lib/paths";
import { ru } from "../lib/typography";
import { CollectionHeader, EndNavigation } from "../components/Shared";
import { openGallery, openReader } from "../lib/viewer-state";

export default function Layout() {
  const slug = "layout";
  return (
    <>
      <CollectionHeader slug={slug} />

      <p class="collection-descriptor">
        {ru("РЕДАКЦИОННЫЙ ДИЗАЙН / ПЕЧАТЬ / МНОГОСТРАНИЧНЫЕ ИЗДАНИЯ")}
      </p>
      <div class="collection-grid layout-grid">
        <button
          type="button"
          class="work-tile wide-tile magazine-open"
          aria-label="Открыть издание КОНТЕКСТ"
          onClick={(event) => openReader(event.currentTarget)}
        >
          <span class="tile-image">
            <img
              src={url("/assets/editorial.png")}
              alt="Журнальная композиция"
              class=""
              loading="lazy"
              decoding="async"
            />
          </span>
          <span class="tile-caption">
            <span>
              <span class="tile-title">{ru("КОНТЕКСТ / 2025")}</span>
              <span class="tile-type">
                {ru("Временный пример журнала · открыть издание →")}
              </span>
            </span>
          </span>
        </button>
        <button
          type="button"
          class="work-tile"
          aria-label="Открыть: Печатная графика"
          onClick={(event) => openGallery("layout-1", 0, event.currentTarget)}
        >
          <span
            class="tile-image image-crop zoom"
            style={{ "--crop-x": "-0%", "--crop-y": "-25%" }}
          >
            <img
              src={url("/assets/editorial.png")}
              alt="Печатная графика"
              class=""
              loading="lazy"
              decoding="async"
            />
            <span class="tile-open" aria-hidden="true">
              {ru("↗")}
            </span>
          </span>
          <span class="tile-caption">
            <span>
              <span class="tile-title">{ru("Печатная графика")}</span>
              <span class="tile-type">{ru("Плакат")}</span>
            </span>
          </span>
        </button>
        <button
          type="button"
          class="work-tile"
          aria-label="Открыть: Пространство и свет"
          onClick={(event) => openGallery("layout-2", 0, event.currentTarget)}
        >
          <span
            class="tile-image image-crop zoom"
            style={{ "--crop-x": "-20%", "--crop-y": "-25%" }}
          >
            <img
              src={url("/assets/editorial.png")}
              alt="Пространство и свет"
              class=""
              loading="lazy"
              decoding="async"
            />
            <span class="tile-open" aria-hidden="true">
              {ru("↗")}
            </span>
          </span>
          <span class="tile-caption">
            <span>
              <span class="tile-title">{ru("Пространство и свет")}</span>
              <span class="tile-type">{ru("Разворот")}</span>
            </span>
          </span>
        </button>
        <button
          type="button"
          class="work-tile"
          aria-label="Открыть: FORMA"
          onClick={(event) => openGallery("layout-3", 0, event.currentTarget)}
        >
          <span
            class="tile-image image-crop zoom"
            style={{ "--crop-x": "-40%", "--crop-y": "-25%" }}
          >
            <img
              src={url("/assets/editorial.png")}
              alt="FORMA"
              class=""
              loading="lazy"
              decoding="async"
            />
            <span class="tile-open" aria-hidden="true">
              {ru("↗")}
            </span>
          </span>
          <span class="tile-caption">
            <span>
              <span class="tile-title">{ru("FORMA")}</span>
              <span class="tile-type">{ru("Печатные материалы")}</span>
            </span>
          </span>
        </button>
        <button
          type="button"
          class="work-tile"
          aria-label="Открыть: Идеи и предметы"
          onClick={(event) => openGallery("layout-4", 0, event.currentTarget)}
        >
          <span
            class="tile-image image-crop zoom"
            style={{ "--crop-x": "-60%", "--crop-y": "-25%" }}
          >
            <img
              src={url("/assets/editorial.png")}
              alt="Идеи и предметы"
              class=""
              loading="lazy"
              decoding="async"
            />
            <span class="tile-open" aria-hidden="true">
              {ru("↗")}
            </span>
          </span>
          <span class="tile-caption">
            <span>
              <span class="tile-title">{ru("Идеи и предметы")}</span>
              <span class="tile-type">{ru("Книжная вёрстка")}</span>
            </span>
          </span>
        </button>
      </div>

      <EndNavigation slug={slug} />
    </>
  );
}

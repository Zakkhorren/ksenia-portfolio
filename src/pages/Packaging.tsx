import { url } from "../lib/paths";
import { ru } from "../lib/typography";
import { CollectionHeader, EndNavigation } from "../components/Shared";

export default function Packaging() {
  const slug = "packaging";
  return (
    <>
      <CollectionHeader slug={slug} />

      <div class="packaging-board">
        <figure class="showcase board-hero">
          <div class="showcase-image">
            <img
              src={url("/assets/packaging.png")}
              alt="RITUAL"
              class=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            <span class="tile-title">{ru("RITUAL")}</span>
            <span class="tile-type">{ru("Система упаковки")}</span>
          </figcaption>
        </figure>
        <figure class="showcase board-detail detail-jar">
          <div class="showcase-image">
            <img
              src={url("/assets/packaging.png")}
              alt="RITUAL"
              class=""
              loading="lazy"
              decoding="async"
              style={{ "object-position": "0% 30%" }}
            />
          </div>
          <figcaption>
            <span class="tile-title">{ru("RITUAL")}</span>
            <span class="tile-type">{ru("Крем / банка и этикетка")}</span>
          </figcaption>
        </figure>
        <figure class="showcase board-detail detail-pouch">
          <div class="showcase-image">
            <img
              src={url("/assets/packaging.png")}
              alt="RITUAL"
              class=""
              loading="lazy"
              decoding="async"
              style={{ "object-position": "100% 10%" }}
            />
          </div>
          <figcaption>
            <span class="tile-title">{ru("RITUAL")}</span>
            <span class="tile-type">{ru("Кофе / пакет")}</span>
          </figcaption>
        </figure>
        <figure class="showcase board-detail detail-tube">
          <div class="showcase-image">
            <img
              src={url("/assets/packaging.png")}
              alt="RITUAL"
              class=""
              loading="lazy"
              decoding="async"
              style={{ "object-position": "0% 100%" }}
            />
          </div>
          <figcaption>
            <span class="tile-title">{ru("RITUAL")}</span>
            <span class="tile-type">{ru("Уход / туба")}</span>
          </figcaption>
        </figure>
      </div>
      <EndNavigation slug={slug} />
    </>
  );
}

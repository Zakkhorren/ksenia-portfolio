import { For } from "solid-js";
import images from "../data/marketplace.json";
import { CollectionHeader, EndNavigation } from "../components/Shared";
import { asset } from "../lib/paths";
import { openGallery } from "../lib/viewer-state";
const order = [
  "asset-04.jpg",
  "asset-01.jpg",
  "asset-05.jpg",
  "asset-02.jpg",
  "asset-06.jpg",
  "asset-03.jpg",
  "asset-07.jpg",
  "asset-04.jpg",
  "asset-08.jpg",
  "asset-05.jpg",
  "asset-01.jpg",
];
function CatalogImage(props: {
  file: string;
  alt: string;
  priority?: boolean;
}) {
  const image = images.find((i) => i.file === props.file)!;
  return (
    <img
      src={asset(`marketplace/${props.file.replace(".jpg", ".webp")}`)}
      alt={props.alt}
      width={image.width}
      height={image.height}
      loading={props.priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
export default function Marketplace() {
  return (
    <>
      <CollectionHeader slug="marketplace" />
      <p class="collection-descriptor">
        КАРТОЧКИ ТОВАРОВ / ИНФОГРАФИКА / RICH-КОНТЕНТ
      </p>
      <div class="marketplace-catalog marketplace-supplied">
        <article class="product-listing">
          <button
            class="product-open"
            type="button"
            aria-label="Открыть: Магний цитрат + витамин B6"
            onClick={(event) =>
              openGallery("market-magnesium", 0, event.currentTarget)
            }
          >
            <CatalogImage
              file="asset-09.jpg"
              alt="Магний цитрат + витамин B6"
              priority
            />
            <span class="product-name">Магний цитрат + витамин B6</span>
          </button>
          <button
            class="view-cards"
            type="button"
            onClick={(event) =>
              openGallery("market-magnesium", 0, event.currentTarget)
            }
          >
            СМОТРЕТЬ КАРТОЧКИ →
          </button>
        </article>
        <For each={order}>
          {(file, index) => (
            <>
              {index() === 3 && (
                <div class="market-rich-placeholder">
                  <CatalogImage
                    file="asset-12.jpg"
                    alt="Rich Content — сюда тоже доберусь"
                  />
                </div>
              )}
              <div class="market-placeholder">
                <CatalogImage file={file} alt="Место для будущего проекта" />
              </div>
            </>
          )}
        </For>
      </div>
      <EndNavigation slug="marketplace" />
    </>
  );
}

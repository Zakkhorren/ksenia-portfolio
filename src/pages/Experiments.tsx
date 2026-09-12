import { url } from "../lib/paths";
import { ru } from "../lib/typography";
import { CollectionHeader, EndNavigation } from "../components/Shared";

export default function Experiments() {
  const slug = "experiments";
  return (
    <>
      <CollectionHeader slug={slug} />

      <div class="experiment-collage">
        <figure class="showcase ">
          <div class="showcase-image">
            <img
              src={url("/assets/orange-metro.jpg")}
              alt="Геометрия города"
              class=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            <span class="tile-title">{ru("Геометрия города")}</span>
            <span class="tile-type">{ru("Архитектура / фото")}</span>
          </figcaption>
        </figure>
        <figure class="showcase ">
          <div class="showcase-image">
            <img
              src={url("/assets/lake-canoe.jpg")}
              alt="За городом"
              class=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            <span class="tile-title">{ru("За городом")}</span>
            <span class="tile-type">{ru("Путешествия / фото")}</span>
          </figcaption>
        </figure>
        <figure class="showcase ">
          <div class="showcase-image">
            <img
              src={url("/assets/orange-still-life.jpg")}
              alt="В поисках равновесия"
              class=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            <span class="tile-title">{ru("В поисках равновесия")}</span>
            <span class="tile-type">{ru("Цвет / композиция")}</span>
          </figcaption>
        </figure>
        <figure class="showcase ">
          <div class="showcase-image">
            <img
              src={url("/assets/editorial.png")}
              alt="Между строк"
              class=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            <span class="tile-title">{ru("Между строк")}</span>
            <span class="tile-type">{ru("Типографика / графика")}</span>
          </figcaption>
        </figure>
        <figure class="showcase ">
          <div class="showcase-image">
            <img
              src={url("/assets/alpine-hiker.jpg")}
              alt="Выше в горы"
              class=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            <span class="tile-title">{ru("Выше в горы")}</span>
            <span class="tile-type">{ru("Природа / фото")}</span>
          </figcaption>
        </figure>
        <figure class="showcase ">
          <div class="showcase-image">
            <img
              src={url("/assets/fashion-rack.jpg")}
              alt="Немного проще"
              class=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            <span class="tile-title">{ru("Немного проще")}</span>
            <span class="tile-type">{ru("Форма / ритм")}</span>
          </figcaption>
        </figure>
        <figure class="showcase ">
          <div class="showcase-image">
            <img
              src={url("/assets/clouds.jpg")}
              alt="Посмотреть вверх"
              class=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            <span class="tile-title">{ru("Посмотреть вверх")}</span>
            <span class="tile-type">{ru("Небо / фото")}</span>
          </figcaption>
        </figure>
      </div>
      <p class="that-is-all">
        {ru("ВОТ И ВСЁ. ")}
        <em>{ru("пока что :)")}</em>
      </p>
      <EndNavigation slug={slug} />
    </>
  );
}

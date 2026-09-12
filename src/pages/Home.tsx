import { url } from "../lib/paths";
import { ru } from "../lib/typography";
import Carousel from "../components/Carousel";
import { Contact } from "../components/Shared";

export default function Home() {
  return (
    <>
      <section class="home-hero" aria-label="Знакомство">
        <h1 class="hero-title">
          <span>{ru("THINGS")}</span>
          <span>{ru("I’VE MADE")}</span>
          <em class="scribble">{ru("so far")}</em>
        </h1>
        <div class="hero-intro">
          <p>
            {ru("Привет, меня зовут Ксения —")}
            <br />
            {ru("графический дизайнер.")}
          </p>
          <p>
            {ru("Собираю бренды, упаковку")}
            <br />
            {ru("и визуальные системы.")}
          </p>
          <p class="handwritten intro-note">
            {ru("Но иногда выходит совсем другое")}
          </p>
        </div>
      </section>

      <Carousel />

      <section id="other-things" aria-labelledby="other-title">
        <div class="other-heading">
          <h2 class="display-heading" id="other-title">
            <span>{ru("OTHER")}</span>
            <span>{ru("THINGS")}</span>
          </h2>
          <p class="handwritten other-note">
            <span>{ru("не всему нужен")}</span>
            <span>{ru("целый кейс")}</span>
          </p>
        </div>
        <div class="category-list">
          <a class="category-row logofolio" href={url("/work/logofolio/")}>
            <div class="category-copy">
              <p class="eyebrow">{ru("01 / LOGOS")}</p>
              <h3>{ru("ЛОГОТИПЫ")}</h3>
              <p class="category-description">
                {ru("знаки / леттеринг / логосистемы")}
              </p>
              <span class="category-view">
                {ru("СМОТРЕТЬ ")}
                <span class="arrow" aria-hidden="true">
                  {ru("→")}
                </span>
              </span>
            </div>
            <div class="category-image">
              <img
                src={url("/assets/branding.png")}
                alt="Фирменные карточки на тёмном камне"
                class=""
                loading="lazy"
                decoding="async"
              />
            </div>
          </a>
          <a class="category-row packaging" href={url("/work/packaging/")}>
            <div class="category-copy">
              <p class="eyebrow">{ru("02 / OBJECTS")}</p>
              <h3>{ru("УПАКОВКА")}</h3>
              <p class="category-description">
                {ru("этикетки / коробки / носители")}
              </p>
              <span class="category-view">
                {ru("СМОТРЕТЬ ")}
                <span class="arrow" aria-hidden="true">
                  {ru("→")}
                </span>
              </span>
            </div>
            <div class="category-image">
              <img
                src={url("/assets/packaging.png")}
                alt="Кремовая, чёрная и красная упаковка RITUAL"
                class=""
                loading="lazy"
                decoding="async"
              />
            </div>
          </a>
          <a class="category-row marketplace" href={url("/work/marketplace/")}>
            <div class="category-copy">
              <p class="eyebrow">{ru("03 / E-COMMERCE")}</p>
              <h3>{ru("МАРКЕТПЛЕЙСЫ")}</h3>
              <p class="category-description">
                {ru("карточки / инфографика / rich-контент")}
              </p>
              <span class="category-view">
                {ru("СМОТРЕТЬ ")}
                <span class="arrow" aria-hidden="true">
                  {ru("→")}
                </span>
              </span>
            </div>
            <div class="category-image">
              <img
                src={url("/assets/packaging.png")}
                alt="Предметная съёмка косметики и упаковки"
                class=""
                loading="lazy"
                decoding="async"
              />
              <img
                src={url("/assets/branding.png")}
                alt="Печатные карточки для бренда"
                class=""
                loading="lazy"
                decoding="async"
              />
            </div>
          </a>
          <a class="category-row layout" href={url("/work/layout/")}>
            <div class="category-copy">
              <p class="eyebrow">{ru("04 / EDITORIAL")}</p>
              <h3>{ru("ВЁРСТКА")}</h3>
              <p class="category-description">
                {ru("журналы / буклеты / многостраничные издания")}
              </p>
              <span class="category-view">
                {ru("СМОТРЕТЬ ")}
                <span class="arrow" aria-hidden="true">
                  {ru("→")}
                </span>
              </span>
            </div>
            <div class="category-image">
              <img
                src={url("/assets/editorial.png")}
                alt="Разворот журнала об архитектуре FORMA"
                class=""
                loading="lazy"
                decoding="async"
              />
            </div>
          </a>
          <a class="category-row experiments" href={url("/work/experiments/")}>
            <div class="category-copy">
              <p class="eyebrow">{ru("05 / PLAYGROUND")}</p>
              <h3>{ru("ЭКСПЕРИМЕНТЫ")}</h3>
              <p class="category-description">
                {ru("штуки / тесты / личные проекты")}
              </p>
              <span class="category-view">
                {ru("СМОТРЕТЬ ")}
                <span class="arrow" aria-hidden="true">
                  {ru("→")}
                </span>
              </span>
            </div>
            <div class="category-image">
              <img
                src={url("/assets/orange-metro.jpg")}
                alt="Архитектура станции метро"
                class=""
                loading="lazy"
                decoding="async"
              />
              <img
                src={url("/assets/orange-still-life.jpg")}
                alt="Натюрморт с апельсином"
                class=""
                loading="lazy"
                decoding="async"
              />
              <img
                src={url("/assets/clouds.jpg")}
                alt="Белые облака"
                class=""
                loading="lazy"
                decoding="async"
              />
            </div>
          </a>
        </div>
      </section>

      <section class="about-section" id="about" aria-labelledby="about-title">
        <div class="about-copy">
          <p class="eyebrow">{ru("06 / ОБО МНЕ")}</p>
          <h2 id="about-title">{ru("Привет, я Ксения.")}</h2>
          <p class="lead">
            {ru("Графический дизайнер.")}
            <br />
            {ru("Больше всего люблю айдентику и логотипы.")}
          </p>
          <p class="about-description">
            {ru(
              "Два года я работала в типографии, поэтому привыкла думать не только о том, как макет выглядит, но и о том, как его потом воспроизвести.",
            )}
          </p>
          <p class="about-description">
            {ru(
              "Мне важно понимать логику решения — почему оно работает, а не просто делать «красиво».",
            )}
          </p>
          <div class="services">
            <h3 class="about-label">
              <span>{ru("01 /")}</span>
              {ru(" ЧТО Я ДЕЛАЮ")}
            </h3>
            <ul>
              <li>{ru("Логотипы")}</li>
              <li>{ru("Айдентика")}</li>
              <li>{ru("Упаковка")}</li>
              <li>{ru("Полиграфия и вёрстка")}</li>
              <li>{ru("Типографика")}</li>
              <li>{ru("Препресс и производство")}</li>
            </ul>
          </div>
          <div class="tools-line">
            <h3 class="about-label">
              <span>{ru("02 /")}</span>
              {ru(" ИНСТРУМЕНТЫ")}
            </h3>
            <ul>
              <li>{ru("Adobe Illustrator")}</li>
              <li>{ru("Adobe InDesign")}</li>
              <li>{ru("Adobe Photoshop")}</li>
              <li>{ru("CorelDRAW")}</li>
            </ul>
          </div>
        </div>
        <div class="process" aria-label="HOW I WORK">
          <div class="outline-word" aria-hidden="true">
            {ru("HOW")}
          </div>
          <div class="process-middle">
            <span class="outline-i" aria-hidden="true">
              {ru("I")}
            </span>
            <ol class="process-list">
              <li>
                <span class="process-number">{ru("01")}</span>
                <div>
                  <h3>{ru("РАЗБИРАЮСЬ В ЗАДАЧЕ")}</h3>
                  <p>
                    {ru(
                      "Сначала разбираюсь в задаче, её контексте и ограничениях.",
                    )}
                  </p>
                </div>
              </li>
              <li>
                <span class="process-number">{ru("02")}</span>
                <div>
                  <h3>{ru("ОБЪЯСНЯЮ РЕШЕНИЯ")}</h3>
                  <p>
                    {ru(
                      "Не просто показываю результат — могу объяснить логику решения.",
                    )}
                  </p>
                </div>
              </li>
              <li>
                <span class="process-number">{ru("03")}</span>
                <div>
                  <h3>{ru("СЛЫШУ ОБРАТНУЮ СВЯЗЬ")}</h3>
                  <p>{ru("Спокойно обсуждаю правки и работаю с ними.")}</p>
                </div>
              </li>
              <li>
                <span class="process-number">{ru("04")}</span>
                <div>
                  <h3>{ru("ДЕРЖУ ПРОЦЕСС ПОД КОНТРОЛЕМ")}</h3>
                  <p>
                    {ru("Расставляю приоритеты и предупреждаю о проблемах.")}
                  </p>
                </div>
              </li>
              <li>
                <span class="process-number">{ru("05")}</span>
                <div>
                  <h3>{ru("ПРЕДЛАГАЮ НАПРАВЛЕНИЕ")}</h3>
                  <p>{ru("Показываю варианты, но не навязываю решение.")}</p>
                </div>
              </li>
              <li>
                <span class="process-number">{ru("06")}</span>
                <div>
                  <h3>{ru("ДОВОЖУ ДО ФИНАЛА")}</h3>
                  <p>
                    {ru(
                      "Проверяю детали и довожу макет до готового результата.",
                    )}
                  </p>
                </div>
              </li>
            </ol>
          </div>
          <div class="outline-word outline-work" aria-hidden="true">
            {ru("РАБОТЫ")}
          </div>
        </div>
      </section>

      <section class="final-section" aria-label="Образование и контакты">
        <div class="education-copy">
          <p class="eyebrow">{ru("03 / ОБРАЗОВАНИЕ")}</p>
          <div class="education-entry">
            <h2>{ru("ГРАФИЧЕСКИЙ ДИЗАЙН")}</h2>
            <div class="education-details">
              <div>
                <p>
                  {ru(
                    "Московский издательско-полиграфический колледж им. Ивана Фёдорова",
                  )}
                </p>
                <p class="education-status">{ru("Красный диплом")}</p>
              </div>
              <p class="handwritten award-note">
                <span>{ru("☆ 3 место · 2024")}</span>
                <br />
                {ru("«Профессионалы»")}
                <br />
                {ru("Графический дизайн")}
              </p>
            </div>
          </div>
          <div class="education-entry">
            <h2>{ru("РЕКЛАМА И ПРОДВИЖЕНИЕ СМИ")}</h2>
            <p>{ru("НИУ «МЭИ»")}</p>
            <p class="education-status">{ru("Учусь сейчас")}</p>
          </div>
        </div>
        <figure class="education-image">
          <img
            width="2048"
            height="1537"
            src={url("/assets/ksenia-altai.jpg")}
            alt="Путешественник на горном хребте"
            class=""
            loading="lazy"
            decoding="async"
          />
          <figcaption class="handwritten photo-note">
            {ru("Когда я не занимаюсь дизайном,")}
            <br />
            {ru("скорее всего, я где-нибудь")}
            <br />
            {ru("с камерой :)")}
          </figcaption>
        </figure>
        <Contact />
      </section>
    </>
  );
}

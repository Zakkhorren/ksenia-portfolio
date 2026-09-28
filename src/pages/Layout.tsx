import { CollectionHeader, EndNavigation } from "../components/Shared";
import { ru } from "../lib/typography";
import "../styles/print.css";

// Replace each labelled slot with approved imagery while keeping its ratio.
function PrintSlot(props: {
  id: string;
  title: string;
  detail: string;
  ratio: string;
  tone?: string;
}) {
  return (
    <figure class={`print-slot ${props.tone || ""}`} data-slot={props.id}>
      <div
        class="print-placeholder"
        style={{ "aspect-ratio": props.ratio }}
        role="img"
        aria-label={`Место для изображения: ${props.title}. ${props.detail}`}
      >
        <span class="print-slot-mark" aria-hidden="true">
          +
        </span>
        <span class="print-slot-label">МЕСТО ДЛЯ ИЗОБРАЖЕНИЯ</span>
        <span class="print-slot-format">{props.detail}</span>
      </div>
      <figcaption>
        {ru(props.title)}
        <span>{ru(props.detail)}</span>
      </figcaption>
    </figure>
  );
}
function SectionHeading(props: {
  number: string;
  title: string;
  english: string;
}) {
  return (
    <header class="print-section-heading">
      <span class="print-number">{props.number} /</span>
      <div>
        <h2>{props.title}</h2>
        <p class="eyebrow">{props.english}</p>
      </div>
    </header>
  );
}
export default function Layout() {
  return (
    <>
      <CollectionHeader slug="layout" />
      <div class="print-page">
        <div class="print-intro">
          <div class="print-intro-copy">
            <p class="eyebrow">PRINT / EDITORIAL / MATERIALS</p>
            <p class="print-statement">
              На бумаге.
              <br />В руках.
              <br />
              <em>В деталях.</em>
            </p>
            <p class="print-status">
              Раздел собирается. Ниже — места для будущих работ, а не готовые
              проекты.
            </p>
          </div>
          <div
            class="print-hero-papers"
            role="img"
            aria-label="Схема будущей композиции: афиша, разворот и визитка. Места для изображений."
          >
            <span class="print-paper print-paper-poster">
              АФИША<span>МЕСТО ДЛЯ ИЗОБРАЖЕНИЯ</span>
            </span>
            <span class="print-paper print-paper-spread">
              РАЗВОРОТ<span>МЕСТО ДЛЯ ИЗОБРАЖЕНИЯ</span>
            </span>
            <span class="print-paper print-paper-card">
              ВИЗИТКА<span>МЕСТО ДЛЯ ИЗОБРАЖЕНИЯ</span>
            </span>
          </div>
        </div>
        <section class="print-section print-business" aria-label="01 / ВИЗИТКИ">
          <SectionHeading
            number="01"
            title="ВИЗИТКИ"
            english="BUSINESS CARDS"
          />
          <div class="print-business-grid">
            <PrintSlot
              id="expresso-cards"
              title="Expresso"
              detail="Лицевая и оборотная стороны · композиция карточек"
              ratio="3 / 2"
              tone="paper"
            />
            <PrintSlot
              id="fashion-cards"
              title="Fashion Lab"
              detail="Несколько карточек · наложение и крупный план"
              ratio="4 / 5"
              tone="wine"
            />
            <PrintSlot
              id="expresso-detail"
              title="Expresso / Деталь"
              detail="Бумага и печать · крупный план"
              ratio="2 / 1"
            />
          </div>
        </section>
        <section
          class="print-section print-posters"
          aria-label="02 / АФИШИ И НАРУЖНАЯ РЕКЛАМА"
        >
          <SectionHeading
            number="02"
            title="АФИШИ И НАРУЖНАЯ РЕКЛАМА"
            english="POSTERS / OUTDOOR"
          />
          <div class="print-posters-grid">
            <PrintSlot
              id="music-poster"
              title="World Music Heritage"
              detail="Вертикальная афиша"
              ratio="2 / 3"
              tone="wine"
            />
            <PrintSlot
              id="korean-posters"
              title="Korean Film Festival"
              detail="Серия афиш"
              ratio="4 / 3"
              tone="paper"
            />
            <PrintSlot
              id="music-outdoor"
              title="World Music Heritage / Outdoor"
              detail="Наружный баннер · 6 × 3 м"
              ratio="2 / 1"
            />
          </div>
        </section>
        <section
          class="print-section print-materials"
          aria-label="03 / ПЕЧАТНЫЕ МАТЕРИАЛЫ"
        >
          <SectionHeading
            number="03"
            title="ПЕЧАТНЫЕ МАТЕРИАЛЫ"
            english="PRINT MATERIALS"
          />
          <div class="print-materials-grid">
            <PrintSlot
              id="certificates"
              title="Дипломы и сертификаты"
              detail="Листы и комплекты · вид сверху"
              ratio="1.414 / 1"
              tone="paper"
            />
            <PrintSlot
              id="postcards"
              title="Открытки"
              detail="Лицевая сторона и оборот"
              ratio="3 / 2"
              tone="wine"
            />
            <PrintSlot
              id="leaflets"
              title="Промолистовки"
              detail="Печатные форматы · детали"
              ratio="3 / 4"
            />
          </div>
        </section>
        <section
          class="print-section print-editorial"
          aria-label="04 / МНОГОСТРАНИЧКА"
        >
          <SectionHeading
            number="04"
            title="МНОГОСТРАНИЧКА"
            english="CATALOGS / EDITORIAL"
          />
          <div class="print-editorial-grid">
            <PrintSlot
              id="aviation-publication"
              title="Издание об авиационной промышленности"
              detail="Основная композиция · открытое издание"
              ratio="16 / 9"
              tone="paper"
            />
            <PrintSlot
              id="aviation-spread"
              title="Авиационное издание / Разворот"
              detail="Плоская подача · сетка и иерархия"
              ratio="2 / 1"
            />
            <PrintSlot
              id="newspaper"
              title="Газетные макеты"
              detail="Полосы · плотная типографика"
              ratio="3 / 4"
              tone="wine"
            />
            <PrintSlot
              id="editorial-spreads"
              title="Журнальные развороты"
              detail="Ритм текста и изображения"
              ratio="3 / 2"
              tone="paper"
            />
          </div>
        </section>
      </div>
      <EndNavigation slug="layout" />
    </>
  );
}

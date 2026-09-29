import { createSignal, For, Show } from "solid-js";
import { CollectionHeader, EndNavigation } from "../components/Shared";
import PrintLightbox, { type PrintPreview } from "../components/PrintLightbox";
import {
  printFiles as files,
  printPages,
  type PrintFile,
} from "../lib/print-assets";
import { asset } from "../lib/paths";
import "../styles/print.css";

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
function PrintItem(props: {
  file: PrintFile;
  title: string;
  id?: string;
  secondary?: boolean;
  onOpen?: (trigger: HTMLElement) => void;
}) {
  const pages = printPages(props.file);
  const images = () => (
    <div class={`print-item-images${props.secondary ? " with-back" : ""}`}>
      <For each={props.secondary ? pages : pages.slice(0, 1)}>
        {(p) => (
          <img
            src={asset(p.preview)}
            srcset={
              Math.max(p.width, p.height) <= 1000
                ? undefined
                : `${asset(p.preview)} ${Math.round(Math.min(1, 1000 / Math.max(p.width, p.height)) * p.width)}w, ${asset(p.file)} ${p.width}w`
            }
            sizes="(max-width: 650px) 90vw, 45vw"
            width={p.width}
            height={p.height}
            alt={props.title + (pages.length > 1 ? ` — ${p.page}` : "")}
            loading="lazy"
            decoding="async"
          />
        )}
      </For>
    </div>
  );
  return (
    <figure class="print-item" data-source={props.file} data-project={props.id}>
      {props.onOpen ? (
        <button
          class="print-open"
          type="button"
          aria-label={`Смотреть: ${props.title}`}
          onClick={(e) => props.onOpen!(e.currentTarget)}
        >
          {images()}
        </button>
      ) : (
        images()
      )}
      <figcaption>
        {props.title}
        {props.onOpen && <span aria-hidden="true">СМОТРЕТЬ ↗</span>}
      </figcaption>
    </figure>
  );
}
export default function Layout() {
  const [preview, setPreview] = createSignal<PrintPreview | null>(null);
  const open =
    (
      title: string,
      sources: readonly PrintFile[],
      book = false,
      labels?: string[],
    ) =>
    (trigger: HTMLElement) =>
      setPreview({
        title,
        trigger,
        book,
        structure:
          sources[0] === files.aviaprom ? "single-spread-single" : "pages",
        editorial: sources.some((file) =>
          [...files.newspapers, ...files.spreads].some(
            (source) => source === file,
          ),
        ),
        groups: sources.map((file, i) => ({
          label: labels?.[i] || title,
          pages: printPages(file),
        })),
      });
  return (
    <>
      <CollectionHeader slug="layout" />
      <div class="print-page">
        <section class="print-section print-business" aria-label="01 / ВИЗИТКИ">
          <SectionHeading
            number="01"
            title="ВИЗИТКИ"
            english="BUSINESS CARDS"
          />
          <div class="print-business-grid">
            <PrintItem
              file={files.expressoMockup}
              title="Expresso"
              id="expresso-cards"
              onOpen={open("Expresso", [files.expresso])}
            />
            <PrintItem
              file={files.fashionMockup}
              title="Fashion Lab"
              id="fashion-cards"
              onOpen={open("Fashion Lab", [files.fashion])}
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
            <For each={files.posters}>
              {(file, i) => (
                <PrintItem file={file} title={`Афиша / 0${i() + 1}`} />
              )}
            </For>
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
            <For each={files.materials}>
              {(file, i) => (
                <PrintItem
                  file={file}
                  title={
                    [
                      "Лифлет / 01",
                      "Лифлет / 02",
                      "Сертификат",
                      "Грамоты",
                      "Листовка",
                    ][i()]
                  }
                />
              )}
            </For>
            <PrintItem
              file={files.postcardsMockup}
              title="Береги природу / Открытки"
              id="postcards"
              onOpen={open("Береги природу", files.postcards, false, [
                "Гора",
                "Лес",
                "Город",
              ])}
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
            <PrintItem
              file={files.mercedesCover}
              title="Каталог Mercedes-Benz"
              id="mercedes"
              onOpen={open("Каталог Mercedes-Benz", [files.mercedes], true)}
            />
            <PrintItem
              file={files.aviapromMockup}
              title="Авиапром"
              id="aviaprom"
              onOpen={open("Авиапром", [files.aviaprom], true)}
            />
            <For each={files.newspapers}>
              {(file, i) => (
                <PrintItem
                  file={file}
                  title={
                    i() === 0 ? "Роснефть / Газетная полоса" : "Газетная полоса"
                  }
                  id={`newspaper-${i() + 1}`}
                  onOpen={open(i() === 0 ? "Роснефть" : "Газетная полоса", [
                    file,
                  ])}
                />
              )}
            </For>
            <For each={files.spreads}>
              {(file, i) => (
                <PrintItem
                  file={file}
                  title={`Разворот / 0${i() + 1}`}
                  id={`spread-${i() + 1}`}
                  onOpen={open(`Разворот / 0${i() + 1}`, [file])}
                />
              )}
            </For>
          </div>
        </section>
      </div>
      <EndNavigation slug="layout" />
      <Show when={preview()}>
        {(p) => (
          <PrintLightbox preview={p()} onClose={() => setPreview(null)} />
        )}
      </Show>
    </>
  );
}

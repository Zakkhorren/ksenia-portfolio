import { For } from "solid-js";
import data from "../data/content.json";
import { Image, PageHeader, EndNavigation } from "../components/Shared";
import { ru } from "../lib/typography";
import { openGallery } from "../lib/viewer-state";
export default function Project(props: { slug: string }) {
  const project = () => data.projects.find((p) => p.slug === props.slug)!;
  const labels = [
    "01 / ВИЗУАЛЬНОЕ НАПРАВЛЕНИЕ",
    "02 / ДЕТАЛИ",
    "03 / МИР БРЕНДА",
  ];
  return (
    <>
      <PageHeader
        title={project().title}
        number={project().number}
        label="ИЗБРАННЫЙ ПРОЕКТ"
        description={project().type}
        project
      />
      <div class="case-cover">
        <Image name={project().image} alt={project().alt} priority />
      </div>
      <div class="case-overview">
        <h2 style={{ "white-space": "pre-line" }}>{ru(project().idea)}</h2>
        <div>
          <p>{ru(project().description)}</p>
          <div class="case-facts">
            <div>
              <span class="eyebrow">НАПРАВЛЕНИЕ</span>
              <p>Айдентика</p>
            </div>
            <div>
              <span class="eyebrow">ДИЗАЙН</span>
              <p>Ксения</p>
            </div>
          </div>
          <div class="sample-note">
            {ru(
              "Временная визуальная подборка. Полные материалы проекта появятся здесь позже.",
            )}
          </div>
        </div>
      </div>
      <div class="case-gallery">
        <For each={project().images}>
          {(file, index) => (
            <button
              type="button"
              class={`work-tile${index() === 2 ? " wide-tile" : ""}`}
              aria-label={`Открыть: ${labels[index()]}`}
              onClick={(event) =>
                openGallery(
                  `project-${props.slug}`,
                  index(),
                  event.currentTarget,
                )
              }
            >
              <span class="tile-image image-crop">
                <Image name={file} alt={labels[index()]} />
                <span class="tile-open" aria-hidden="true">
                  ↗
                </span>
              </span>
              <span class="tile-caption">
                <span>
                  <span class="tile-title">{labels[index()]}</span>
                  <span class="tile-type" />
                </span>
              </span>
            </button>
          )}
        </For>
      </div>
      <EndNavigation slug={props.slug} project />
    </>
  );
}

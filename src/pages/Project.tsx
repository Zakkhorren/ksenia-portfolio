import { For } from "solid-js";
import data from "../data/content.json";
import cases from "../data/case-assets.json";
import { PageHeader, EndNavigation } from "../components/Shared";
import { asset } from "../lib/paths";

export default function Project(props: { slug: string }) {
  const project = () => data.projects.find((p) => p.slug === props.slug)!;
  const images = () =>
    cases.projects[props.slug as keyof typeof cases.projects];
  return (
    <>
      <PageHeader
        title={project().title}
        number={project().number}
        label="ИЗБРАННЫЙ ПРОЕКТ"
        description={project().type}
        project
      />
      <div
        class="case-presentation"
        aria-label={`Полный кейс ${project().title}`}
      >
        <For each={images()}>
          {(image, index) => (
            <img
              src={asset(image.file)}
              width={image.width}
              height={image.height}
              alt={
                images().length === 1
                  ? `Полный кейс ${project().title}`
                  : `${project().title} — ${String(index() + 1).padStart(2, "0")}`
              }
              loading={index() === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchpriority={index() === 0 ? "high" : "auto"}
            />
          )}
        </For>
      </div>
      <EndNavigation slug={props.slug} project />
    </>
  );
}

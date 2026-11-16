import { For, Show } from "solid-js";
import data from "../data/experiments.json";
import { asset, url } from "../lib/paths";

export default function DigitalProjects(props: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const selected = () => data.digitalProjects.find(project => project.id === props.selectedId);
  return <Show when={selected()} fallback={
    <div class="desk-project-list">
      <For each={data.digitalProjects}>{project =>
        <button type="button" class="desk-project-card" data-project={project.id} onClick={() => props.onSelect(project.id)}>
          <img src={asset(project.cover)} alt="Демоверсия приглашения: Анна и Михаил, 15 февраля 2030 года" loading="lazy" decoding="async" />
          <strong>{project.title}</strong>
          <span>{project.description}</span>
        </button>
      }</For>
    </div>
  }>
    <article class="desk-project-detail">
      <img class="desk-project-preview" src={asset(selected()!.preview)} alt="Свадебное приглашение с новой композицией, вымышленными именами и датой" decoding="async" />
      <div class="desk-project-copy">
        <h2>{selected()!.title}</h2>
        <p>{selected()!.description}</p>
        <p class="desk-project-note">{selected()!.note}</p>
        <a class="desk-demo-link" href={url(selected()!.demoPath)} target="_blank" rel="noopener noreferrer">Открыть демоверсию <span aria-hidden="true">↗</span></a>
      </div>
    </article>
  </Show>;
}

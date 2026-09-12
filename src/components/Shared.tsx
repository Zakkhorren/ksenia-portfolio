import { For } from "solid-js";
import data from "../data/content.json";
import { asset, url } from "../lib/paths";
import { ru } from "../lib/typography";

export function Header() {
  return (
    <>
      <a class="skip-link" href="#main">
        К содержимому
      </a>
      <header class="site-header wrap" id="top">
        <a
          class="brand-lockup"
          href={url("/")}
          aria-label="Ксения — на главную"
        >
          <span class="brand">
            KSENIA<span class="brand-dot">.</span>
          </span>
          <span class="brand-rule" aria-hidden="true" />
          <span class="brand-description">ГРАФИЧЕСКИЙ ДИЗАЙНЕР</span>
        </a>
        <nav class="site-nav" aria-label="Главная навигация">
          <a href={url("/#work")} class="active">
            РАБОТЫ
          </a>
          <a href={url("/#about")}>ОБО МНЕ</a>
        </nav>
      </header>
    </>
  );
}

export function Contact(props: { full?: boolean }) {
  return (
    <footer class="site-footer" id="contact">
      <p class="eyebrow">CONTACT</p>
      <h2 class="contact-heading">НАПИСАТЬ МНЕ</h2>
      <div class="contact-links">
        <a
          href={data.contacts.telegram}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M21.5 3.4 18.3 20c-.2 1.2-.9 1.5-1.9.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.3L5.8 13.7 1 12.2c-1-.3-1-1 .2-1.5L20 3.4c.9-.3 1.6.2 1.5 0Z"
            />
          </svg>
          <span>Telegram ↗</span>
        </a>
        <a
          href={data.contacts.behance}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <text
              x="0"
              y="18"
              fill="currentColor"
              font-family="Arial,sans-serif"
              font-size="18"
              font-weight="700"
            >
              Bē
            </text>
          </svg>
          <span>Behance ↗</span>
        </a>
      </div>
      {props.full && (
        <div class="footer-bottom">
          <p>© 2026 KSENIA · ГРАФИЧЕСКИЙ ДИЗАЙНЕР</p>
          <a href="#top">НАВЕРХ ↑</a>
        </div>
      )}
    </footer>
  );
}

export function Footer() {
  return <Contact full />;
}

export function Image(props: {
  name: string;
  alt: string;
  class?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={asset(props.name)}
      alt={props.alt}
      class={props.class || ""}
      loading={props.priority ? "eager" : "lazy"}
      decoding="async"
      fetchpriority={props.priority ? "high" : "auto"}
    />
  );
}

const labels: Record<string, string> = {
  logofolio: "LOGOFOLIO",
  packaging: "PACKAGING",
  marketplace: "E-COMMERCE",
  layout: "LAYOUT",
  experiments: "PLAYGROUND",
};
export function PageHeader(props: {
  title: string;
  number: string;
  label: string;
  description: string;
  note?: string;
  project?: boolean;
}) {
  return (
    <header class="page-header">
      <div class="breadcrumb">
        <a href={url("/")}>ГЛАВНАЯ</a>
        <span>/</span>
        <a href={url(props.project ? "/#work" : "/#other-things")}>
          {props.project ? "ИЗБРАННЫЕ ПРОЕКТЫ" : "OTHER THINGS"}
        </a>
        <span>/ {props.number}</span>
      </div>
      <div class="page-title-line">
        <div>
          <p class="eyebrow collection-label">
            {props.number} / {props.label}
          </p>
          <h1 class="page-title" data-title={props.title}>
            {props.title}
          </h1>
          <p class="page-description">{ru(props.description)}</p>
        </div>
        <p class="handnote page-note">{ru(props.note || "")}</p>
      </div>
    </header>
  );
}

export function CollectionHeader(props: { slug: string }) {
  const category = () => data.categories.find((c) => c.slug === props.slug)!;
  return (
    <>
      <PageHeader
        title={category().page_title}
        number={category().number}
        label={labels[props.slug]}
        description={category().description}
        note={
          props.slug === "marketplace"
            ? "Иногда всё начинается с обложки."
            : category().note
        }
      />
      <nav class="collection-nav" aria-label="Разделы работ">
        <For each={data.categories}>
          {(c) => (
            <a
              href={url(`/work/${c.slug}/`)}
              aria-current={c.slug === props.slug ? "page" : undefined}
            >
              {c.page_title}
            </a>
          )}
        </For>
      </nav>
    </>
  );
}

export function EndNavigation(props: { slug: string; project?: boolean }) {
  const next = () =>
    props.project
      ? data.projects[
          (data.projects.findIndex((p) => p.slug === props.slug) + 1) %
            data.projects.length
        ]
      : data.categories.find(
          (c) =>
            c.slug === data.categories.find((c) => c.slug === props.slug)?.next,
        );
  return (
    <nav class="end-navigation" aria-label="Навигация между разделами">
      <a class="back-link" href={url("/#other-things")}>
        ← На главную
      </a>
      <a
        class="next-link"
        href={url(
          next()
            ? `/${props.project ? "projects" : "work"}/${next()!.slug}/`
            : "/#work",
        )}
      >
        <span>
          {props.project
            ? "СЛЕДУЮЩИЙ ПРОЕКТ"
            : next()
              ? "СЛЕДУЮЩАЯ КОЛЛЕКЦИЯ"
              : "НА ГЛАВНУЮ"}
        </span>
        {next()
          ? "page_title" in next()!
            ? (next() as { page_title: string }).page_title
            : next()!.title
          : "К РАБОТАМ"}{" "}
        →
      </a>
    </nav>
  );
}

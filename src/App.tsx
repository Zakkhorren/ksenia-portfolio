import { createEffect, createSignal, Match, onCleanup, Switch } from "solid-js";
import { Header, Footer } from "./components/Shared";
import Viewers from "./components/Viewers";
import Home from "./pages/Home";
import Logofolio from "./pages/Logofolio";
import Marketplace from "./pages/Marketplace";
import Packaging from "./pages/Packaging";
import Layout from "./pages/Layout";
import Experiments from "./pages/Experiments";
import Project from "./pages/Project";
import NotFound from "./pages/NotFound";
import data from "./data/content.json";
import { routePath } from "./lib/paths";
import { closeViewer } from "./lib/viewer-state";

const routes = new Set([
  "/",
  ...data.categories.map((c) => `/work/${c.slug}/`),
  ...data.projects.map((p) => `/projects/${p.slug}/`),
]);

export default function App() {
  const [location, setLocation] = createSignal({
    path: routePath(window.location.pathname),
    hash: window.location.hash,
  });
  const path = () => location().path;
  const project = () =>
    data.projects.find((p) => path() === `/projects/${p.slug}/`);
  const scrollPositions = new Map<string, number>();
  let restoring: number | undefined;
  let first = true;
  const key = () => path() + location().hash;
  const update = () =>
    setLocation({
      path: routePath(window.location.pathname),
      hash: window.location.hash,
    });
  const pop = () => {
    closeViewer();
    restoring =
      scrollPositions.get(
        routePath(window.location.pathname) + window.location.hash,
      ) || 0;
    update();
  };
  window.addEventListener("popstate", pop);
  window.addEventListener("hashchange", update);
  const originalScrollRestoration = history.scrollRestoration;
  history.scrollRestoration = "manual";
  onCleanup(() => {
    window.removeEventListener("popstate", pop);
    window.removeEventListener("hashchange", update);
    history.scrollRestoration = originalScrollRestoration;
  });
  createEffect(
    () => location(),
    (current) => {
      const home = current.path === "/";
      document.body.classList.toggle("home-page", home);
      const category = data.categories.find(
        (c) => current.path === `/work/${c.slug}/`,
      );
      const selected = data.projects.find(
        (p) => current.path === `/projects/${p.slug}/`,
      );
      document.title = home
        ? "KSENIA — Графический дизайнер"
        : `${category?.page_title || selected?.title || "Страница не найдена"} — KSENIA`;
      const meta = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      );
      if (meta)
        meta.content =
          category?.description ||
          selected?.description ||
          "Портфолио Ксении. Айдентика, упаковка, печатная графика и визуальные системы.";
      const wasFirst = first;
      first = false;
      const saved = restoring;
      restoring = undefined;
      const frame = requestAnimationFrame(() => {
        if (saved !== undefined) {
          window.scrollTo(0, saved);
          return;
        }
        if (current.hash) {
          document
            .getElementById(decodeURIComponent(current.hash.slice(1)))
            ?.scrollIntoView({ behavior: "instant" });
        } else if (!wasFirst) window.scrollTo(0, 0);
        if (!wasFirst && !current.hash)
          document.getElementById("main")?.focus({ preventScroll: true });
      });
      return () => cancelAnimationFrame(frame);
    },
  );
  return (
    <div
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const anchor = (event.target as Element).closest<HTMLAnchorElement>(
          "a[href]",
        );
        if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
        const destination = new URL(anchor.href);
        const targetPath = routePath(destination.pathname);
        if (
          destination.origin !== window.location.origin ||
          !routes.has(targetPath)
        )
          return;
        event.preventDefault();
        scrollPositions.set(key(), window.scrollY);
        closeViewer();
        history.pushState(
          null,
          "",
          destination.pathname + destination.search + destination.hash,
        );
        update();
      }}
    >
      <Header />
      <main class="wrap" id="main" tabindex="-1">
        <Switch fallback={<NotFound />}>
          <Match when={path() === "/"}>
            <Home />
          </Match>
          <Match when={path() === "/work/logofolio/"}>
            <Logofolio />
          </Match>
          <Match when={path() === "/work/marketplace/"}>
            <Marketplace />
          </Match>
          <Match when={path() === "/work/packaging/"}>
            <Packaging />
          </Match>
          <Match when={path() === "/work/layout/"}>
            <Layout />
          </Match>
          <Match when={path() === "/work/experiments/"}>
            <Experiments />
          </Match>
          <Match when={project()}>
            <Project slug={project()!.slug} />
          </Match>
        </Switch>
        {path() !== "/" && <Footer />}
      </main>
      <Viewers />
    </div>
  );
}

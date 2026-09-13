import { createEffect, createSignal, type Accessor } from "solid-js";
import type { NavSection } from "../components/Shared";

export function useSectionNavigation(path: Accessor<string>) {
  const [active, setActive] = createSignal<NavSection>("work");
  let pending: NavSection | undefined;
  const activate = (section: NavSection) => {
    pending = section;
    setActive(section);
  };
  createEffect(path, (current) => {
    if (current !== "/") {
      pending = undefined;
      setActive("work");
      return;
    }
    const sections = ["work", "about", "contact"] as const;
    const elements = sections.map((id) => document.getElementById(id)!);
    const update = () => {
      // Use a viewport-relative reading band, not fixed document scroll offsets.
      const line = innerHeight * 0.55;
      const atBottom =
        Math.ceil(scrollY + innerHeight) >=
        document.documentElement.scrollHeight - 1;
      const currentSection = atBottom
        ? "contact"
        : ([...elements]
            .reverse()
            .find((el) => el.getBoundingClientRect().top <= line)
            ?.id as NavSection) || "work";
      if (pending) {
        if (currentSection !== pending) return;
        pending = undefined;
      }
      setActive(currentSection);
    };
    const observer = new IntersectionObserver(update, {
      rootMargin: "-15% 0px -15% 0px",
      threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1],
    });
    elements.forEach((el) => observer.observe(el));
    const interrupt = () => {
      pending = undefined;
      update();
    };
    const settled = () => {
      pending = undefined;
      update();
    };
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("scrollend", settled);
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("scrollend", settled);
      window.removeEventListener("resize", update);
    };
  });
  return { active, activate };
}

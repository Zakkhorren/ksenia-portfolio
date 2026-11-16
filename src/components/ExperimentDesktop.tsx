import { For, Show, createSignal, createEffect, onCleanup } from "solid-js";
import { asset } from "../lib/paths";
import data from "../data/experiments.json";
import "../styles/experiments.css";

type Folder = "readme" | "animation" | "photos" | "apps";
const folders: { id: Folder; title: string }[] = [
  { id: "animation", title: "Анимация" },
  { id: "photos", title: "Фотографии" },
  { id: "apps", title: "Сайты и приложения" },
  { id: "readme", title: "прочитай меня.txt" },
];

export default function ExperimentDesktop() {
  let desktop!: HTMLDivElement;
  let win!: HTMLDivElement;
  let body!: HTMLDivElement;
  let backButton!: HTMLButtonElement;
  let taskButton!: HTMLButtonElement;
  let lastTrigger: HTMLButtonElement | undefined;
  const [folder, setFolder] = createSignal<Folder>("readme");
  const [opened, setOpened] = createSignal(true);
  const [minimized, setMinimized] = createSignal(false);
  const [maximized, setMaximized] = createSignal(false);
  const [albumId, setAlbumId] = createSignal<string | null>(null);
  const [selected, setSelected] = createSignal<number | null>(null);
  const [position, setPosition] = createSignal({ x: 0, y: 28 });
  const [clock, setClock] = createSignal("");
  const [reduced, setReduced] = createSignal(false);
  let albumScroll = 0;
  let gridFocus = 0;
  let drag: { id: number; x: number; y: number; left: number; top: number } | undefined;
  const album = () => data.series.find(s => s.id === albumId());
  const images = () => folder() === "animation"
    ? data.animations.map(a => ({ src: reduced() ? a.cover : a.src, thumbnail: a.cover, alt: `Опоссум — ${a.title.toLowerCase()}`, id: a.id }))
    : (album()?.images || []);
  const title = () => folders.find(f => f.id === folder())!.title;
  const viewing = () => selected() !== null;
  const current = () => images()[selected() ?? 0];
  const bounded = (p: {x:number;y:number}) => ({ x: Math.max(0, Math.min(p.x, desktop.clientWidth - win.offsetWidth)), y: Math.max(0, Math.min(p.y, desktop.clientHeight - 48 - win.offsetHeight)) });
  const clamp = () => {
    if (!desktop || !win || minimized() || maximized()) return;
    const p = position();
    setPosition(bounded(p));
  };
  const locate = () => {
    setPosition(bounded({ x: Math.max(0, desktop.clientWidth - win.offsetWidth - 28), y: 28 }));
  };
  const open = (id: Folder, trigger: HTMLButtonElement) => {
    lastTrigger = trigger;
    setFolder(id); setOpened(true); setMinimized(false); setSelected(null); setAlbumId(null); setMaximized(false); albumScroll = 0;
    requestAnimationFrame(() => { body.scrollTop = 0; locate(); win.focus({ preventScroll: true }); });
  };
  const close = () => {
    setOpened(false); setMinimized(false); setSelected(null); setAlbumId(null);
    lastTrigger?.focus({ preventScroll: true });
  };
  const minimize = () => { if (opened()) { setMinimized(true); taskButton?.focus({ preventScroll: true }); } };
  const restore = () => { setMinimized(false); requestAnimationFrame(() => { clamp(); win.focus({ preventScroll: true }); }); };
  const back = () => {
    if (viewing()) {
      setSelected(null);
      requestAnimationFrame(() => {
        body.scrollTop = albumScroll;
        body.querySelectorAll<HTMLButtonElement>("[data-image]")[gridFocus]?.focus({ preventScroll: true });
      });
    } else if (albumId()) {
      setAlbumId(null); body.scrollTop = 0;
      requestAnimationFrame(() => body.querySelector<HTMLButtonElement>(".desk-series")?.focus({ preventScroll: true }));
    } else close();
  };
  const preview = (index: number) => {
    albumScroll = body.scrollTop; gridFocus = index; setSelected(index);
    requestAnimationFrame(() => { body.scrollTop = 0; backButton.focus({ preventScroll: true }); });
    preload(index);
  };
  const preload = (index: number) => {
    for (const i of [index - 1, index + 1]) if (images()[i]) { const img = new Image(); img.src = asset(images()[i].src); }
  };
  const step = (delta: number) => {
    const next = ((selected() ?? 0) + delta + images().length) % images().length;
    setSelected(next); preload(next);
  };
  const keys = (e: KeyboardEvent) => {
    if (!opened() || minimized()) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); back(); }
    else if (viewing() && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { e.preventDefault(); step(e.key === "ArrowLeft" ? -1 : 1); }
  };
  const startDrag = (e: PointerEvent) => {
    if (window.matchMedia("(max-width: 700px)").matches || maximized() || (e.target as Element).closest("button")) return;
    const p = position(); drag = {id:e.pointerId,x:e.clientX,y:e.clientY,left:p.x,top:p.y};
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  createEffect(() => true, () => {
    const update = () => setClock(new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date()));
    update(); const timer = window.setInterval(update, 1000);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)"); const change = () => setReduced(motion.matches); change(); motion.addEventListener("change", change);
    const resize = new ResizeObserver(clamp); resize.observe(desktop); resize.observe(win); requestAnimationFrame(locate);
    onCleanup(() => { clearInterval(timer); resize.disconnect(); motion.removeEventListener("change", change); });
  });
  return (
    <div ref={desktop} class="experiment-desktop" role="region" aria-label="Авторский рабочий стол" onKeyDown={keys}>
      <div class="desk-objects">
        <For each={folders}>{f => <button type="button" class={`desk-object ${f.id === "apps" ? "is-red" : ""}`} aria-pressed={opened() && folder() === f.id ? "true" : "false"} onClick={e => open(f.id, e.currentTarget)}>
          <Show when={f.id !== "readme"} fallback={<svg class="desk-icon desk-document" viewBox="0 0 88 76" aria-hidden="true"><path d="M22 4h31l16 16v51H22Z"/><path class="desk-icon-lines" d="M53 4v17h16M31 34h28M31 43h28M31 52h21"/></svg>}>
            <svg class="desk-icon" viewBox="0 0 88 76" aria-hidden="true"><path d="M4 17V10h30l9 9h41v49H4Z"/><path class="desk-folder-front" d="M4 27h80v41H4Z"/></svg>
          </Show>
          <span>{f.title}</span>
        </button>}</For>
      </div>
      <p class="desk-hint">открывай, осматривайся ↑</p>
      <div class="desk-wallpaper" aria-hidden="true"><strong>НЕ ПО ТЗ</strong><span>но тоже моё</span></div>
      <div ref={win} class={`desk-window ${folder() === "readme" ? "is-readme" : ""} ${maximized() ? "is-maximized" : ""}`} style={{left:`${position().x}px`,top:`${position().y}px`,display:opened() && !minimized() ? undefined : "none"}} role="group" aria-label={title()} tabindex={-1}>
        <div class="desk-titlebar" onPointerDown={startDrag} onPointerMove={e => { if (drag && drag.id === e.pointerId) {setPosition(bounded({ x:drag.left+e.clientX-drag.x,y:drag.top+e.clientY-drag.y }));} }} onPointerUp={() => {drag=undefined;}} onLostPointerCapture={() => {drag=undefined;}}>
          <span>{title()}</span><div class="desk-controls">
            <button type="button" aria-label="Свернуть окно" onClick={minimize}>−</button>
            <button type="button" aria-label={maximized() ? "Восстановить размер окна" : "Развернуть окно"} onClick={() => {setMaximized(!maximized());requestAnimationFrame(clamp);}}>{maximized() ? "❐" : "□"}</button>
            <button type="button" aria-label="Закрыть окно" onClick={close}>×</button>
          </div>
        </div>
        <div class="desk-path"><button ref={backButton} type="button" aria-label={viewing() ? "Вернуться к миниатюрам" : albumId() ? "Вернуться к сериям" : "Закрыть папку"} onClick={back}>←</button><span>{title()}{albumId() ? ` / ${album()!.title}` : ""}{viewing() && folder() === "animation" ? ` / ${data.animations[selected()!].title}` : ""}</span></div>
        <div ref={body} class={`desk-body ${viewing() ? "is-viewing" : ""}`}>
          <Show when={folder() === "readme"}><article class="desk-readme"><p class="desk-file-label">ЗАМЕТКА ДЛЯ ГОСТЯ</p><h2><span>ПРИВЕТ, ТЫ НА МОЁМ</span>{" "}<span>РАБОЧЕМ СТОЛЕ</span></h2><p>Здесь я пробую то, чему не нашлось места в остальных разделах.</p><p>Анимация, фотографии и маленькие цифровые проекты. Без строгого брифа, зато с интересом.</p><p class="desk-hand">можно просто поразглядывать</p></article></Show>
          <Show when={folder() === "apps"}><p class="desk-coming">Скоро здесь появятся<br/>сайты и приложения</p></Show>
          <Show when={folder() === "photos" && !albumId()}><div class="desk-series-list"><For each={data.series}>{s => <button type="button" class="desk-series" onClick={() => {setAlbumId(s.id); body.scrollTop=0;requestAnimationFrame(() => body.querySelector<HTMLButtonElement>("[data-image]")?.focus({preventScroll:true}));}}><span class="desk-photo-stack"><img src={asset(s.images[0].thumbnail)} alt="" loading="lazy"/><img src={asset(s.images[1].thumbnail)} alt="" loading="lazy"/><img src={asset(s.images.find(i => i.id === s.cover)!.thumbnail)} alt="Пагода на фоне леса и тумана" loading="lazy"/></span><strong>{s.title}</strong><span>{s.images.length} фотографий</span></button>}</For></div></Show>
          <Show when={!viewing() && (folder() === "animation" || (folder() === "photos" && albumId()))}><div class={`desk-grid ${folder() === "animation" ? "desk-animation-grid" : ""}`}><For each={images()}>{(img,i) => <button type="button" data-image={img.id} aria-label={folder() === "animation" ? data.animations[i()].title : `Открыть фото ${i()+1}: ${img.alt}`} onClick={() => preview(i())}><img src={asset(img.thumbnail)} alt={img.alt} loading="lazy" decoding="async"/><Show when={folder() === "animation"}><span>{data.animations[i()].title}</span></Show></button>}</For></div></Show>
          <Show when={viewing()}><div class={`desk-view ${folder() === "animation" ? "desk-animation-view" : ""}`}><img src={asset(current().src)} alt={current().alt} decoding="async"/><div class="desk-view-controls"><button type="button" aria-label="Предыдущее изображение" onClick={() => step(-1)}>←</button><span aria-live="polite">{selected()!+1} / {images().length}</span><button type="button" aria-label="Следующее изображение" onClick={() => step(1)}>→</button></div></div></Show>
        </div>
        <div class="desk-status">{viewing() ? folder() === "animation" ? data.animations[selected()!].title : `${album()?.title} · авторская серия` : folder() === "animation" ? `${data.animations.length} работы` : albumId() ? `${images().length} фотографий` : folder() === "photos" ? `${data.series.length} серия` : "НЕ ПО ТЗ / ЛИЧНОЕ"}</div>
      </div>
      <div class="desk-taskbar"><button type="button" class="desk-start" aria-label="Показать рабочий стол" onClick={minimize}>К</button><Show when={opened()}><button ref={taskButton} type="button" class="desk-task" aria-label={`Восстановить окно: ${title()}`} aria-pressed={minimized() ? "false" : "true"} onClick={restore}>{title()}</button></Show><time>{clock()}</time></div>
    </div>
  );
}

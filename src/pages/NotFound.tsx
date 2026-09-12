import { url } from "../lib/paths";
export default function NotFound() {
  return (
    <section class="not-found">
      <div>
        <p class="eyebrow">404 / НЕ НАЙДЕНО</p>
        <h1 class="page-title">
          ЗАТЕРЯЛИСЬ
          <br />В ДЕТАЛЯХ?
        </h1>
        <p>Этой страницы здесь нет.</p>
        <a href={url("/")}>Вернуться к работам ↗</a>
      </div>
    </section>
  );
}

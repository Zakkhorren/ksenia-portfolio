# Аудит шрифтов — 10 сентября 2026

Основные гарнитуры сохранены. Проверены локальные файлы, CSS и сохранённые лицензии; внешнее юридическое заключение не проводилось.

| Семейство | Начертания | Локальный источник | Лицензия / происхождение |
|---|---|---|---|
| Inter Tight | normal 400, 500, 600, 700, 800, 900 | dist/assets/font-0.ttf … font-5.ttf; fonts.css | Google Fonts; исходные gstatic URL в references/font-source.css; SIL OFL 1.1 в Inter-Tight-OFL.txt |
| Inter Tight Outline (CSS-алиас Inter Tight ExtraBold) | normal 800 | dist/assets/outline-800.ttf; home.css | Производный файл Inter Tight 800: объединены пересекающиеся контуры. Ширина глифов сохранена. Та же SIL OFL 1.1 |
| Oswald | normal 500 | dist/assets/category-display-0.ttf; home-fonts.css | Google Fonts; SIL OFL 1.1 в oswald-OFL.txt; ссылка на OFL в метаданных TTF |
| Caveat | normal 500 на всём сайте | dist/assets/handwriting-1.ttf; единственное глобальное @font-face в fonts.css | Google Fonts; SIL OFL 1.1 в caveat-OFL.txt; кириллица присутствует |

Caveat 400 (handwriting-0.ttf) сохранён как существующий ресурс, но больше не подключается. Все рукописные селекторы используют Caveat 500 normal.

Системные запасные гарнитуры: Helvetica Neue и Arial (проприетарные системные шрифты, файлы не поставляются сайтом), sans-serif и cursive. Это fallback, не веб-шрифты, загруженные проектом. Удалены старые имитации рукописного текста через Georgia/Times New Roman.

Неизвестных или коммерческих загружаемых шрифтов среди TTF не обнаружено. Начертания логотипов, уже встроенных в растровые изображения, не являются веб-шрифтами: их происхождение и права нельзя установить по этим изображениям.

Примечание после очистки проекта: неиспользуемый `dist/assets/handwriting-0.ttf`
удалён. Упоминание о его сохранении выше относится к историческому аудиту.
Используемый сайтом Caveat 500 (`handwriting-1.ttf`) и лицензия сохранены.

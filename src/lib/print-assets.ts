import manifest from "../data/print-assets.json";
export type PrintFile = keyof typeof manifest;
export type PrintPage = {
  file: string;
  preview: string;
  width: number;
  height: number;
  page: number;
};
export const printPages = (name: PrintFile): PrintPage[] =>
  manifest[name].pages;
export const printFiles = {
  expressoMockup: "визитки expresso мокап.pdf",
  expresso: "Expresso визитка.pdf",
  fashionMockup: "визитки fashionlab мокап.pdf",
  fashion: "FashionLab визитка.pdf",
  posters: ["Плакат 1.jpg", "Плакат 2.png", "Плакат 3.jpg", "Плакат 4.png"],
  materials: [
    "Лифлет 1.png",
    "Лифлет 2.png",
    "Сертификат.png",
    "Грамоты.jpg",
    "листовка.jpg",
  ],
  postcardsMockup: "мокап для серии открыток.jpg",
  postcards: [
    "береги природу открытка 1 гора.pdf",
    "береги природу открытка 2 лес.pdf",
    "береги природу открытка 3 город.pdf",
  ],
  mercedesCover: "1. Обложка мерс.pdf",
  mercedes: "1. Блок мерс.pdf",
  newspapers: [
    "2. Верстка одной полосы газеты роснефть.pdf",
    "3. верстка одной полосы какой-то газеты.pdf",
  ],
  aviapromMockup: "4.1. Мокап авиапром на превью.jpg",
  aviaprom: "4.2 журнал авиапром внутр блок.pdf",
  spreads: [
    "5. Рандомный блок разворотом.pdf",
    "6. Рандомный блок разворотом.pdf",
    "7. Рандомный блок разворотом.pdf",
  ],
} as const satisfies Record<string, PrintFile | readonly PrintFile[]>;

import type { Category, Item, Resource, Profile, Language, Social } from "../../src/lib/types.js";
import { getTranslator } from "../../src/i18n/translations.js";
import { renderIcon } from "./icons.js";
import { renderItemCard, renderHeader, renderFooter, renderSidebar } from "./components.js";
import { renderPage } from "./base.js";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function tf(record: Record<string, unknown>, field: string, lang: string): string {
  const val = record[`${field}_${lang}`];
  return typeof val === "string" ? val : "";
}

interface CategoryPageData {
  lang: string;
  languages: Language[];
  profile: Profile | null;
  category: Category;
  items: Item[];
  itemResources: Map<string, Resource[]>;
  categories: Category[];
  socials: Social[];
  faviconUrl?: string;
  accentCss?: string | null;
  siteUrl?: string;
}

export function renderCategoryPage(data: CategoryPageData): string {
  const { lang, languages, profile, category, items, itemResources, categories, socials, faviconUrl, accentCss, siteUrl } = data;
  const t = getTranslator(lang);
  const title = tf(category, "title", lang) || category.title_en;

  const itemsHtml =
    items.length === 0
      ? `<p class="text-text-muted">${t("category.noItems")}</p>`
      : `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${items.map((item) => renderItemCard(item, itemResources.get(item.id) ?? [], lang)).join("")}
        </div>`;

  const content = `
    <div class="min-h-screen flex flex-col">
      ${renderHeader(lang, languages, profile, categories)}
      <main class="flex-1">
        <div class="py-12 sm:py-16">
          <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div class="flex items-center gap-3 mb-8">
              ${category.icon ? renderIcon(category.icon, "w-8 h-8 text-text") : ""}
              <h1 class="text-3xl sm:text-4xl font-bold">${escapeHtml(title)}</h1>
            </div>
            ${itemsHtml}
          </div>
        </div>
      </main>
      ${renderFooter(lang, socials, profile)}
    </div>
    ${renderSidebar(lang, languages, categories)}`;

  return renderPage({
    title,
    faviconUrl,
    accentCss,
    siteUrl,
    content,
    lang,
  });
}

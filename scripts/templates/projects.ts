import type { Project, Profile, Language, Category, Social } from "../../src/lib/types.js";
import { getFileUrl } from "../../src/lib/pocketbase.js";
import { getTranslator } from "../../src/i18n/translations.js";
import { renderProjectCard, renderHeader, renderFooter, renderSidebar } from "./components.js";
import { renderPage } from "./base.js";

interface ProjectsPageData {
  lang: string;
  languages: Language[];
  profile: Profile | null;
  projects: Project[];
  categories: Category[];
  socials: Social[];
  faviconUrl?: string;
  accentCss?: string | null;
  siteUrl?: string;
}

export function renderProjectsList(data: ProjectsPageData): string {
  const { lang, languages, profile, projects, categories, socials, faviconUrl, accentCss, siteUrl } = data;
  const t = getTranslator(lang);

  const ogImage = profile?.avatar ? getFileUrl(profile, profile.avatar) : undefined;

  const projectCards =
    projects.length > 0
      ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${projects.map((p) => renderProjectCard(p, lang)).join("")}
        </div>`
      : `<p class="text-text-muted">${t("projects.noProjects")}</p>`;

  const content = `
    <div class="min-h-screen flex flex-col">
      ${renderHeader(lang, languages, profile, categories)}
      <main class="flex-1">
        <div class="py-12 sm:py-16">
          <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl sm:text-4xl font-bold mb-8">${t("projects.all")}</h1>
            ${projectCards}
          </div>
        </div>
      </main>
      ${renderFooter(lang, socials, profile)}
    </div>
    ${renderSidebar(lang, languages, categories)}`;

  return renderPage({
    title: t("projects.all"),
    description: t("projects.all"),
    ogImage,
    faviconUrl,
    accentCss,
    siteUrl,
    content,
    lang,
  });
}

import type { Project, Resource, Skill, Profile, Language, Category, Social } from "../../src/lib/types.js";
import { getFileUrl } from "../../src/lib/pocketbase.js";
import { getTranslator } from "../../src/i18n/translations.js";
import { renderIcon } from "./icons.js";
import { renderResourceList, renderHeader, renderFooter, renderSidebar } from "./components.js";
import { renderPage } from "./base.js";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function tf(record: Record<string, unknown>, field: string, lang: string): string {
  const val = record[`${field}_${lang}`];
  return typeof val === "string" ? val : "";
}

interface ProjectPageData {
  lang: string;
  languages: Language[];
  profile: Profile | null;
  project: Project;
  resources: Resource[];
  categories: Category[];
  socials: Social[];
  faviconUrl?: string;
  accentCss?: string | null;
  siteUrl?: string;
}

export function renderProjectDetail(data: ProjectPageData): string {
  const { lang, languages, profile, project, resources, categories, socials, faviconUrl, accentCss, siteUrl } = data;
  const t = getTranslator(lang);

  const title = tf(project, "title", lang) || project.title_en;
  const tagline = tf(project, "tagline", lang);
  const description = tf(project, "description", lang);
  const technologies = project.expand?.technologies ?? [];

  const ogImage = project.thumbnail
    ? getFileUrl(project, project.thumbnail)
    : project.hero_image
      ? getFileUrl(project, project.hero_image)
      : undefined;

  const heroImage = project.hero_image
    ? `<div class="relative w-full aspect-[21/9] max-h-[400px] bg-surface-alt overflow-hidden">
        <img src="${getFileUrl(project, project.hero_image)}" alt="${escapeHtml(title)}" class="object-cover w-full h-full" />
      </div>`
    : "";

  const actionButtons = `
    <div class="flex flex-wrap gap-3 mb-8">
      ${project.demo_url ? `<a href="${escapeHtml(project.demo_url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors">${t("projects.demo")}</a>` : ""}
      ${project.repo_url ? `<a href="${escapeHtml(project.repo_url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-text hover:border-accent hover:text-accent transition-colors">${t("projects.repo")}</a>` : ""}
    </div>`;

  const techSection =
    technologies.length > 0
      ? `<div class="mb-8">
          <h2 class="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">${t("projects.technologies")}</h2>
          <div class="flex flex-wrap gap-2">
            ${technologies
              .map((skill: Skill) => {
                const skillName = tf(skill, "name", lang) || skill.name_en;
                return `<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-alt border border-border text-sm">${
                  skill.icon ? renderIcon(skill.icon, "w-4 h-4 text-text-muted") : ""
                }${escapeHtml(skillName)}</span>`;
              })
              .join("")}
          </div>
        </div>`
      : "";

  const resourcesSection =
    resources.length > 0
      ? `<div>
          <h2 class="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">${t("resources.title")}</h2>
          ${renderResourceList(resources, lang)}
        </div>`
      : "";

  const content = `
    <div class="min-h-screen flex flex-col">
      ${renderHeader(lang, languages, profile, categories)}
      <main class="flex-1">
        <article>
          ${heroImage}
          <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
            <a href="/${lang}/projects" class="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent transition-colors mb-8">&larr; ${t("projects.all")}</a>
            <h1 class="text-3xl sm:text-4xl font-bold mb-3">${escapeHtml(title)}</h1>
            ${tagline ? `<p class="text-lg text-text-muted mb-6">${escapeHtml(tagline)}</p>` : ""}
            ${actionButtons}
            ${techSection}
            ${description ? `<div class="mb-12"><div class="rich-text">${description}</div></div>` : ""}
            ${resourcesSection}
          </div>
        </article>
      </main>
      ${renderFooter(lang, socials, profile)}
    </div>
    ${renderSidebar(lang, languages, categories)}`;

  return renderPage({
    title,
    description: tagline || title,
    ogImage,
    ogType: "article",
    faviconUrl,
    accentCss,
    siteUrl,
    content,
    lang,
  });
}

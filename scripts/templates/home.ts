import type { Profile, Social, Project, Skill, Language, Category } from "../../src/lib/types.js";
import { getFileUrl } from "../../src/lib/pocketbase.js";
import { getTranslator } from "../../src/i18n/translations.js";
import { renderIcon } from "./icons.js";
import { renderProjectCard, renderHeader, renderFooter, renderSidebar } from "./components.js";
import { renderPage } from "./base.js";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function tf(record: Record<string, unknown>, field: string, lang: string): string {
  const val = record[`${field}_${lang}`];
  return typeof val === "string" ? val : "";
}

interface HomeData {
  lang: string;
  languages: Language[];
  profile: Profile;
  socials: Social[];
  featuredProjects: Project[];
  skills: Skill[];
  categories: Category[];
  faviconUrl?: string;
  accentCss?: string | null;
  siteUrl?: string;
}

export function renderHome(data: HomeData): string {
  const { lang, languages, profile, socials, featuredProjects, skills, categories, faviconUrl, accentCss, siteUrl } = data;
  const t = getTranslator(lang);
  const fullName = tf(profile, "full_name", lang) || profile.full_name_en;
  const headline = tf(profile, "headline", lang);
  const bio = tf(profile, "bio", lang);

  // Hero section
  const avatarHtml = profile.avatar
    ? `<div class="mb-8">
        <div class="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-4 ring-accent/20 ring-offset-4 ring-offset-surface">
          <img src="${getFileUrl(profile, profile.avatar)}" alt="${escapeHtml(fullName)}" width="160" height="160" class="object-cover w-full h-full" />
        </div>
      </div>`
    : "";

  const contactButtons = `
    <div class="flex flex-wrap items-center justify-center gap-3 mb-8">
      ${profile.email ? `<a href="mailto:${profile.email}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors">${t("hero.contact")}</a>` : ""}
      ${profile.resume ? `<a href="${getFileUrl(profile, profile.resume)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-text hover:border-accent hover:text-accent transition-colors">${t("hero.resume")}</a>` : ""}
    </div>`;

  const socialsHtml =
    socials.length > 0
      ? `<div class="flex gap-2">${socials
          .map(
            (s) =>
              `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="p-3 rounded-full text-text-muted hover:text-accent hover:bg-accent-subtle transition-colors" title="${escapeHtml(s.name)}">${
                s.icon ? renderIcon(s.icon, "w-5 h-5") : `<span class="text-sm font-medium">${escapeHtml(s.name)}</span>`
              }</a>`
          )
          .join("")}</div>`
      : "";

  const hero = `
    <section class="py-16 sm:py-24">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col items-center text-center">
          ${avatarHtml}
          <h1 class="text-4xl sm:text-5xl font-bold tracking-tight mb-3">${escapeHtml(fullName)}</h1>
          ${headline ? `<p class="text-lg sm:text-xl text-text-muted max-w-2xl mb-6">${escapeHtml(headline)}</p>` : ""}
          ${bio ? `<div class="max-w-2xl text-text-muted mb-8"><div class="rich-text">${bio}</div></div>` : ""}
          ${contactButtons}
          ${socialsHtml}
        </div>
      </div>
    </section>`;

  // Featured projects
  const featuredHtml =
    featuredProjects.length > 0
      ? `<section class="py-16">
          <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl sm:text-3xl font-bold">${t("projects.featured")}</h2>
              <a href="/${lang}/projects" class="text-sm text-accent hover:text-accent-hover transition-colors font-medium">${t("projects.viewAll")} &rarr;</a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              ${featuredProjects.map((p) => renderProjectCard(p, lang)).join("")}
            </div>
          </div>
        </section>`
      : "";

  // Skills
  const skillsHtml =
    skills.length > 0
      ? `<section class="py-16">
          <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 class="text-2xl sm:text-3xl font-bold mb-8">${t("skills.title")}</h2>
            <div class="flex flex-wrap gap-3">
              ${skills
                .map((skill) => {
                  const name = tf(skill, "name", lang) || skill.name_en;
                  return `<span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-alt border border-border text-sm font-medium hover:border-accent/40 hover:bg-accent-subtle transition-colors">${
                    skill.icon ? renderIcon(skill.icon, "w-4 h-4") : ""
                  }${escapeHtml(name)}</span>`;
                })
                .join("")}
            </div>
          </div>
        </section>`
      : "";

  const ogImage = profile.avatar ? getFileUrl(profile, profile.avatar) : undefined;

  const content = `
    <div class="min-h-screen flex flex-col">
      ${renderHeader(lang, languages, profile, categories)}
      <main class="flex-1">
        ${hero}
        ${featuredHtml}
        ${skillsHtml}
      </main>
      ${renderFooter(lang, socials, profile)}
    </div>
    ${renderSidebar(lang, languages, categories)}`;

  return renderPage({
    title: fullName,
    description: headline || "Personal portfolio",
    ogImage,
    faviconUrl,
    accentCss,
    siteUrl,
    content,
    lang,
  });
}

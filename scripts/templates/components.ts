import type { Language, Category, Profile, Social, Skill, Project, Item, Resource } from "../../src/lib/types.js";
import { getFileUrl } from "../../src/lib/pocketbase.js";
import { getTranslator } from "../../src/i18n/translations.js";
import { renderIcon, getLucideIcon } from "./icons.js";

const MAX_VISIBLE_CATEGORIES = 2;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tf(record: Record<string, unknown>, field: string, lang: string): string {
  const val = record[`${field}_${lang}`];
  return typeof val === "string" ? val : "";
}

// --- Dropdown ---

function renderDropdown(
  triggerHtml: string,
  menuItems: string,
  opts: { align?: string; direction?: string } = {}
): string {
  const align = opts.align === "left" ? "left-0" : "right-0";
  const dir = opts.direction === "up" ? "bottom-full mb-2" : "top-full mt-2";
  return `
    <div class="relative inline-block text-left" data-dropdown>
      <div class="cursor-pointer" data-dropdown-trigger>${triggerHtml}</div>
      <div class="absolute min-w-[10rem] bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden hidden ${align} ${dir}" data-dropdown-menu>
        <div class="flex flex-col">${menuItems}</div>
      </div>
    </div>`;
}

function renderDropdownItem(
  label: string,
  opts: {
    iconHtml?: string;
    isActive?: boolean;
    onClick?: string;
    attrs?: string;
  } = {}
): string {
  const active = opts.isActive
    ? "bg-surface-alt/80 text-accent font-semibold"
    : "hover:bg-surface-alt text-text";
  const iconOpacity = opts.isActive ? "opacity-100" : "opacity-70";
  const extra = opts.attrs || "";
  const onClickAttr = opts.onClick ? ` onclick="${escapeHtml(opts.onClick)}"` : "";

  return `
    <button class="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${active}"${onClickAttr} ${extra}>
      ${opts.iconHtml ? `<span class="w-5 flex items-center justify-center text-lg leading-none shrink-0 ${iconOpacity}">${opts.iconHtml}</span>` : ""}
      <span class="flex-1 truncate">${label}</span>
      ${opts.isActive ? '<span class="text-accent">&#10003;</span>' : ""}
    </button>`;
}

// --- Theme Toggle ---

export function renderThemeToggle(lang: string, direction = "down"): string {
  const t = getTranslator(lang);
  const themes = [
    { id: "light", label: t("theme.light"), icon: "sun" },
    { id: "dark", label: t("theme.dark"), icon: "moon" },
    { id: "system", label: t("theme.system"), icon: "laptop" },
  ];

  const trigger = `
    <button class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-alt transition-colors border border-transparent hover:border-border h-10" aria-label="Toggle theme" title="Theme">
      <span class="w-5 flex items-center justify-center text-lg leading-none" data-theme-icon>${getLucideIcon("laptop")}</span>
      <span class="text-xs opacity-50">&#9660;</span>
    </button>`;

  const items = themes
    .map(
      (th) =>
        renderDropdownItem(th.label, {
          iconHtml: `<span class="w-5 h-5" style="display:inline-flex">${getLucideIcon(th.icon)}</span>`,
          attrs: `data-theme-option="${th.id}"`,
        })
    )
    .join("");

  return renderDropdown(trigger, items, { direction });
}

// --- Language Picker ---

export function renderLanguagePicker(
  lang: string,
  languages: Language[],
  direction = "down"
): string {
  if (languages.length < 2) return "";

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  const trigger = `
    <button class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-alt transition-colors border border-transparent hover:border-border h-10" title="Change language">
      <span class="flex items-center justify-center text-lg leading-none">${renderIcon(currentLang.flag, "w-5 h-5 flex items-center justify-center")}</span>
      <span class="text-sm font-medium uppercase">${escapeHtml(currentLang.code)}</span>
      <span class="text-xs opacity-50">&#9660;</span>
    </button>`;

  const items = languages
    .map((l) =>
      renderDropdownItem(escapeHtml(l.name), {
        iconHtml: renderIcon(l.flag, "w-5 h-5 flex items-center justify-center"),
        isActive: l.code === lang,
        attrs: `data-lang-switch="${l.code}"`,
      })
    )
    .join("");

  return renderDropdown(trigger, items, { direction });
}

// --- Header ---

export function renderHeader(
  lang: string,
  languages: Language[],
  profile: Profile | null,
  categories: Category[]
): string {
  const t = getTranslator(lang);
  const siteName = profile ? tf(profile, "full_name", lang) || "Portfolio" : "Portfolio";
  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const overflowCategories = categories.slice(MAX_VISIBLE_CATEGORIES);

  const navLink = (href: string, label: string) =>
    `<a href="${href}" class="px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-alt transition-colors">${escapeHtml(label)}</a>`;

  let moreDropdown = "";
  if (overflowCategories.length > 0) {
    const trigger = `<button class="px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-alt transition-colors">${escapeHtml(t("nav.more"))} <span class="text-xs opacity-50">&#9660;</span></button>`;
    const items = overflowCategories
      .map((cat) => {
        const catTitle = tf(cat, "title", lang);
        return renderDropdownItem(escapeHtml(catTitle), {
          iconHtml: cat.icon ? renderIcon(cat.icon, "w-5 h-5") : undefined,
          onClick: `window.location.href='/${lang}/${cat.slug}'`,
        });
      })
      .join("");
    moreDropdown = renderDropdown(trigger, items);
  }

  return `
    <header class="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <a href="/${lang}" class="text-lg font-semibold tracking-tight hover:text-accent transition-colors">${escapeHtml(siteName)}</a>

          <nav class="hidden md:flex items-center gap-1">
            ${navLink(`/${lang}`, t("nav.home"))}
            ${navLink(`/${lang}/projects`, t("nav.projects"))}
            ${visibleCategories.map((cat) => navLink(`/${lang}/${cat.slug}`, tf(cat, "title", lang))).join("")}
            ${moreDropdown}
          </nav>

          <div class="flex items-center gap-2">
            <div class="hidden md:flex items-center gap-2">
              ${renderLanguagePicker(lang, languages)}
              ${renderThemeToggle(lang)}
            </div>
            <button data-sidebar-open class="md:hidden p-2 rounded-lg hover:bg-surface-alt transition-colors" aria-label="Open menu">
              <span class="w-6 h-6" style="display:inline-flex">${getLucideIcon("menu")}</span>
            </button>
          </div>
        </div>
      </div>
    </header>`;
}

// --- Sidebar ---

export function renderSidebar(
  lang: string,
  languages: Language[],
  categories: Category[]
): string {
  const t = getTranslator(lang);

  const sidebarLink = (href: string, label: string, iconName?: string) => {
    const iconHtml = iconName ? renderIcon(iconName, "w-5 h-5") : "";
    return `<a href="${href}" class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-alt transition-colors">${iconHtml}${escapeHtml(label)}</a>`;
  };

  const catSection =
    categories.length > 0
      ? `<div class="pt-4 pb-2"><div class="text-xs font-medium text-text-muted uppercase tracking-wider px-3">Categories</div></div>
         ${categories.map((cat) => sidebarLink(`/${lang}/${cat.slug}`, tf(cat, "title", lang), cat.icon)).join("")}`
      : "";

  return `
    <div id="sidebar-backdrop" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden hidden"></div>
    <div id="sidebar" class="fixed top-0 right-0 z-50 h-full w-72 bg-surface border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden translate-x-full">
      <div class="flex flex-col h-full">
        <div class="flex justify-end p-4">
          <button data-sidebar-close class="p-2 rounded-lg hover:bg-surface-alt transition-colors" aria-label="Close menu">
            <span class="w-6 h-6" style="display:inline-flex">${getLucideIcon("x")}</span>
          </button>
        </div>
        <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
          ${sidebarLink(`/${lang}`, t("nav.home"))}
          ${sidebarLink(`/${lang}/projects`, t("nav.projects"))}
          ${catSection}
        </nav>
        <div class="p-4 border-t border-border flex items-center justify-between gap-2">
          ${renderLanguagePicker(lang, languages, "up")}
          ${renderThemeToggle(lang, "up")}
        </div>
      </div>
    </div>`;
}

// --- Footer ---

export function renderFooter(lang: string, socials: Social[], profile: Profile | null): string {
  const t = getTranslator(lang);
  const name = profile
    ? (profile[`full_name_${lang}` as keyof Profile] as string) || profile.full_name_en
    : "Portfolio";

  const socialLinks =
    socials.length > 0
      ? `<div class="flex gap-3">${socials
          .map(
            (s) =>
              `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-surface-alt transition-colors" title="${escapeHtml(s.name)}">${
                s.icon ? renderIcon(s.icon, "w-5 h-5") : `<span class="text-sm font-medium">${escapeHtml(s.name)}</span>`
              }</a>`
          )
          .join("")}</div>`
      : "";

  return `
    <footer class="border-t border-border mt-auto">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          ${socialLinks}
          <p class="text-sm text-text-muted">&copy; ${new Date().getFullYear()} ${escapeHtml(name)}. ${t("footer.rights")}</p>
        </div>
      </div>
    </footer>`;
}

// --- Project Card ---

export function renderProjectCard(project: Project, lang: string): string {
  const title = tf(project, "title", lang) || project.title_en;
  const tagline = tf(project, "tagline", lang);
  const technologies = project.expand?.technologies ?? [];

  const thumbnailHtml = project.thumbnail
    ? `<div class="relative aspect-video bg-surface-alt overflow-hidden">
        <img src="${getFileUrl(project, project.thumbnail)}" alt="${escapeHtml(title)}" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>`
    : "";

  const techBadges =
    technologies.length > 0
      ? `<div class="flex flex-wrap gap-1.5">${technologies
          .map((skill: Skill) => {
            const skillName = tf(skill, "name", lang) || skill.name_en;
            return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-alt text-xs text-text-muted">${
              skill.icon ? renderIcon(skill.icon, "w-3.5 h-3.5") : ""
            }${escapeHtml(skillName)}</span>`;
          })
          .join("")}</div>`
      : "";

  return `
    <a href="/${lang}/projects/${project.slug}" class="group block rounded-xl border border-border overflow-hidden hover:border-accent/40 hover:shadow-lg transition-all duration-300">
      ${thumbnailHtml}
      <div class="p-5">
        <h3 class="font-semibold text-lg mb-1 group-hover:text-accent transition-colors">${escapeHtml(title)}</h3>
        ${tagline ? `<p class="text-sm text-text-muted mb-3 line-clamp-2">${escapeHtml(tagline)}</p>` : ""}
        ${techBadges}
      </div>
    </a>`;
}

// --- Item Card ---

export function renderItemCard(item: Item, resources: Resource[], lang: string): string {
  const title = tf(item, "title", lang) || item.title_en;
  const description = tf(item, "description", lang);
  const filteredResources = resources.filter((r) => {
    if (!r.lang) return true;
    const code = r.expand?.lang?.code;
    return !code || code === lang;
  });
  const hasContent = !!description || filteredResources.length > 0;

  const preview = !hasContent
    ? ""
    : `<div data-expandable-preview>
        ${description ? `<div class="mt-2 text-sm text-text-muted line-clamp-2"><div class="rich-text">${description}</div></div>` : ""}
        ${filteredResources.length > 0 ? `<div class="mt-3"><span class="inline-flex items-center gap-1 text-xs text-text-muted bg-surface-alt px-2 py-1 rounded-full">${renderIcon("lucide:paperclip", "w-4 h-4")} ${filteredResources.length}</span></div>` : ""}
      </div>`;

  const expandedContent = !hasContent
    ? ""
    : `<div class="px-5 pb-5 border-t border-border pt-4 space-y-4 hidden" data-expandable-content>
        ${description ? `<div class="rich-text">${description}</div>` : ""}
        ${filteredResources.length > 0 ? renderResourceList(resources, lang) : ""}
      </div>`;

  const chevron = hasContent
    ? `<button class="shrink-0 mt-1 text-text-muted hover:text-text transition-colors" aria-label="Expand">
        <span class="w-5 h-5 inline-flex transition-transform duration-200" data-expandable-chevron>${getLucideIcon("chevron-down")}</span>
      </button>`
    : "";

  return `
    <div class="rounded-xl border border-border overflow-hidden hover:border-accent/40 transition-colors" data-expandable>
      <div class="p-5 ${hasContent ? "cursor-pointer" : ""}" data-expandable-trigger>
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-semibold text-lg">${escapeHtml(title)}</h3>
          ${chevron}
        </div>
        ${preview}
      </div>
      ${expandedContent}
    </div>`;
}

// --- Resource List ---

const resourceTypeIcons: Record<string, string> = {
  document: "file-text",
  image: "image",
  video: "video",
  link: "link",
  code: "code",
};

export function renderResourceList(resources: Resource[], lang: string): string {
  const filtered = resources.filter((r) => {
    if (!r.lang) return true;
    const code = r.expand?.lang?.code;
    return !code || code === lang;
  });

  if (filtered.length === 0) return "";

  return `<div class="space-y-2">${filtered
    .map((resource) => {
      const title = tf(resource, "title", lang) || resource.title_en;
      const iconKey = resourceTypeIcons[resource.type] || "paperclip";
      const href = resource.file
        ? getFileUrl(resource, resource.file)
        : resource.url || "#";

      return `
        <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent/40 hover:bg-surface-alt transition-all group">
          <span class="w-5 h-5 text-text-muted" style="display:inline-flex">${getLucideIcon(iconKey)}</span>
          <span class="flex-1 text-sm font-medium group-hover:text-accent transition-colors">${escapeHtml(title)}</span>
          <span class="text-xs text-text-muted uppercase">${resource.type}</span>
        </a>`;
    })
    .join("")}</div>`;
}

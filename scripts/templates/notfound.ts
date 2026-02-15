import { renderPage } from "./base.js";

export function renderNotFound(opts: { faviconUrl?: string; accentCss?: string | null; siteUrl?: string }): string {
  const content = `
    <div class="min-h-screen flex items-center justify-center p-8">
      <div class="text-center max-w-md">
        <div class="text-8xl font-bold text-accent mb-4">404</div>
        <p class="text-text-muted text-lg mb-8">This page doesn't exist.</p>
        <a href="/" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors">Go home</a>
      </div>
    </div>`;

  return renderPage({
    title: "404 - Not Found",
    description: "Personal portfolio",
    faviconUrl: opts.faviconUrl,
    accentCss: opts.accentCss,
    siteUrl: opts.siteUrl,
    content,
  });
}

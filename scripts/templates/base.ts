import { iconsScript } from "./icons.js";

interface PageOpts {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  faviconUrl?: string;
  accentCss?: string | null;
  siteUrl?: string;
  content: string;
  lang?: string;
}

export function renderPage(opts: PageOpts): string {
  const {
    title = "Portfolio",
    description = "Personal portfolio",
    ogImage,
    ogType = "website",
    faviconUrl,
    accentCss,
    siteUrl = "",
    content,
    lang = "en",
  } = opts;

  const faviconTag = faviconUrl ? `<link rel="icon" href="${faviconUrl}">` : "";

  const ogImageTags = ogImage
    ? `<meta property="og:image" content="${ogImage}">
    <meta name="twitter:image" content="${ogImage}">`
    : "";

  const twitterCard = ogImage ? "summary_large_image" : "summary";

  const accentStyle = accentCss ? `<style>${accentCss}</style>` : "";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${faviconTag}
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="${ogType}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ""}
  ${siteUrl ? `<meta property="og:url" content="${siteUrl}">` : ""}
  <meta name="twitter:card" content="${twitterCard}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ""}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  ${accentStyle}
  <script>
    (function() {
      var theme = localStorage.getItem("theme") || "system";
      if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.documentElement.classList.add("dark");
      }
    })();
  </script>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body class="font-sans antialiased bg-surface text-text min-h-screen">
  ${content}
  ${iconsScript()}
  <script src="/js/main.js"></script>
</body>
</html>`;
}

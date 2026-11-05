import path from 'node:path';

const MIME_TYPES = {
  '.avif': 'image/avif',
  '.css': 'text/css;charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html;charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript;charset=utf-8',
  '.json': 'application/json;charset=utf-8',
  '.map': 'application/json;charset=utf-8',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain;charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const MODULE_SCRIPT =
  /<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']\/src\/main\.jsx["'][^>]*>\s*<\/script>/i;
const THEME_SCRIPT = /<script\b[^>]*\bsrc=["']\/theme-init\.js["'][^>]*>\s*<\/script>/i;
const FONT_PRELOAD = /<link\b[^>]*\brel=["']preload["'][^>]*\bas=["']font["'][^>]*>/i;
const FAVICON = /<link\b[^>]*\brel=["']icon["'][^>]*>/i;
const APP_PLACEHOLDER = '<!--electric-cards-portable-app-->';
const BLOCKED_EXTENSION = /\.(?:css|html|map)$/i;

export function mimeTypeFor(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

export function toDataUri(source, mimeType) {
  const buffer = Buffer.isBuffer(source) ? source : Buffer.from(source);
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export function escapeInlineScript(source) {
  return String(source)
    .replace(/<!--/g, '<\\!--')
    .replace(/<\/(script)/gi, '<\\/$1');
}

export function escapeInlineStyle(source) {
  return String(source).replace(/<\/(style)/gi, '<\\/$1');
}

function isEmbeddedUrl(url) {
  return !url || url.startsWith('data:') || url.startsWith('#') || url.startsWith('about:');
}

function replaceOnce(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`No se encontró ${label} en index.html`);
  return html.replace(pattern, () => replacement);
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function inlineCssUrls(css, resolveUrl) {
  return String(css).replace(
    /url\(\s*(?:(["'])([\s\S]*?)\1|([^'")]*))\s*\)/gi,
    (match, _quote, quoted, unquoted) => {
      const url = (quoted ?? unquoted ?? '').trim();
      if (isEmbeddedUrl(url)) return match;
      const dataUri = resolveUrl(url);
      return dataUri ? `url("${dataUri}")` : match;
    },
  );
}

function bundleAssets(bundle) {
  return Object.entries(bundle)
    .filter(
      ([fileName, output]) => output.type === 'asset' && !BLOCKED_EXTENSION.test(fileName),
    )
    .map(([fileName, output]) => ({
      fileName,
      dataUri: toDataUri(output.source, mimeTypeFor(fileName)),
    }))
    .sort((left, right) => right.fileName.length - left.fileName.length);
}

export function inlineBundleAssetUrls(source, bundle) {
  let result = String(source);
  for (const { fileName, dataUri } of bundleAssets(bundle)) {
    for (const reference of [`./${fileName}`, `/${fileName}`, fileName]) {
      result = result.split(reference).join(dataUri);
    }
  }
  return result;
}

export function findBundleAssetReferences(source, bundle) {
  const text = String(source);
  return bundleAssets(bundle)
    .map(({ fileName }) => fileName)
    .filter(
      (fileName) =>
        text.includes(fileName) ||
        text.includes(`/${fileName}`) ||
        text.includes(`./${fileName}`),
    );
}

export function buildPortableHtml({
  template,
  script,
  style,
  themeInit,
  faviconDataUri,
  licenseText,
}) {
  let html = String(template);
  html = replaceOnce(html, FONT_PRELOAD, '', 'el precargado de la fuente');
  html = replaceOnce(
    html,
    FAVICON,
    `<link rel="icon" type="image/svg+xml" href="${faviconDataUri}" />`,
    'el icono del documento',
  );
  html = replaceOnce(
    html,
    THEME_SCRIPT,
    `<script>${escapeInlineScript(themeInit)}</script>`,
    'el script de tema',
  );
  html = replaceOnce(html, MODULE_SCRIPT, APP_PLACEHOLDER, 'el script de la aplicación');
  html = replaceOnce(
    html,
    /<\/head>/i,
    `<style>\n${escapeInlineStyle(style)}\n</style>\n</head>`,
    'el cierre de head',
  );
  html = replaceOnce(
    html,
    /<\/body>/i,
    `<template id="font-licenses">\n<pre>${escapeHtml(licenseText)}</pre>\n</template>\n</body>`,
    'el cierre de body',
  );
  if (!html.includes(APP_PLACEHOLDER)) {
    throw new Error('No se pudo insertar el script de la aplicación');
  }
  return html.replace(APP_PLACEHOLDER, () => `<script>${escapeInlineScript(script)}</script>`);
}

export function auditPortableHtml(html) {
  const document = String(html);
  const issues = [];
  if (/<script\b[^>]*\btype=["']module["']/i.test(document)) {
    issues.push('script de módulo: el HTML debe usar JavaScript clásico');
  }
  const resourceTag =
    /<(script|link|img|source|video|audio|iframe|track|object|embed)\b[^>]*>/gi;
  for (const match of document.matchAll(resourceTag)) {
    const tag = match[0];
    const external =
      /\bsrc\s*=\s*["'](?!data:|#)/i.test(tag) ||
      /\bhref\s*=\s*["'](?!data:|#)/i.test(tag) ||
      /\bsrcset\s*=\s*["'](?!data:)/i.test(tag);
    if (external)
      issues.push(`${match[1].toLowerCase()} con recurso externo: ${tag.slice(0, 120)}`);
  }
  if (/<link\b[^>]*\brel=["']stylesheet["']/i.test(document)) {
    issues.push('link stylesheet externo: el CSS debe estar incrustado');
  }
  for (const styleMatch of document.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = styleMatch[1];
    if (/@import\b/i.test(css)) issues.push('CSS con @import externo');
    for (const urlMatch of css.matchAll(/url\(\s*(?:(["'])([\s\S]*?)\1|([^'")]*))\s*\)/gi)) {
      const url = (urlMatch[2] ?? urlMatch[3] ?? '').trim();
      if (!isEmbeddedUrl(url)) issues.push(`CSS con url sin empaquetar: ${url}`);
    }
  }
  const markup = document
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  if (/\b(?:src|href)\s*=\s*["'](?:https?:)?\/\//i.test(markup)) {
    issues.push('URL externa en el marcado');
  }
  if (/(?:\/assets\/|\/fonts\/|\/icons\/|\/src\/)/.test(markup)) {
    issues.push('ruta de recurso sin empaquetar en el marcado');
  }
  if (/sourceMappingURL/i.test(document)) issues.push('referencia a source map en el HTML');
  return issues;
}

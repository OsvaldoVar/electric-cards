import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {
  auditPortableHtml,
  buildPortableHtml,
  findBundleAssetReferences,
  inlineBundleAssetUrls,
  inlineCssUrls,
  mimeTypeFor,
  toDataUri,
} from './scripts/portable/single-file.js';

const OUTPUT_FILE = 'Electric-Cards.html';
const OUTPUT_DIR = 'dist-portable';

function readRequired(root, relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`El empaquetado portable necesita ${relativePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function createPublicResolver(root, assetDirectory = '') {
  const publicDir = path.join(root, 'public');
  return (url) => {
    if (!url || url.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(url)) return null;
    let reference = url;
    if (!reference.startsWith('/')) {
      reference = path.posix.normalize(path.posix.join(assetDirectory, reference));
      if (reference.startsWith('..')) return null;
      reference = `/${reference}`;
    }
    const [pathname] = reference.split(/[?#]/);
    let decoded;
    try {
      decoded = decodeURIComponent(pathname);
    } catch {
      return null;
    }
    const filePath = path.resolve(publicDir, `.${decoded}`);
    const relative = path.relative(publicDir, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
    return toDataUri(fs.readFileSync(filePath), mimeTypeFor(filePath));
  };
}

function portableSingleFile() {
  let root = process.cwd();
  let outDir = path.join(root, OUTPUT_DIR);
  let builtBundle;

  return {
    name: 'electric-cards:portable-single-file',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(root, config.build.outDir);
    },
    writeBundle(_options, bundle) {
      builtBundle = bundle;
    },
    closeBundle() {
      if (!builtBundle) return;
      const bundle = builtBundle;
      builtBundle = undefined;
      const relativeOutDir = path.relative(root, outDir);
      if (
        outDir === root ||
        relativeOutDir.startsWith('..') ||
        path.isAbsolute(relativeOutDir)
      ) {
        throw new Error(`Salida portable no segura: ${outDir}`);
      }

      const chunks = Object.values(bundle).filter((output) => output.type === 'chunk');
      const cssAssets = Object.values(bundle).filter(
        (output) => output.type === 'asset' && output.fileName.endsWith('.css'),
      );
      if (chunks.length !== 1) {
        throw new Error(
          `Se esperaba un único chunk para el HTML portable y hay ${chunks.length}`,
        );
      }

      let script = inlineBundleAssetUrls(chunks[0].code, bundle);
      const style = cssAssets
        .map((asset) => {
          const assetDirectory = path.posix.dirname(asset.fileName);
          const css = inlineBundleAssetUrls(String(asset.source), bundle);
          return inlineCssUrls(css, createPublicResolver(root, assetDirectory));
        })
        .join('\n');

      const remaining = [
        ...findBundleAssetReferences(script, bundle),
        ...findBundleAssetReferences(style, bundle),
      ];
      if (remaining.length) {
        throw new Error(`Recursos sin empaquetar: ${[...new Set(remaining)].join(', ')}`);
      }

      const licenseText = [
        'Pixelify Sans · SIL Open Font License 1.1',
        readRequired(root, 'public/fonts/Pixelify-OFL.txt').trim(),
        'Signika · SIL Open Font License 1.1',
        readRequired(root, 'public/fonts/OFL.txt').trim(),
      ].join('\n\n');

      const html = buildPortableHtml({
        template: readRequired(root, 'index.html'),
        script,
        style,
        themeInit: readRequired(root, 'public/theme-init.js'),
        faviconDataUri: toDataUri(
          fs.readFileSync(path.join(root, 'public/icons/bolt.svg')),
          'image/svg+xml',
        ),
        licenseText,
      });
      const issues = auditPortableHtml(html);
      if (issues.length) {
        throw new Error(`El HTML portable no es autocontenido:\n- ${issues.join('\n- ')}`);
      }

      fs.rmSync(outDir, { recursive: true, force: true });
      fs.mkdirSync(outDir, { recursive: true });
      const outputPath = path.join(outDir, OUTPUT_FILE);
      fs.writeFileSync(outputPath, html, 'utf8');
      this.info?.(`HTML portable generado: ${path.relative(root, outputPath)}`);
    },
  };
}

export default defineConfig({
  base: './',
  define: {
    'import.meta.env.VITE_PORTABLE': 'true',
  },
  plugins: [react(), portableSingleFile()],
  build: {
    outDir: OUTPUT_DIR,
    emptyOutDir: true,
    assetsInlineLimit: Infinity,
    chunkSizeWarningLimit: 2000,
    cssCodeSplit: false,
    modulePreload: false,
    sourcemap: false,
    reportCompressedSize: false,
    target: 'es2018',
    rolldownOptions: {
      // Vite still injects its dynamic-import preload helper, which references
      // import.meta even when code splitting and module preloading are disabled.
      // Replace it explicitly for the classic IIFE output; more specific Vite
      // defines such as import.meta.env.* keep precedence.
      transform: {
        define: { 'import.meta': '({})' },
      },
      output: {
        format: 'iife',
        name: 'ElectricCardsPortable',
        codeSplitting: false,
        entryFileNames: 'app.js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});

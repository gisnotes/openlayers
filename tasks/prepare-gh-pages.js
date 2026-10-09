/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const siteBuildDir = path.resolve(rootDir, 'site/build');
const examplesBuildDir = path.resolve(rootDir, 'build/examples');
const isLocal = process.argv.includes('--local');
const outDir = isLocal
  ? path.resolve(rootDir, 'build/site-dist')
  : path.resolve(rootDir, 'build/gh-pages-dist');

// 1. Ensure clean output directory
fs.rmSync(outDir, {recursive: true, force: true});
fs.mkdirSync(outDir, {recursive: true});

// 2. Copy site/build (homepage, docs, theme, etc.) to outDir root
fs.cpSync(siteBuildDir, outDir, {recursive: true});

// 2.1 Copy real src/ol/ol.css to theme/ol.css (resolving Windows symlink issue)
fs.copyFileSync(
  path.resolve(rootDir, 'src/ol/ol.css'),
  path.join(outDir, 'theme/ol.css'),
);

// 3. Copy build/examples to outDir/examples and outDir/en/latest/examples
fs.mkdirSync(path.join(outDir, 'en', 'latest'), {recursive: true});
fs.cpSync(examplesBuildDir, path.join(outDir, 'examples'), {recursive: true});
fs.cpSync(examplesBuildDir, path.join(outDir, 'en', 'latest', 'examples'), {
  recursive: true,
});

// 4. Create .nojekyll to bypass Jekyll processing on GitHub Pages
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

// 5. Rewrite links in HTML files (for GitHub Pages: add /openlayers; for local: clean root /)
const repoPath = isLocal ? '' : '/openlayers';
function processHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processHtmlFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (isLocal) {
        content = content
          .replaceAll('href="/openlayers/"', 'href="/"')
          .replaceAll('href="/openlayers"', 'href="/"')
          .replaceAll("href='/openlayers/'", "href='/'")
          .replaceAll("href='/openlayers'", "href='/'");
      } else {
        content = content
          .replaceAll('href="/theme/', `href="${repoPath}/theme/`)
          .replaceAll("href='/theme/", `href='${repoPath}/theme/`)
          .replaceAll('src="/theme/', `src="${repoPath}/theme/`)
          .replaceAll("src='/theme/", `src='${repoPath}/theme/`)
          .replaceAll('href="/doc/', `href="${repoPath}/doc/`)
          .replaceAll("href='/doc/", `href='${repoPath}/doc/`)
          .replaceAll('href="/download/', `href="${repoPath}/download/`)
          .replaceAll("href='/download/", `href='${repoPath}/download/`)
          .replaceAll('href="/3rd-party/', `href="${repoPath}/3rd-party/`)
          .replaceAll("href='/3rd-party/", `href='${repoPath}/3rd-party/`)
          .replaceAll('href="/en/', `href="${repoPath}/en/`)
          .replaceAll("href='/en/", `href='${repoPath}/en/`)
          .replaceAll('href="/"', `href="${repoPath}/"`)
          .replaceAll("href='/'", `href='${repoPath}/'`);
      }
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}
processHtmlFiles(outDir);
console.log('Successfully prepared gh-pages distribution in:', outDir);

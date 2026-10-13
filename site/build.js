import inPlace from '@metalsmith/in-place';
import layouts from '@metalsmith/layouts';
import markdown from '@metalsmith/markdown';
import alias from '@rollup/plugin-alias';
import common from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import Metalsmith from 'metalsmith';
import fs from 'node:fs';
import {dirname, resolve} from 'node:path';
import {env} from 'node:process';
import {fileURLToPath} from 'node:url';
import {rollup} from 'rollup';

const baseDir = dirname(fileURLToPath(import.meta.url));

function copySummaryFiles() {
  const summarySrc = resolve(baseDir, 'summary');
  const targetDir = resolve(baseDir, 'src/summary');
  if (fs.existsSync(summarySrc)) {
    fs.mkdirSync(targetDir, {recursive: true});
    const files = fs.readdirSync(summarySrc);
    for (const file of files) {
      if (file.endsWith('.md')) {
        fs.copyFileSync(resolve(summarySrc, file), resolve(targetDir, file));
      }
    }
  }
}

function cleanSummaryFiles() {
  const targetDir = resolve(baseDir, 'src/summary');
  if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        fs.unlinkSync(resolve(targetDir, file));
      }
    }
  }
}

copySummaryFiles();

const builder = Metalsmith(baseDir)
  .source('./src')
  .destination('./build')
  .clean(true)
  .metadata({
    version: env.OL_VERSION || 'dev',
  })
  .use(inPlace({transform: 'handlebars', extname: '.hbs'}))
  .use(markdown())
  .use(
    layouts({
      directory: 'layouts',
      transform: 'handlebars',
      default: 'default.hbs',
      pattern: '**/*.(html|hbs|md)',
    }),
  );

builder.build(async (err) => {
  cleanSummaryFiles();
  if (err) {
    throw err;
  }
  await bundleMain();
});

async function bundleMain() {
  const inputOptions = {
    plugins: [
      common(),
      nodeResolve({
        modulePaths: [
          resolve(baseDir, '../src'),
          resolve(baseDir, '../node_modules'),
        ],
      }),
      alias({
        entries: [{find: 'ol', replacement: '../../../src/ol/'}],
      }),
      terser(),
    ],
    input: resolve(baseDir, './build/main.js'),
  };

  const outputOptions = {
    dir: resolve(baseDir, './build'),
    format: 'iife',
  };

  const bundle = await rollup(inputOptions);
  await bundle.write(outputOptions);
  bundle.close();
}

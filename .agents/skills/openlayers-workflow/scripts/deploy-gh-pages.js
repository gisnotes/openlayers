#!/usr/bin/env node
/* eslint-disable no-console */
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../..');
const ghPagesDist = path.resolve(rootDir, 'build/gh-pages-dist');
const gitIndexFile = path.resolve(rootDir, '.git/gh-pages-index');

if (!fs.existsSync(ghPagesDist)) {
  console.error('Error: build/gh-pages-dist does not exist. Please run tasks/prepare-gh-pages.js first.');
  process.exit(1);
}

const msgArg = process.argv.slice(2).join(' ').trim();
const commitMessage = msgArg || 'Deploy updates to GitHub Pages';

function run(cmd, envExtra = {}) {
  return execSync(cmd, {
    cwd: rootDir,
    encoding: 'utf8',
    env: {...process.env, ...envExtra},
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

console.log('1. Fetching latest origin/gh-pages...');
try {
  run('git fetch origin gh-pages');
} catch (err) {
  console.warn('Warning: git fetch failed, continuing...', err.message);
}

// Clean up any stale files
const innerGit = path.join(ghPagesDist, '.git');
if (fs.existsSync(innerGit)) {
  fs.rmSync(innerGit, {recursive: true, force: true});
}
if (fs.existsSync(gitIndexFile)) {
  fs.rmSync(gitIndexFile, {force: true});
}

try {
  console.log('2. Staging gh-pages distribution tree...');
  run(`git --work-tree="${ghPagesDist}" add -A`, {GIT_INDEX_FILE: gitIndexFile});

  console.log('3. Writing git tree...');
  const tree = run('git write-tree', {GIT_INDEX_FILE: gitIndexFile});
  console.log('   Tree SHA:', tree);

  console.log('4. Creating commit object on top of origin/gh-pages...');
  const commit = run(`git commit-tree ${tree} -p origin/gh-pages -m "${commitMessage}"`);
  console.log('   Commit SHA:', commit);

  console.log('5. Pushing to origin/gh-pages...');
  run(`git push origin "${commit}:refs/heads/gh-pages"`);

  console.log('\nDeployment succeeded!');
  console.log('Online URL: https://gisnotes.github.io/openlayers/');
} finally {
  if (fs.existsSync(gitIndexFile)) {
    fs.rmSync(gitIndexFile, {force: true});
  }
}

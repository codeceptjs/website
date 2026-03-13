#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function run(command, opts = {}) {
  execSync(command, {
    stdio: 'inherit',
    shell: true,
    ...opts,
  });
}

function writeCname(distDir) {
  const cnamePath = path.join(distDir, 'CNAME');
  fs.writeFileSync(cnamePath, 'codecept.io\n', 'utf8');
}

function update() {
  run('npm run sync:changelog');
  run('npm run generate:unified-api');
}

function serve() {
  run('npm run dev');
}

function publish() {
  run('npm i');
  run('npm run build');

  const distDir = path.join(process.cwd(), 'dist');
  writeCname(distDir);

  run('git init', { cwd: distDir });
  run('git remote add origin git@github.com:codeceptjs/codeceptjs.github.io.git', { cwd: distDir });
  run('git checkout -b deploy', { cwd: distDir });
  run('git reset --soft HEAD~$(git rev-list --count HEAD ^master)', { cwd: distDir });
  run('git add -A', { cwd: distDir });
  run('git commit -m "deploy"', { cwd: distDir });
  run('git push -f origin deploy:master', { cwd: distDir });
}

const command = process.argv[2];

switch (command) {
  case 'update':
    update();
    break;
  case 'serve':
    serve();
    break;
  case 'publish':
    publish();
    break;
  default:
    console.error('Usage: ./runok.js <update|serve|publish>');
    process.exit(1);
}

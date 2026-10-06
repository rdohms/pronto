import { createWriteStream } from 'fs';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import archiver from 'archiver';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const version = pkg.version;
const outputPath = `dist/extension-${version}.zip`;

import { mkdirSync } from 'fs';
mkdirSync('dist', { recursive: true });

const output = createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ Packaged: ${outputPath} (${archive.pointer()} bytes)`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory('extension/', false);
archive.finalize();

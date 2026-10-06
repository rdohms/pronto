import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { readdirSync, statSync } from 'fs';

// Build alias map: map every 'src/js/foo.js' → absolute path to 'src/js/foo.ts'
// This allows Vitest to resolve TypeScript .js imports in test files
function buildSrcAliases(dir: string, prefix: string): Record<string, string> {
  const aliases: Record<string, string> = {};
  try {
    for (const file of readdirSync(dir)) {
      const fullPath = resolve(dir, file);
      if (statSync(fullPath).isDirectory()) {
        Object.assign(aliases, buildSrcAliases(fullPath, `${prefix}/${file}`));
      } else if (file.endsWith('.ts')) {
        const baseName = file.slice(0, -3);
        // Map 'src/..../file.js' → absolute .ts path
        aliases[`${prefix}/${baseName}.js`] = fullPath;
      }
    }
  } catch {
    // ignore
  }
  return aliases;
}

const srcDir = resolve(__dirname, 'src');
const srcAliases = buildSrcAliases(srcDir, '/src');

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/js/pronto-*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': srcDir,
      ...srcAliases,
    },
  },
  root: resolve(__dirname),
});

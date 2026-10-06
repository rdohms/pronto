import { defineConfig } from 'vite';
import { resolve } from 'path';
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { dirname } from 'path';

function generateIcons(watchFn?: (id: string) => void) {
  const SIZES = [16, 48, 128];
  const srcImage = resolve(__dirname, 'src/images/logo.png');
  const destDir = resolve(__dirname, 'extension/resources');

  if (!existsSync(srcImage)) return;
  if (watchFn) watchFn(srcImage);
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

  const hasCmd = (cmd: string) => {
    try {
      execSync(`which ${cmd}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  };

  const isMac = process.platform === 'darwin' && hasCmd('sips');
  const hasMagick = hasCmd('magick');
  const hasConvert = hasCmd('convert');

  for (const size of SIZES) {
    const dest = resolve(destDir, `icon${size}.png`);
    const needsBuild = !existsSync(dest) || statSync(srcImage).mtimeMs > statSync(dest).mtimeMs;
    if (needsBuild) {
      if (isMac) {
        execSync(`sips -z ${size} ${size} "${srcImage}" --out "${dest}"`, { stdio: 'ignore' });
      } else if (hasMagick) {
        execSync(`magick "${srcImage}" -resize ${size}x${size} "${dest}"`, { stdio: 'ignore' });
      } else if (hasConvert) {
        execSync(`convert "${srcImage}" -resize ${size}x${size} "${dest}"`, { stdio: 'ignore' });
      }
    }
  }
}

export default defineConfig(({ mode }) => ({
  build: {
    outDir: 'extension/build',
    emptyOutDir: true,
    sourcemap: mode === 'development',
    minify: mode === 'production',
    rollupOptions: {
      input: {
        'js/pronto-popup': resolve(__dirname, 'src/js/pronto-popup.ts'),
        'js/pronto-content': resolve(__dirname, 'src/js/pronto-content.ts'),
        'js/pronto-options': resolve(__dirname, 'src/js/pronto-options.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'js/chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? '';
          if (/\.css$/.test(name)) return 'css/[name][extname]';
          if (/\.(png|jpg|svg|gif|ico)$/.test(name)) return 'resources/[name][extname]';
          if (/\.(woff2?|ttf|eot|otf)$/.test(name)) return 'fonts/[name][extname]';
          return '[name][extname]';
        },
      },
    },
  },
  plugins: [
    {
      name: 'generate-extension-icons',
      buildStart() {
        generateIcons((file) => this.addWatchFile(file));
      },
    },
    {
      name: 'copy-extension-assets',
      closeBundle() {
        // Copy HTML templates
        const htmlSrc = resolve(__dirname, 'src/html');
        const htmlDest = resolve(__dirname, 'extension/build/html');
        if (!existsSync(htmlDest)) mkdirSync(htmlDest, { recursive: true });
        for (const file of ['popup.html', 'options.html']) {
          const src = resolve(htmlSrc, file);
          if (existsSync(src)) copyFileSync(src, resolve(htmlDest, file));
        }

        // Copy CSS files
        const cssSrc = resolve(__dirname, 'src/css');
        const cssDest = resolve(__dirname, 'extension/build/css');
        if (existsSync(cssSrc)) {
          if (!existsSync(cssDest)) mkdirSync(cssDest, { recursive: true });
          for (const file of readdirSync(cssSrc)) {
            if (file.endsWith('.css')) {
              copyFileSync(resolve(cssSrc, file), resolve(cssDest, file));
            }
          }
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}));

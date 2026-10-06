import { existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

const SIZES = [16, 48, 128];
const SRC_IMAGE = resolve('src/images/logo.png');
const DEST_DIR = resolve('extension/resources');

if (!existsSync(SRC_IMAGE)) {
  console.error(`Source image not found: ${SRC_IMAGE}`);
  process.exit(1);
}

mkdirSync(DEST_DIR, { recursive: true });

function hasCommand(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const isMac = process.platform === 'darwin' && hasCommand('sips');
const hasMagick = hasCommand('magick');
const hasConvert = hasCommand('convert');

for (const size of SIZES) {
  const dest = resolve(DEST_DIR, `icon${size}.png`);
  if (isMac) {
    execSync(`sips -z ${size} ${size} "${SRC_IMAGE}" --out "${dest}"`, { stdio: 'ignore' });
  } else if (hasMagick) {
    execSync(`magick "${SRC_IMAGE}" -resize ${size}x${size} "${dest}"`, { stdio: 'ignore' });
  } else if (hasConvert) {
    execSync(`convert "${SRC_IMAGE}" -resize ${size}x${size} "${dest}"`, { stdio: 'ignore' });
  } else if (!existsSync(dest)) {
    console.warn(`⚠️ Cannot resize image: no 'sips' or 'ImageMagick' found to generate ${dest}`);
  }
}

console.log('✅ Extension icons ready in extension/resources/');

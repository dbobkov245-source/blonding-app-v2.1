#!/usr/bin/env node

/**
 * Скрипт для синхронизации версии между package.json и manifest.json
 * Автоматически запускается перед сборкой
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

try {
    // Читаем версию из package.json
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const version = packageJson.version;

    console.log(`📦 Current version: ${version}`);

    // Обновляем manifest.json
    const manifestPath = join(rootDir, 'public', 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.version = version;
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated manifest.json version to ${version}`);

    // Обновляем sw-custom.js
    const swCustomPath = join(rootDir, 'public', 'sw-custom.js');
    let swContent = readFileSync(swCustomPath, 'utf8');
    swContent = swContent.replace(
        /const APP_VERSION = 'v[\d.]+';/,
        `const APP_VERSION = 'v${version}';`
    );
    writeFileSync(swCustomPath, swContent, 'utf8');
    console.log(`✅ Updated sw-custom.js version to v${version}`);

    console.log('🎉 Version sync completed!');
} catch (error) {
    console.error('❌ Error syncing version:', error);
    process.exit(1);
}

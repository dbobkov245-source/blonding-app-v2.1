import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'FULL_PROJECT_CODE.md');

// Configuration
const dirsToInclude = ['src', 'api', 'scripts', 'lessons'];
const filesToInclude = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'tailwind.config.cjs',
    'postcss.config.cjs',
    '.eslintrc.json',
    'README.md',
    'vercel.json'
];

const excludeDirs = ['node_modules', '.next', '.git', 'generated'];
const excludeExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.mp3', '.wav', '.pdf', '.DS_Store', '.lock'];
const excludeFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'FULL_PROJECT_CODE.md'];

// Helper to determine language for markdown code block
function getLanguage(ext) {
    switch (ext) {
        case '.js': return 'javascript';
        case '.jsx': return 'jsx';
        case '.ts': return 'typescript';
        case '.tsx': return 'tsx';
        case '.css': return 'css';
        case '.scss': return 'scss';
        case '.html': return 'html';
        case '.json': return 'json';
        case '.md': return 'markdown';
        case '.sh': return 'bash';
        case '.yml':
        case '.yaml': return 'yaml';
        default: return '';
    }
}

let outputContent = `# Full Project Code\n\nGenerated on: ${new Date().toISOString()}\n\n`;

function processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    if (excludeExtensions.includes(ext) || excludeFiles.includes(fileName)) {
        return;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(rootDir, filePath);
        const language = getLanguage(ext);

        outputContent += `## File: ${relativePath}\n\n`;
        outputContent += `\`\`\`${language}\n`;
        outputContent += content;
        outputContent += `\n\`\`\`\n\n`;
        outputContent += `---\n\n`;
        console.log(`Processed: ${relativePath}`);
    } catch (err) {
        console.error(`Error reading ${filePath}: ${err.message}`);
    }
}

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!excludeDirs.includes(item)) {
                processDirectory(fullPath);
            }
        } else {
            processFile(fullPath);
        }
    }
}

// 1. Process specific root files
filesToInclude.forEach(file => {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
        processFile(fullPath);
    }
});

// 2. Process directories
dirsToInclude.forEach(dirName => {
    const fullPath = path.join(rootDir, dirName);
    processDirectory(fullPath);
});

// Write output
fs.writeFileSync(outputFile, outputContent, 'utf-8');
console.log(`\n✅ Project code dumped to: ${outputFile}`);

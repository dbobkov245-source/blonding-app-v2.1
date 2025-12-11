const fs = require('fs');
const path = require('path');

const outputFile = 'BLOND_FULL_PROJECT_CODE.md';
const rootDir = process.cwd();

const includeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.md', '.cjs', '.mjs', '.html'];
const excludeDirs = ['node_modules', '.next', '.git', '.github', 'lessons', 'fonts', 'images', 'icons'];
const excludeFiles = ['package-lock.json', 'yarn.lock', 'BLOND_FULL_PROJECT_CODE.md', 'FULL_PROJECT_CODE.md', '.DS_Store'];

const targetPaths = [
    'src',
    'scripts',
    '__tests__',
    'api',
    'public/lessons/index.json'
];

const rootFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'tailwind.config.cjs',
    'postcss.config.cjs',
    'jest.config.cjs',
    'README.md',
    '.eslintrc.json',
    'vercel.json',
    'next-env.d.ts',
    'REDESIGN_MASTERPLAN.md'
];

let output = `# Full Project Code - Blonding App v2.1\n\nGenerated: ${new Date().toISOString()}\n\n`;

function processFile(filePath) {
    try {
        const ext = path.extname(filePath);
        if (!includeExtensions.includes(ext)) return;

        if (ext === '.json' && fs.statSync(filePath).size > 50000 && !filePath.endsWith('index.json')) return;

        const content = fs.readFileSync(filePath, 'utf-8');
        const relPath = path.relative(rootDir, filePath);

        let lang = ext.slice(1);
        if (lang === 'js' || lang === 'jsx' || lang === 'cjs' || lang === 'mjs') lang = 'javascript';
        if (lang === 'ts' || lang === 'tsx') lang = 'typescript';
        if (lang === 'md') lang = 'markdown';

        output += `\n# File: ${relPath}\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
        console.log(`Included: ${relPath}`);
    } catch (e) {
        console.error(`Error processing ${filePath}: ${e.message}`);
    }
}

function processDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!excludeDirs.includes(item)) {
                processDir(fullPath);
            }
        } else {
            if (!excludeFiles.includes(item)) {
                processFile(fullPath);
            }
        }
    }
}

for (const file of rootFiles) {
    if (fs.existsSync(file)) processFile(path.join(rootDir, file));
}

for (const target of targetPaths) {
    const fullPath = path.join(rootDir, target);
    if (fs.existsSync(fullPath)) {
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

fs.writeFileSync(outputFile, output);
console.log(`\nGenerated ${outputFile} with size ${fs.statSync(outputFile).size} bytes`);

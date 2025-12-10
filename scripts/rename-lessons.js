import fs from 'fs';
import path from 'path';

const LESSONS_DIR = path.join(process.cwd(), 'lessons');

const translit = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya', ' ': '-', '.': '', ',': ''
};

function slugify(text) {
    return text.toLowerCase().trim()
        .replace(/[а-яё]/g, (char) => translit[char] || '')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else {
            const ext = path.extname(file);
            const name = path.basename(file, ext);

            // Keep first 50 chars of the name, but make it safe
            // We also want to preserve the logical structure if possible, but safety is priority.
            let safeName = slugify(name).slice(0, 50);

            // Ensure specific lesson prefixes (like "Urok 4") are preserved if they are at the start
            // slugify handles "Urok 4" -> "urok-4"

            const newFilename = `${safeName}${ext}`;
            const newFilePath = path.join(dir, newFilename);

            if (file !== newFilename) {
                console.log(`Renaming: ${file} -> ${newFilename}`);
                fs.renameSync(filePath, newFilePath);
            }
        }
    }
}

if (fs.existsSync(LESSONS_DIR)) {
    processDirectory(LESSONS_DIR);
    console.log('Renaming complete.');
} else {
    console.error('Lessons directory not found.');
}

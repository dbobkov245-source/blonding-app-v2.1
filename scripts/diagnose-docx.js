
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

const lessonsDir = './lessons';
const MODULES = ['ФУНДАМЕНТАЛЬНАЯ ТЕОРИЯ КОЛОРИСТИКИ (ПРЕДОБУЧЕНИЕ)', 'блондирование', 'тонирование'];

async function checkFiles() {
    for (const moduleName of MODULES) {
        const moduleSourceDir = path.join(lessonsDir, moduleName);
        if (!fs.existsSync(moduleSourceDir)) continue;

        const files = fs.readdirSync(moduleSourceDir).filter(f => f.endsWith('.docx'));

        for (const file of files) {
            const filePath = path.join(moduleSourceDir, file);
            try {
                process.stdout.write(`Checking ${moduleName}/${file}... `);
                await mammoth.convertToHtml({ path: filePath });
                console.log('OK');
            } catch (err) {
                console.log('\n❌ FAILED');
                console.error(err.message);
            }
        }
    }
}

checkFiles();

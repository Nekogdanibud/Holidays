const fs = require('fs').promises;
const path = require('path');

async function getAllFiles(dirPath, excludedFolders = []) {
    let files = [];
    
    try {
        const items = await fs.readdir(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stats = await fs.stat(fullPath);
            
            if (stats.isDirectory()) {
                // Проверяем, не является ли папка исключенной
                const folderName = path.basename(fullPath);
                if (!excludedFolders.includes(folderName)) {
                    // Рекурсивно получаем файлы из подпапки
                    const subFiles = await getAllFiles(fullPath, excludedFolders);
                    files = files.concat(subFiles);
                } else {
                    console.log(`⏭️  Пропущена папка: ${folderName}`);
                }
            } else {
                files.push(fullPath);
            }
        }
    } catch (error) {
        console.log(`Ошибка чтения папки ${dirPath}:`, error.message);
    }
    
    return files;
}

async function saveAllFilesContent() {
    const srcPath = './src/components/admin';
    const outputFile = './acomponents.txt';
    
    // Исключенные файлы
    const excludedFiles = ['global.css', 'favicon.ico'];
    
    // Исключенные папки
    const excludedFolders = ['app','api', 'node_modules', 'dist', 'build', '.git', '.next', 'cache', 'temp'];
    
    try {
        console.log('🔍 Поиск файлов...');
        console.log(`⏭️  Исключенные папки: ${excludedFolders.join(', ')}`);
        console.log(`⏭️  Исключенные файлы: ${excludedFiles.join(', ')}`);
        
        const allFiles = await getAllFiles(srcPath, excludedFolders);
        
        // Фильтруем исключенные файлы
        const filteredFiles = allFiles.filter(filePath => {
            const fileName = path.basename(filePath);
            return !excludedFiles.includes(fileName);
        });
        
        console.log(`📁 Найдено файлов: ${filteredFiles.length}`);
        
        let outputContent = `ОТЧЕТ О ФАЙЛАХ\n`;
        outputContent += `Папка: ${path.resolve(srcPath)}\n`;
        outputContent += `Дата создания: ${new Date().toLocaleString()}\n`;
        outputContent += `Всего файлов: ${filteredFiles.length}\n`;
        outputContent += `Исключенные папки: ${excludedFolders.join(', ')}\n`;
        outputContent += `Исключенные файлы: ${excludedFiles.join(', ')}\n`;
        outputContent += '='.repeat(80) + '\n\n';
        
        // Обрабатываем каждый файл
        for (const filePath of filteredFiles) {
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const relativePath = path.relative(srcPath, filePath);
                
                outputContent += `\n${'='.repeat(80)}\n`;
                outputContent += `ФАЙЛ: ${relativePath}\n`;
                outputContent += `ПОЛНЫЙ ПУТЬ: ${filePath}\n`;
                outputContent += `РАЗМЕР: ${content.length} символов\n`;
                outputContent += `${'='.repeat(80)}\n\n`;
                outputContent += content;
                outputContent += '\n\n';
                
                console.log(`✓ Обработан: ${relativePath}`);
            } catch (error) {
                console.log(`✗ Ошибка чтения ${filePath}:`, error.message);
                outputContent += `\n${'='.repeat(80)}\n`;
                outputContent += `ОШИБКА ЧТЕНИЯ: ${filePath}\n`;
                outputContent += `СООБЩЕНИЕ: ${error.message}\n`;
                outputContent += `${'='.repeat(80)}\n\n`;
            }
        }
        
        // Сохраняем в файл
        await fs.writeFile(outputFile, outputContent, 'utf8');
        console.log(`\n✅ Успешно сохранено ${filteredFiles.length} файлов в ${outputFile}`);
        
    } catch (error) {
        console.log('❌ Ошибка:', error.message);
    }
}

saveAllFilesContent();

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'src/assets/icon/logo.webp');
const outputDir = path.join(__dirname, 'public/icons');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    // Створюємо папку, якщо вона не існує
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Починаємо генерацію іконок...');
    for (const size of sizes) {
      const fileName = `icon-${size}x${size}.png`;
      await sharp(inputPath)
        .resize(size, size)
        .toFormat('png')
        .toFile(path.join(outputDir, fileName));
      console.log(`✅ Сгенеровано: ${fileName}`);
    }
    console.log('Всі іконки успішно оновлені в public/icons/');
  } catch (error) {
    console.error('Помилка при генерації іконок:', error);
  }
}

generateIcons();
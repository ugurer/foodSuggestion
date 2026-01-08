const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

// iPad Pro 12.9" / 13" dimensions
const IPAD_WIDTH = 2048;
const IPAD_HEIGHT = 2732;

const ipadScreenshots = [
    'ipad_new_1.png',
    'ipad_new_2.png',
    'ipad_new_3.png',
    'ipad_new_4.png'
];

async function resizeImages() {
    console.log(`Resizing iPad images to ${IPAD_WIDTH}x${IPAD_HEIGHT}...`);

    for (const filename of ipadScreenshots) {
        const inputPath = path.join(__dirname, 'screenshots', filename);
        const outputPath = path.join(__dirname, 'screenshots', filename);

        try {
            if (!fs.existsSync(inputPath)) {
                console.error(`File not found: ${inputPath}`);
                continue;
            }

            const image = await Jimp.read(inputPath);

            await image.cover({ w: IPAD_WIDTH, h: IPAD_HEIGHT })
                .write(outputPath);

            console.log(`Successfully resized ${filename}`);
        } catch (error) {
            console.error(`Error processing ${filename}:`, error);
        }
    }
}

resizeImages();

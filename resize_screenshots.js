const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const TARGET_WIDTH = 1284;
const TARGET_HEIGHT = 2778;

const IPAD_WIDTH = 2048;
const IPAD_HEIGHT = 2732;

const screenshots = [
    'screenshot1.png',
    'screenshot2.png',
    'screenshot3.png',
    'screenshot4.png'
];

async function resizeImages() {
    console.log(`Processing images...`);

    for (const filename of screenshots) {
        const inputPath = path.join(__dirname, 'screenshots', filename);

        // iPhone path (overwrite)
        const outputPhone = path.join(__dirname, 'screenshots', filename);
        // iPad path (new)
        const outputPad = path.join(__dirname, 'screenshots', `ipad_${filename}`);

        try {
            if (!fs.existsSync(inputPath)) {
                console.error(`File not found: ${inputPath}`);
                continue;
            }

            const image = await Jimp.read(inputPath);

            // Generate iPhone
            const phoneImg = image.clone();
            await phoneImg.resize({ w: TARGET_WIDTH, h: TARGET_HEIGHT })
                .write(outputPhone);
            console.log(`Created iPhone version: ${filename}`);

            // Generate iPad
            // For iPad, we center the content on a blurred background to fill the wider aspect ratio
            // or just stretch/cover. Cover is usually fine for these abstract/UI mockups.
            const padImg = image.clone();
            await padImg.cover({ w: IPAD_WIDTH, h: IPAD_HEIGHT })
                .write(outputPad);
            console.log(`Created iPad version: ipad_${filename}`);

        } catch (error) {
            console.error(`Error processing ${filename}:`, error);
        }
    }
}

resizeImages();

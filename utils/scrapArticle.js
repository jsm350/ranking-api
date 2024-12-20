const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const path = require('path');
const express = require('express');

async function scrapeArticle(articleLink) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const imagesDir = path.join(__dirname, 'images');
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir); // Ensure the 'images' directory exists
    }

    try {
        console.log('Launching browser...');
        const page = await browser.newPage();

        // Set mobile user agent and emulate mobile device
        console.log('Setting mobile user agent and emulating mobile device...');
        await page.setUserAgent(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        );
        await page.emulate({
            viewport: { width: 375, height: 812, isMobile: true, hasTouch: true },
        });

        console.log(`Navigating to ${articleLink}...`);
        await page.goto(articleLink, { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('Extracting data...');
        const data = await page.evaluate(() => {
            let title =
                document.querySelector('h1')?.innerText ||
                document.querySelector('#cover-news-left h2')?.innerText ||
                null;

            const excerpt =
                document.querySelector('.brief-excerpt')?.innerText ||
                document.querySelector('#cover-news-left .bigger-p')?.innerText ||
                null;

            let imageUrl = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
                document.querySelector('figure img')?.src || 
                null;

            return {
                title: title || 'No title found',
                excerpt: excerpt || 'No excerpt found',
                imageUrl: imageUrl || 'No image URL found',
            };
        });

        console.log('Data extraction complete:', data);

        // If an image URL is found, download the image
        if (data.imageUrl && data.imageUrl !== 'No image URL found') {
            console.log('Downloading image...');
            const fileName = path.join(imagesDir, path.basename(new URL(data.imageUrl).pathname)); // Save to 'images' directory
            await downloadImage(data.imageUrl, fileName);
            data.localImagePath = fileName; // Add local path to the data object
            console.log(`Image saved as: ${fileName}`);
        } else {
            console.log('No image URL found to download.');
        }

        return data;
    } catch (error) {
        console.error('An error occurred:', error.message);
        return { title: null, excerpt: null, imageUrl: null, error: error.message };
    } finally {
        console.log('Closing browser...');
        await browser.close();
    }
}

// Function to download an image
function downloadImage(url, filePath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https
            .get(url, (response) => {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                } else {
                    reject(`Failed to fetch image: ${response.statusCode}`);
                }
            })
            .on('error', (err) => {
                fs.unlink(filePath, () => reject(err)); // Delete the incomplete file on error
            });
    });
}

// Set up Express server to serve images
const app = express();
const PORT = 3000;

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', async (req, res) => {
    const articleLink = req.query.link; // Accept the article link as a query parameter
    if (!articleLink) {
        return res.send('Please provide an article link using ?link=<URL>');
    }

    const data = await scrapeArticle(articleLink);

    if (data.localImagePath) {
        // Serve the image directly in the response
        return res.send(`
            <h1>${data.title}</h1>
            <p>${data.excerpt}</p>
            <img src="/images/${path.basename(data.localImagePath)}" alt="Featured Image">
        `);
    } else {
        return res.send('<p>Could not retrieve or download the image.</p>');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

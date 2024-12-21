const puppeteer = require('puppeteer');

async function scrapeArticle(articleLink) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        console.log('Launching browser...');
        const page = await browser.newPage();

        // Set mobile user agent
        console.log('Setting mobile user agent...');
        await page.setUserAgent(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        );

        // Emulate mobile device
        console.log('Emulating mobile device...');
        await page.emulate({
            viewport: {
                width: 375,
                height: 812, // iPhone X dimensions
                isMobile: true,
                hasTouch: true,
            },
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

        console.log('Replacing image URL...');
        if (data.imageUrl && data.imageUrl.startsWith('https://img-cdn.oliveoiltimes.com/')) {
            data.imageUrl = data.imageUrl.replace(
                'https://img-cdn.oliveoiltimes.com/',
                'https://oliveoilranking.org/cdn3/'
            );
        }

        console.log('Data extraction complete:', data);
        return data;
    } catch (error) {
        console.error('An error occurred:', error.message);
        return { title: null, excerpt: null, imageUrl: null, error: error.message };
    } finally {
        console.log('Closing browser...');
        await browser.close();
    }
}

module.exports = scrapeArticle;

// Example usage (replace PORT with your desired port)
const PORT = 3000;
const express = require('express');
const app = express();

app.get('/scrape', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).send('Missing "url" query parameter');
    }
    const data = await scrapeArticle(url);
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

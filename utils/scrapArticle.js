const puppeteer = require('puppeteer');

async function scrapeArticle(articleLink) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        console.log('Launching browser...');
        const page = await browser.newPage();

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

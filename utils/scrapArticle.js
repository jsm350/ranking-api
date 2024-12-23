const puppeteer = require('puppeteer');

async function scrapeArticle(articleLink) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(articleLink, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        let title = document.querySelector('h1')?.innerText || document.querySelector('#cover-news-left h2')?.innerText;
        const excerpt = document.querySelector('.brief-excerpt')?.innerText || document.querySelector('#cover-news-left .bigger-p')?.innerText;

        let imageUrl = document.querySelector('meta[property="og:image"]')?.content;

        if (!imageUrl || imageUrl === '') {
            imageUrl = document.querySelector('figure img')?.src;
        }

        return {
            title,
            excerpt,
            imageUrl,
        };
    });

    await browser.close();
    return data;
}

module.exports = scrapeArticle;
